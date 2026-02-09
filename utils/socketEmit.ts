import { io, Socket } from "socket.io-client";

// Singleton socket connection for backend to emit events
let socket: Socket | null = null;

function getSocket(): Socket {
    if (!socket) {
        // Use local lite-express-socketio for testing
        const baseUrl = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:4000";
        // Connect to the /relay namespace (no auth required for backend)
        const socketUrl = `${baseUrl}/relay`;
        console.log("[SocketEmit] Connecting to:", socketUrl);

        socket = io(socketUrl, {
            transports: ["websocket"],
            autoConnect: true,
        });

        socket.on("connect", () => {
            console.log("[SocketEmit] Connected to socket server, ID:", socket?.id);
        });

        socket.on("connect_error", (err) => {
            console.error("[SocketEmit] Connection error:", err.message);
        });
    }
    return socket;
}

/**
 * Emit a notification event to show in-app toast
 * This emits directly to the socket server which relays to all clients
 */
export function emitNotification(
    userId: string,
    title: string,
    message: string,
    type: string = "info",
    data?: Record<string, unknown>
): void {
    const s = getSocket();
    const payload = {
        userId,
        title,
        message,
        type,
        ...data,
    };

    // Emit 'notification' event - mobile app listens for this
    s.emit("notification", payload);
    console.log(`[SocketEmit] Emitted notification:`, payload);
}

/**
 * Emit snag-related notifications
 */
export function emitSnagAlert(
    userId: string,
    snagId: string,
    title: string,
    message: string,
    severity: string
): void {
    const type = severity === "critical" ? "alert" : "info";
    emitNotification(userId, title, message, type, {
        screen: "SnagDetail",
        params: { snagId },
    });
}

/**
 * Emit task assignment notification
 */
export function emitTaskAssigned(
    userId: string,
    taskId: string,
    taskTitle: string
): void {
    emitNotification(userId, "📋 Task Assigned", `You've been assigned: "${taskTitle}"`, "info", {
        screen: "TaskDetail",
        params: { taskId },
    });
}

/**
 * Emit risk alert notification
 */
export function emitRiskAlert(
    userId: string,
    riskId: string,
    title: string,
    severity: string
): void {
    emitNotification(userId, `⚠️ ${severity} Risk`, title, "alert", {
        screen: "RiskDetail",
        params: { riskId },
    });
}

/**
 * Emit proposal status notification
 */
export function emitProposalStatus(
    userId: string,
    proposalId: string,
    status: string,
    proposalTitle: string,
    rejectionReason?: string // ✅ NEW (optional)
): void {
    const isApproved = status === "approved";
    emitNotification(
        userId,
        `📝 Proposal ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `Your proposal "${proposalTitle}" has been ${status}`,
        isApproved ? "success" : "error",
        { screen: "ProposalDetail", params: { proposalId } }
    );
}

/**
 * Emit transaction status notification
 */
export function emitTransactionStatus(
    userId: string,
    transactionId: string,
    status: string,
    amount: number
): void {
    const isApproved = status === "approved";
    emitNotification(
        userId,
        `💰 Transaction ${status.charAt(0).toUpperCase() + status.slice(1)}`,
        `Your transaction of ₹${amount} has been ${status}`,
        isApproved ? "success" : "error",
        { screen: "TransactionDetail", params: { transactionId } }
    );
}

/**
 * Emit announcement to all users
 */
export function emitAnnouncement(title: string, message: string): void {
    const s = getSocket();
    s.emit("announcement:new", { title, message });
    console.log(`[SocketEmit] Emitted announcement:`, { title, message });
}

export default {
    emitNotification,
    emitSnagAlert,
    emitTaskAssigned,
    emitRiskAlert,
    emitProposalStatus,
    emitAnnouncement,
    emitTransactionStatus,
};
