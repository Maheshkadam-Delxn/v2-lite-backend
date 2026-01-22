import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    roomId: String,
    senderId: String,
    message: String,
  },
  { timestamps: true }
);

export default mongoose.models.Message ||
  mongoose.model("Message", MessageSchema);
