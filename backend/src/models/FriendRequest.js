import mongoose from "mongoose";

const friendRequestSchema = new mongoose.Schema(
  {
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"], // 👈 added "rejected" for better handling
      default: "pending",
    },
  },
  {
    timestamps: true,
  }
);

// ✅ Prevent duplicate friend requests between the same users
friendRequestSchema.index({ sender: 1, recipient: 1 }, { unique: true });

const FriendRequest = mongoose.model("FriendRequest", friendRequestSchema);

export default FriendRequest;
