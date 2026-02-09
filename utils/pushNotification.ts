import { Expo, ExpoPushMessage, ExpoPushTicket } from "expo-server-sdk";
import PushToken from "@/models/PushToken";

// Create a new Expo SDK client
const expo = new Expo();

/**
 * Send push notification to a single user
 * @param userId - MongoDB User ID
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Optional custom data payload
 * @param channelId - Android notification channel (default | alerts | approvals)
 */
export async function sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>,
    channelId: string = "default"
): Promise<boolean> {
    try {
        // Get user's push token from database
        const pushTokenDoc = await PushToken.findOne({ userId });

        if (!pushTokenDoc?.token) {
            console.log(`[Push] No push token found for user: ${userId}`);
            return false;
        }

        const pushToken = pushTokenDoc.token;

        // Validate token format
        if (!Expo.isExpoPushToken(pushToken)) {
            console.log(`[Push] Invalid push token: ${pushToken}`);
            return false;
        }

        // Create the message
        const message: ExpoPushMessage = {
            to: pushToken,
            sound: "default",
            title,
            body,
            data: data || {},
            channelId,
            priority: "high",
        };

        // Send the notification
        const chunks = expo.chunkPushNotifications([message]);
        const tickets: ExpoPushTicket[] = [];

        for (const chunk of chunks) {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            tickets.push(...ticketChunk);
        }

        // Check for errors
        for (const ticket of tickets) {
            if (ticket.status === "error") {
                console.error(`[Push] Error sending to ${userId}:`, ticket.message);
                return false;
            }
        }

        console.log(`[Push] Notification sent to user: ${userId}`);
        return true;
    } catch (error) {
        console.error(`[Push] Error sending notification:`, error);
        return false;
    }
}

/**
 * Send push notifications to multiple users
 * @param userIds - Array of MongoDB User IDs
 * @param title - Notification title
 * @param body - Notification body
 * @param data - Optional custom data payload
 * @param channelId - Android notification channel
 */
export async function sendPushNotificationToMany(
    userIds: string[],
    title: string,
    body: string,
    data?: Record<string, unknown>,
    channelId: string = "default"
): Promise<{ success: number; failed: number }> {
    let success = 0;
    let failed = 0;

    // Get all push tokens for the users
    const pushTokenDocs = await PushToken.find({
        userId: { $in: userIds },
    });

    if (pushTokenDocs.length === 0) {
        console.log(`[Push] No push tokens found for users`);
        return { success: 0, failed: userIds.length };
    }

    // Build messages for valid tokens
    const messages: ExpoPushMessage[] = [];
    for (const doc of pushTokenDocs) {
        if (Expo.isExpoPushToken(doc.token)) {
            messages.push({
                to: doc.token,
                sound: "default",
                title,
                body,
                data: data || {},
                channelId,
                priority: "high",
            });
        } else {
            failed++;
        }
    }

    // Send in chunks
    const chunks = expo.chunkPushNotifications(messages);

    for (const chunk of chunks) {
        try {
            const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
            for (const ticket of ticketChunk) {
                if (ticket.status === "ok") {
                    success++;
                } else {
                    failed++;
                }
            }
        } catch (error) {
            console.error(`[Push] Error sending chunk:`, error);
            failed += chunk.length;
        }
    }

    console.log(`[Push] Sent to ${success} users, failed: ${failed}`);
    return { success, failed };
}

/**
 * Send alert notification (high priority)
 */
export async function sendAlertNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>
): Promise<boolean> {
    return sendPushNotification(userId, `⚠️ ${title}`, body, data, "alerts");
}

/**
 * Send approval notification
 */
export async function sendApprovalNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, unknown>
): Promise<boolean> {
    return sendPushNotification(userId, `👆 ${title}`, body, data, "approvals");
}

export default {
    sendPushNotification,
    sendPushNotificationToMany,
    sendAlertNotification,
    sendApprovalNotification,
};
