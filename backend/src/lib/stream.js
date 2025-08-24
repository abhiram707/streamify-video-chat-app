import { StreamChat } from "stream-chat";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

// Ensure API keys are loaded
if (!apiKey || !apiSecret) {
  throw new Error("❌ Stream API key or secret is missing. Check your environment variables.");
}

// Singleton instance
const streamClient = StreamChat.getInstance(apiKey, apiSecret);

/**
 * Upsert (create/update) a user in Stream
 */
export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.error("❌ Error upserting Stream user:", error.message);
    throw error;
  }
};

/**
 * Generate a token for a user
 */
export const generateStreamToken = (userId) => {
  try {
    if (!userId) throw new Error("User ID is required to generate a token.");
    return streamClient.createToken(userId.toString());
  } catch (error) {
    console.error("❌ Error generating Stream token:", error.message);
    throw error;
  }
};
