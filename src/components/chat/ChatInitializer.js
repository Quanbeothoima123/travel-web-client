"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

const ChatInitializer = ({ createOrGetChat, chatId, user }) => {
  const searchParams = useSearchParams();

  useEffect(() => {
    const otherUserId = searchParams?.get("userId");

    if (otherUserId && !chatId && user) {
      console.log("📧 Creating/getting chat with user:", otherUserId);
      createOrGetChat(otherUserId);
    }
  }, [searchParams, chatId, user, createOrGetChat]);

  return null;
};

export default ChatInitializer;
