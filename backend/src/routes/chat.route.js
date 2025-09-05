// controllers/chat.controller.js
import { StreamChat } from "stream-chat";
import { StreamVideoServerClient } from "@stream-io/video-node";

export const getStreamToken = async (req, res) => {
  try {
    const userId = req.user._id.toString(); // comes from protectRoute

    // ✅ Create Chat server client
    const chatClient = StreamChat.getInstance(
      process.env.STREAM_API_KEY,
      process.env.STREAM_API_SECRET
    );

    // ✅ Video server client (needed for video calls)
    const videoClient = new StreamVideoServerClient({
      apiKey: process.env.STREAM_API_KEY,
      apiSecret: process.env.STREAM_API_SECRET,
    });

    // 🔑 Issue a token (valid for both Chat + Video SDKs)
    const token = chatClient.createToken(userId);

    return res.json({ token });
  } catch (error) {
    console.error("❌ Error generating Stream token:", error);
    return res.status(500).json({ message: "Failed to generate Stream token" });
  }
};
