import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Zustand store for chat history
const useChatStore = create(
  persist(
    (set, get) => ({
      chats: [],
      addChat: (query, response) =>
        set({ chats: [...get().chats, { query, response }] }),
      clearChats: () => set({ chats: [] }),
    }),
    { name: "chat-history" },
  ),
);

const ChatWithAI = () => {
  const { chats, addChat, clearChats } = useChatStore();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chats]);

  const sendMessage = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:5000/api/query", {
        query,
      });
      addChat(query, response.data.response);
      setQuery("");
    } catch (error) {
      console.error("Error fetching AI response:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto p-4 shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle>Chat with AI</CardTitle>
      </CardHeader>
      <CardContent className="h-96 overflow-y-auto flex flex-col space-y-4 p-4 bg-gray-100 rounded-lg">
        {chats.map((chat, index) => (
          <div key={index} className="flex flex-col gap-3">
            <div className="bg-blue-500 text-white p-3 rounded-lg ms-auto w-fit max-w-xs">
              {chat.query}
            </div>
            <div className="bg-gray-300 p-3 rounded-lg w-full ">
              {chat.response}
            </div>
          </div>
        ))}
        {loading && <div className="text-gray-500">AI is typing...</div>}
        <div ref={chatEndRef}></div>
      </CardContent>
      <div className="flex items-center p-4 border-t">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Type your message..."
          className="flex-1"
        />
        <Button onClick={sendMessage} disabled={loading} className="ml-2">
          Send
        </Button>
        <Button onClick={clearChats} variant="outline" className="ml-2">
          Clear
        </Button>
      </div>
    </Card>
  );
};

export default ChatWithAI;
