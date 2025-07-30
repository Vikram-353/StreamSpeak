import React from "react";
import { useState } from "react";
import { useParams } from "react-router";
import useAuthHook from "../hooks/useAuthHook";
import ChatLoader from "../components/chatLoader";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getStreamToken } from "../lib/api";
import CallButton from "../components/CallButton";
import toast from "react-hot-toast";

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
import { useEffect } from "react";

const STREAM_API_KEY = import.meta.env.VITE_STREAM_API_KEY;

function ChatPage() {
  const { id: targetUserId } = useParams();
  const [chatClient, setChatClient] = useState(null);
  const [channel, setChannel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [channelId, setChannelId] = useState();

  const { authUser } = useAuthHook();
  const { data: tokenData } = useQuery({
    queryKey: ["streamToken"],
    queryFn: getStreamToken,
  });

  useEffect(() => {
    const initChat = async () => {
      if (!tokenData?.token || !authUser || !targetUserId) return;

      try {
        console.log("Initializing stream chat client...");
        const client = StreamChat.getInstance(STREAM_API_KEY);

        await client.connectUser(
          {
            id: authUser._id,
            name: authUser.fullname,
            image: authUser.profilePic,
          },
          tokenData.token
        );

        const idForChannel = [authUser._id, targetUserId].sort().join("-");

        const currChannel = client.channel("messaging", idForChannel, {
          members: [authUser._id, targetUserId],
        });

        await currChannel.watch();

        setChatClient(client);
        setChannel(currChannel);
      } catch (error) {
        console.error("Error initializing chat:", error);
        toast.error("Could not connect to chat. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    initChat();
  }, [tokenData, authUser, targetUserId]);

  const handleVideoCall = () => {
    if (channel) {
      const callUrl = `${window.location.origin}/call/${channel.id}`;

      channel.sendMessage({
        text: `I've started a video call. Join me here: ${callUrl}`,
      });

      toast.success("Video call link sent successfully!");
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
}

export default ChatPage;
