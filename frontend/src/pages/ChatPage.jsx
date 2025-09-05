import { useEffect, useState } from "react";
import { useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import {
  Channel,
  ChannelHeader,
  Chat,
  MessageInput,
  MessageList,
  Thread,
  Window,
} from "stream-chat-react";
import { StreamChat } from "stream-chat";
import { StreamVideoClient } from "@stream-io/video-react-sdk";
import toast from "react-hot-toast";
import ChatLoader from "../components/ChatLoader";
import CallButton from "../components/CallButton";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const ChatPage = () => {
  const { id: targetUserId } = useParams();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const { authUser } = useAuthUser();
  
  const { data } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
  });

  useEffect(() => {
    if (!data?.token || !authUser || chatClient) return;

    const initChat = async () => {
      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic || "https://via.placeholder.com/150",
          },
          data.token
        );

        // ✅ Use consistent channel ID generation
        const channelId = [authUser._id, targetUserId].sort().join("-");
        
        const currChannel = client.channel("messaging", channelId, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();
        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [data?.token, authUser, targetUserId, chatClient]);

  const handleVideoCall = async () => {
    if (channel && data?.token) {
      try {
        // ✅ Use consistent call ID (same as channel ID)
        const callId = [authUser._id, targetUserId].sort().join("-");
        
        console.log("Starting video call with ID:", callId);

        // Initialize video client
        const videoClient = StreamVideoClient.getOrCreateInstance(STREAM_API_KEY, {
          user: {
            id: authUser._id,
            name: authUser.fullName,
            image: authUser.profilePic || "https://via.placeholder.com/150",
          },
          token: data.token,
        });

        // Create or get the video call
        const call = videoClient.call("default", callId);
        
        // ✅ Fixed member format - use user_id instead of id
        await call.getOrCreate({
          data: {
            members: [
              { user_id: authUser._id },    // ✅ Changed from 'id' to 'user_id'
              { user_id: targetUserId },    // ✅ Changed from 'id' to 'user_id'
            ],
          },
        });

        // ✅ Use the same callId for the URL
        const callUrl = `${window.location.origin}/call/${callId}`;
        
        await channel.sendMessage({
          text: `📹 I've started a video call. Join me here: ${callUrl}`,
        });

        toast.success("Video call link sent successfully!");
        
        // Optional: Navigate to call immediately
        // window.location.href = callUrl;
        
      } catch (err) {
        console.error("Error starting call:", err);
        toast.error("Failed to start video call");
      }
    }
  };

  if (loading || !chatClient || !channel) return <ChatLoader />;

  return (
    <div className="h-[93vh]">
      <Chat client={chatClient}>
        <Channel channel={channel}>
          <div className="w-full relative">
            <CallButton handleVideoCall={handleVideoCall} />
            <Window>
              <ChannelHeader />
              <MessageList />
              <MessageInput focus />
            </Window>
          </div>
          <Thread />
        </Channel>
      </Chat>
    </div>
  );
};

export default ChatPage;
