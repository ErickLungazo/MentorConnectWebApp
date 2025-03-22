import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface ChatListProps {
  loggedInUserId: string; // Sender (current user)
  selectedUserId: string; // Receiver
}

interface ChatMessage {
  id: string;
  key: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
}

const ChatList: React.FC<ChatListProps> = ({
  loggedInUserId,
  selectedUserId,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  const room1 = `${loggedInUserId}${selectedUserId}`;
  const room2 = `${selectedUserId}${loggedInUserId}`;

  console.log("Fetching chats for:", { room1, room2 });

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates after unmount

    const fetchMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("chats")
          .select("*")
          .or(`key.eq.${room1},key.eq.${room2}`)
          .order("created_at", { ascending: true });

        if (error) {
          console.error("Error fetching messages:", error);
        } else if (isMounted) {
          console.log("Fetched chat messages:", data);
          setMessages(data || []);
        }
      } catch (err) {
        console.error("Error during fetchMessages:", err);
      }
    };

    // Fetch initial messages
    fetchMessages();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel("public:chats")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chats",
          filter: `key=in.(${room1},${room2})`, // Filter by relevant keys
        },
        (payload) => {
          if (isMounted) {
            console.log("Real-time update received:", payload);
            const newMessage = payload.new as ChatMessage;
            setMessages((prevMessages) => [...prevMessages, newMessage]);
          }
        },
      )
      .subscribe();
    console.log("Subscription status:", subscription); // Logs true if subscribed
    return () => {
      isMounted = false; // Clean up on unmount
      subscription.unsubscribe(); // Unsubscribe from real-time updates
    };
  }, [loggedInUserId, selectedUserId]); // Rerun when dependencies change

  console.log("Current messages:", messages);

  return (
    <>
      <ul className="flex flex-col gap-2 pb-3">
        {messages.map((message) => (
          <li key={message.id} className={"flex"}>
            <div
              className={`p-2 rounded-xl w-fit ${
                message.sender_id === loggedInUserId
                  ? "bg-blue-200 ms-auto rounded-ee-none"
                  : "bg-muted rounded-ss-none"
              }`}
            >
              {message.message}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
};

export default ChatList;
