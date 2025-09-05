import { StreamChat } from "stream-chat";

export const getStreamToken = async (req, res) => {
  try {
    const userId = req.user._id.toString();

    const chatClient = StreamChat.getInstance(
      process.env.STREAM_API_KEY,
      process.env.STREAM_API_SECRET
    );

    const token = chatClient.createToken(userId);

    res.json({ token });
  } catch (error) {
    console.error("Error generating token:", error);
    res.status(500).json({ message: "Failed to generate Stream token" });
  }
};
