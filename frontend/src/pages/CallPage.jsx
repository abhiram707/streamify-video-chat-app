import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import useAuthUser from "../hooks/useAuthUser";
import { useQuery } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import {
  StreamVideo,
  StreamVideoClient,
  StreamCall,
  CallControls,
  SpeakerLayout,
  StreamTheme,
  CallingState,
  useCallStateHooks,
} from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import toast from "react-hot-toast";
import PageLoader from "../components/PageLoader";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

const CallPage = () => {
  const { id: callId } = useParams(); // This should be the callId, not targetUserId
  const [client, setClient] = useState(null);
  const [call, setCall] = useState(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const { authUser, isLoading } = useAuthUser();
  const navigate = useNavigate();
  
  const { data: tokenData, error: tokenError } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
    enabled: !!authUser,
    retry: 3,
  });

  useEffect(() => {
    const initCall = async () => {
      // Comprehensive validation
      if (!tokenData?.token) {
        console.log("No token available");
        return;
      }
      
      if (!authUser) {
        console.log("No authenticated user");
        return;
      }
      
      if (!callId) {
        console.log("No call ID provided");
        return;
      }

      try {
        console.log("Initializing Stream video client...");
        console.log("Call ID:", callId);
        console.log("User ID:", authUser._id);
        
        const userData = {
          id: authUser._id.toString(),
          name: authUser.fullName || "Unknown User",
          image: authUser.profilePic || "https://via.placeholder.com/150",
        };

        console.log("User data for video client:", userData);

        // Create video client with error handling
        let videoClient;
        try {
          videoClient = StreamVideoClient.getOrCreateInstance(STREAM_API_KEY, {
            user: userData,
            token: tokenData.token,
          });
          console.log("Video client created successfully");
        } catch (clientError) {
          console.error("Failed to create video client:", clientError);
          toast.error("Failed to initialize video client");
          return;
        }

        // Create call instance
        const callInstance = videoClient.call("default", callId);
        console.log("Call instance created");

        try {
          // Try to join existing call first
          await callInstance.join();
          console.log("Joined existing call");
        } catch (joinError) {
          console.log("Call doesn't exist, creating new call:", joinError.message);
          
          // Parse callId to get user IDs (assuming format: userId1-userId2)
          const userIds = callId.split("-");
          if (userIds.length !== 2) {
            throw new Error("Invalid call ID format");
          }

          // Create new call with members
          await callInstance.getOrCreate({
            data: {
              members: [
                { user_id: userIds[0] },
                { user_id: userIds[1] },
              ],
            },
          });

          // Then join the newly created call
          await callInstance.join();
          console.log("Created and joined new call");
        }

        setClient(videoClient);
        setCall(callInstance);
        toast.success("Successfully joined the call!");

      } catch (error) {
        console.error("Error initializing call:", error);
        
        // Provide specific error messages
        if (error.message?.includes("permission")) {
          toast.error("You don't have permission to join this call");
        } else if (error.message?.includes("not found")) {
          toast.error("Call not found. The call may have ended.");
        } else {
          toast.error("Could not join the call. Please try again.");
        }
        
        // Redirect after error
        setTimeout(() => navigate("/"), 3000);
      } finally {
        setIsConnecting(false);
      }
    };

    initCall();
  }, [tokenData, authUser, callId, navigate]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (call) {
        call.leave().catch(console.error);
      }
    };
  }, [call]);

  // Show error state
  if (tokenError) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Authentication failed</p>
          <button onClick={() => navigate("/")} className="btn btn-primary">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (isLoading || isConnecting) return <PageLoader />;

  return (
    <div className="h-screen flex flex-col items-center justify-center bg-gray-900">
      {client && call ? (
        <StreamVideo client={client}>
          <StreamCall call={call}>
            <CallContent />
          </StreamCall>
        </StreamVideo>
      ) : (
        <div className="flex items-center justify-center h-full text-white">
          <div className="text-center">
            <p className="mb-4">Could not initialize call</p>
            <button onClick={() => navigate("/")} className="btn btn-primary">
              Go Back Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const CallContent = () => {
  const { useCallCallingState } = useCallStateHooks();
  const callingState = useCallCallingState();
  const navigate = useNavigate();

  useEffect(() => {
    if (callingState === CallingState.LEFT) {
      console.log("Call ended, redirecting...");
      navigate("/");
    }
  }, [callingState, navigate]);

  return (
    <StreamTheme className="w-full h-full">
      <div className="relative w-full h-full">
        <SpeakerLayout />
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
          <CallControls />
        </div>
      </div>
    </StreamTheme>
  );
};

export default CallPage;
