import mongoose, { Schema, Document } from "mongoose";

export interface IPushToken extends Document {
    userId: mongoose.Types.ObjectId;
    token: string;
    platform: "ios" | "android";
    createdAt: Date;
    updatedAt: Date;
}

const PushTokenSchema = new Schema<IPushToken>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true,
        },
        token: {
            type: String,
            required: true,
        },
        platform: {
            type: String,
            enum: ["ios", "android"],
            required: true,
        },
    },
    { timestamps: true }
);

// Index for quick lookups by userId
PushTokenSchema.index({ userId: 1 });

export default mongoose.models.PushToken ||
    mongoose.model<IPushToken>("PushToken", PushTokenSchema);
