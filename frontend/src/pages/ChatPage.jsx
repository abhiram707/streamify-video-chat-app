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
  
  const { data, error, isLoading: tokenLoading } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
    retry: 3,
    refetchOnWindowFocus: false,
  });

  // Debug logging
  useEffect(() => {
    console.log("Auth state:", { authUser: !!authUser, tokenData: !!data?.token });
    if (error) {
      console.error("Token fetch error:", error);
    }
  }, [authUser, data, error]);

  useEffect(() => {
    if (!data?.token || !authUser || chatClient) return;

    const initChat = async () => {
      try {
        const client = StreamChat.getInstance(STREAM_API_KEY);
        
        const userData = {
          id: authUser._id.toString(), // Ensure string
          name: authUser.fullName,
          image: authUser.profilePic || "https://via.placeholder.com/150",
        };

        console.log("Connecting user to chat:", userData);

        await client.connectUser(userData, data.token);

        const channelId = [authUser._id, targetUserId].sort().join("-");
        console.log("Channel ID:", channelId);
        
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
    // Add comprehensive validation
    if (!authUser) {
      toast.error("You must be logged in to start a call");
      return;
    }

    if (!data?.token) {
      toast.error("Authentication token not available");
      return;
    }

    if (!channel) {
      toast.error("Chat channel not initialized");
      return;
    }

    try {
      const callId = [authUser._id, targetUserId].sort().join("-");
      console.log("Starting video call with ID:", callId);

      // Create user object with validation
      const userData = {
        id: authUser._id.toString(), // Ensure string format
        name: authUser.fullName || "Unknown User",
        image: authUser.profilePic || "https://via.placeholder.com/150",
      };

      console.log("Video client user data:", userData);
      console.log("Using token:", data.token.substring(0, 20) + "...");

      // Initialize video client with error handling
      let videoClient;
      try {
        videoClient = StreamVideoClient.getOrCreateInstance(STREAM_API_KEY, {
          user: userData,
          token: data.token,
        });
      } catch (clientError) {
        console.error("Error creating video client:", clientError);
        toast.error("Failed to initialize video client");
        return;
      }

      // Create call with proper error handling
      const call = videoClient.call("default", callId);
      
      try {
        await call.getOrCreate({
          data: {
            members: [
              { user_id: authUser._id.toString() },
              { user_id: targetUserId.toString() },
            ],
          },
        });
        console.log("Call created successfully");
      } catch (callError) {
        console.error("Error creating call:", callError);
        toast.error("Failed to create video call");
        return;
      }

      // Send message to chat
      const callUrl = `${window.location.origin}/call/${callId}`;
      
      try {
        await channel.sendMessage({
          text: `📹 I've started a video call. Join me here: ${callUrl}`,
        });
        toast.success("Video call link sent successfully!");
      } catch (messageError) {
        console.error("Error sending message:", messageError);
        toast.error("Call created but failed to send message");
      }

    } catch (err) {
      console.error("Unexpected error starting call:", err);
      toast.error("Failed to start video call");
    }
  };

  // Show loading state
  if (loading || tokenLoading || !authUser) return <ChatLoader />;

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-[93vh]">
        <div className="text-center">
          <p className="text-red-500 mb-4">Failed to authenticate with chat service</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn btn-primary"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!chatClient || !channel) return <ChatLoader />;

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
