// ========================================
// app/chat/[id]/page.jsx - Chat Conversation Page
// ========================================
"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Smile, Image as ImageIcon, X } from "lucide-react";
import { io } from "socket.io-client";
import MessageBubble from "@/components/chat/MessageBubble";
import TypingIndicator from "@/components/chat/TypingIndicator";
import EmojiPicker from "emoji-picker-react";
import { useAuth } from "@/contexts/AuthContext";
let socket;

export default function ChatConversationPage() {
  const { user } = useAuth();
  const userId = user._id;
  const params = useParams();
  const router = useRouter();
  const conversationId = params.id;

  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState("");
  const [conversation, setConversation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [typingUsers, setTypingUsers] = useState([]);
  const [replyingTo, setReplyingTo] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket
  useEffect(() => {
    socket = io(process.env.NEXT_PUBLIC_API_BASE, {
      auth: { userId },
    });

    socket.on("connect", () => {
      console.log("✅ Socket connected");
      socket.emit("join-conversation", conversationId);
    });

    socket.on("new-message", (message) => {
      setMessages((prev) => [...prev, message]);
      if (isAtBottom) {
        scrollToBottom();
      }
    });

    socket.on("message-deleted", ({ messageId, userId }) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === messageId
            ? { ...msg, deletedFor: [...(msg.deletedFor || []), userId] }
            : msg
        )
      );
    });

    socket.on("message-edited", (updatedMessage) => {
      setMessages((prev) =>
        prev.map((msg) =>
          msg._id === updatedMessage._id ? updatedMessage : msg
        )
      );
    });

    socket.on("user-typing", ({ userId }) => {
      setTypingUsers((prev) => {
        if (!prev.includes(userId)) {
          return [...prev, userId];
        }
        return prev;
      });
    });

    socket.on("user-stop-typing", ({ userId }) => {
      setTypingUsers((prev) => prev.filter((id) => id !== userId));
    });

    return () => {
      socket.emit("leave-conversation", conversationId);
      socket.disconnect();
    };
  }, [conversationId]);

  // Fetch conversation detail
  useEffect(() => {
    fetchConversationDetail();
    fetchMessages();
  }, [conversationId]);

  const fetchConversationDetail = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/conversation/detail/${conversationId}`,
        { credentials: "include" }
      );
      const result = await response.json();
      if (result.success) {
        setConversation(result.data);
      }
    } catch (error) {
      console.error("Fetch conversation detail error:", error);
    }
  };

  const fetchMessages = async (pageNum = 1) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/message/get-messages/${conversationId}?page=${pageNum}&limit=50`,
        { credentials: "include" }
      );
      const result = await response.json();
      if (result.success) {
        if (pageNum === 1) {
          setMessages(result.data.messages);
          setTimeout(scrollToBottom, 100);
        } else {
          setMessages((prev) => [...result.data.messages, ...prev]);
        }
        setHasMore(result.data.hasMore);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Fetch messages error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const atBottom = scrollHeight - scrollTop - clientHeight < 50;
    setIsAtBottom(atBottom);

    // Load more when scrolling to top
    if (scrollTop === 0 && hasMore && !loading) {
      setLoading(true);
      fetchMessages(page + 1);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const messageData = {
      conversationId,
      content: inputMessage,
      type: "text",
      replyTo: replyingTo?._id || null,
    };

    socket.emit("send-message", messageData);
    setInputMessage("");
    setReplyingTo(null);
    setShowEmojiPicker(false);
    scrollToBottom();
  };

  const handleTyping = () => {
    socket.emit("typing-start", { conversationId });

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("typing-stop", { conversationId });
    }, 2000);
  };

  const handleDeleteMessage = (messageId) => {
    socket.emit("delete-message", { messageId });
  };

  const handleReplyMessage = (message) => {
    setReplyingTo(message);
    inputRef.current?.focus();
  };

  if (loading && messages.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Conversation List (can be hidden on mobile) */}
      <div className="w-96 bg-white border-r border-gray-200 hidden lg:block">
        {/* Same sidebar as in /chat page */}
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-4 flex items-center">
          <button
            onClick={() => router.push("/chat")}
            className="mr-3 lg:hidden"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>

          <div className="flex items-center space-x-3">
            {conversation?.type === "private" ? (
              <>
                <img
                  src={conversation.otherUser?.avatar || "/default-avatar.png"}
                  alt=""
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {conversation.name}
                  </h2>
                </div>
              </>
            ) : (
              <>
                <div className="relative">
                  <img
                    src={
                      conversation?.groupInfo?.avatar || "/default-group.png"
                    }
                    alt=""
                    className="w-10 h-10 rounded-full"
                  />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">
                    {conversation?.groupInfo?.name}
                  </h2>
                  <p className="text-xs text-gray-500">
                    {conversation?.totalMembers} thành viên
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Messages Container */}
        <div
          ref={messagesContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {loading && page > 1 && (
            <div className="text-center py-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
            </div>
          )}

          {messages.map((message, index) => (
            <MessageBubble
              key={message._id}
              message={message}
              prevMessage={messages[index - 1]}
              isGroup={conversation?.type === "group"}
              currentUserId={userId}
              onReply={handleReplyMessage}
              onDelete={handleDeleteMessage}
            />
          ))}

          {typingUsers.length > 0 && (
            <TypingIndicator
              typingUsers={typingUsers.slice(0, 3)}
              conversation={conversation}
            />
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Reply Preview */}
        {replyingTo && (
          <div className="bg-gray-100 px-4 py-2 flex items-center justify-between border-t border-gray-200">
            <div className="flex-1">
              <p className="text-xs text-gray-500">
                Đang trả lời {replyingTo.senderId.customName}
              </p>
              <p className="text-sm text-gray-700 truncate">
                {replyingTo.content}
              </p>
            </div>
            <button
              onClick={() => setReplyingTo(null)}
              className="p-1 hover:bg-gray-200 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="bg-white border-t border-gray-200 p-4">
          <form
            onSubmit={handleSendMessage}
            className="flex items-center space-x-2"
          >
            <button
              type="button"
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <ImageIcon className="w-5 h-5 text-gray-600" />
            </button>

            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-2 hover:bg-gray-100 rounded-full transition"
            >
              <Smile className="w-5 h-5 text-gray-600" />
            </button>

            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => {
                setInputMessage(e.target.value);
                handleTyping();
              }}
              placeholder="Soạn tin nhắn"
              className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500"
            />

            <button
              type="submit"
              disabled={!inputMessage.trim()}
              className="p-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>

          {showEmojiPicker && (
            <div className="absolute bottom-20 right-4">
              <EmojiPicker
                onEmojiClick={(emojiData) => {
                  setInputMessage((prev) => prev + emojiData.emoji);
                  setShowEmojiPicker(false);
                }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
