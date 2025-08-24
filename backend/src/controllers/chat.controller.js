import { generateStreamToken } from "../lib/stream.js";

export async function getStreamToken(req, res) {
  try {
    // ✅ Use _id instead of id
    const token = generateStreamToken(req.user._id.toString());
    res.status(200).json({ token });
  } catch (error) {
    console.error("Error in getStreamToken controller:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
}
