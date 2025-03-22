import React, { useState } from "react";
import UsersList from "@/components/UsersList.tsx";
import ChatInterface from "@/components/ChatInterface.tsx";

const MessagesPage = () => {
  const [activeUserId, setActiveUserId] = useState(null);
  return (
    <section className={"grid grid-cols-3  gap-3"}>
      <UsersList
        setActiveUserId={setActiveUserId}
        activeUserId={activeUserId}
      />
      <article className="col-span-2">
        {activeUserId ? (
          <ChatInterface userId={activeUserId} />
        ) : (
          <div
            className={
              "h-full p-3 rounded-xl bg-white flex items-center justify-center"
            }
          >
            <span className="">Select a chat to continue</span>
          </div>
        )}
      </article>
    </section>
  );
};

export default MessagesPage;
