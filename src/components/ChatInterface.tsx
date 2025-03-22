import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Loader, Paperclip, SendHorizonal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import ChatList from "@/components/ChatList.tsx";

interface ChatInterfaceProps {
  userId: string;
}

interface User {
  first_name: string;
  last_name: string;
  profile: string;
  role?: string;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(""); // Holds the message input
  const [sending, setSending] = useState(false); // Controls send button state
  const [senderId, setSenderId] = useState<string | null>(null); // Store logged-in user ID

  useEffect(() => {
    const fetchUserDetails = async () => {
      setLoading(true);

      // 1️⃣ Fetch personal information
      const { data: personalInfo, error: personalError } = await supabase
        .from("personal-information")
        .select("first_name, last_name, profile")
        .eq("id", userId)
        .single();

      if (personalError) {
        toast.error("Failed to fetch user details");
        console.error("Error fetching personal information:", personalError);
        setLoading(false);
        return;
      }

      // 2️⃣ Fetch role
      const { data: userRole, error: roleError } = await supabase
        .from("user_role")
        .select("roles(name)")
        .eq("id", userId)
        .single();

      if (roleError) {
        toast.error("Failed to fetch user role");
        console.error("Error fetching user role:", roleError);
      }

      // Merge data
      setUser({
        first_name: personalInfo.first_name,
        last_name: personalInfo.last_name,
        profile: personalInfo.profile,
        role: userRole?.roles?.name || "No Role Assigned",
      });

      setLoading(false);
    };

    fetchUserDetails();
  }, [userId]);
  // 1️⃣ Retrieve the logged-in user's ID on component mount
  useEffect(() => {
    const fetchSenderId = async () => {
      const { data: user, error } = await supabase.auth.getUser();
      if (error || !user?.user?.id) {
        toast.error("Failed to retrieve sender ID");
        console.error("Error fetching sender ID:", error);
        return;
      }
      setSenderId(user.user.id);
    };

    fetchSenderId();
  }, []);

  // 3️⃣ Handle message send
  // 2️⃣ Handle message send
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!message.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    if (!senderId) {
      toast.error("Unable to send message. Sender ID not found.");
      return;
    }

    try {
      setSending(true);

      // 3️⃣ Insert message into Supabase
      const { error } = await supabase.from("chats").insert([
        {
          key: `${senderId}${userId}`,
          sender_id: senderId,
          receiver_id: userId,
          message: message.trim(),
          attachment: null, // Modify if handling attachments
          att_type: null, // Modify if handling attachments
        },
      ]);

      if (error) {
        throw error;
      }

      toast.success("Message sent successfully!");
      setMessage(""); // Clear input after send
    } catch (error) {
      toast.error("Failed to send message");
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };
  return (
    <section className="p-3 rounded-xl bg-white">
      {/* User Profile */}
      <article className="w-full border-b flex pb-3 items-center gap-3">
        <Avatar>
          <AvatarImage src={user?.profile || "https://github.com/shadcn.png"} />
          <AvatarFallback>
            {user?.first_name?.charAt(0)}
            {user?.last_name?.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          {loading ? (
            <Loader className="w-4 h-4 animate-spin text-muted-foreground" />
          ) : (
            <>
              <span className="font-semibold">
                {user?.first_name} {user?.last_name}
              </span>
              <Badge>{user?.role}</Badge>
            </>
          )}
        </div>
      </article>

      {/* Chat Messages */}
      <article className="py-5 flex flex-col min-h-[60vh]">
        <ChatList loggedInUserId={senderId} selectedUserId={userId} />

        {/* Message Input Form */}
        <form
          className="w-full mt-auto flex items-center gap-2"
          onSubmit={handleSendMessage}
        >
          <Button size="icon" variant="secondary">
            <Paperclip />
          </Button>

          <Input
            placeholder="Type your message here..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={sending}
          />

          <Button
            size="icon"
            variant="default"
            type="submit"
            disabled={sending}
          >
            {sending ? (
              <Loader className="w-4 h-4 animate-spin" />
            ) : (
              <SendHorizonal />
            )}
          </Button>
        </form>
      </article>
    </section>
  );
};

export default ChatInterface;
