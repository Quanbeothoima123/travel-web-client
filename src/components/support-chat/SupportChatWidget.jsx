"use client";

import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useSocket } from "@/contexts/SocketContext"; //  Import SocketContext
import { MessageCircle, X, Lock, Send } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export default function SupportChatWidget() {
  const { user, loading } = useAuth();
  const { socket, isConnected } = useSocket(); //  Dùng socket có sẵn

  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [sending, setSending] = useState(false);
  const [loadingChat, setLoadingChat] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const hasJoinedRoom = useRef(false);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  //  Setup socket listeners when widget opens
  useEffect(() => {
    if (!socket || !isConnected || !isOpen || !user) return;

    console.log("🔌 Setting up support socket listeners");

    //  NEW MESSAGE
    const handleNewMessage = (message) => {
      console.log("📨 [Support] Received message:", message);

      setMessages((prev) => {
        // Prevent duplicates
        if (prev.some((m) => m._id === message._id)) {
          return prev;
        }
        return [...prev, message];
      });

      // Mark as read if viewing this conversation
      if (message.conversationId === conversationId) {
        socket.emit("mark-support-read", {
          conversationId: message.conversationId,
        });
      }
    };

    //  TYPING
    const handleTyping = ({ userType, conversationId: typingConvId }) => {
      console.log("⌨️ [Support] Typing:", userType, typingConvId);

      if (userType === "admin" && typingConvId === conversationId) {
        setIsTyping(true);
      }
    };

    const handleTypingStop = ({ conversationId: typingConvId }) => {
      console.log("⏹️ [Support] Stop typing:", typingConvId);

      if (typingConvId === conversationId) {
        setIsTyping(false);
      }
    };

    // Room joined
    const handleRoomJoined = ({ conversationId: joinedConvId }) => {
      console.log("✅ [Support] Room joined:", joinedConvId);
      hasJoinedRoom.current = true;
    };

    const handleError = (error) => {
      console.error("❌ [Support] Error:", error);
    };

    //  Register listeners
    socket.on("new-support-message", handleNewMessage);
    socket.on("support-typing", handleTyping);
    socket.on("support-typing-stop", handleTypingStop);
    socket.on("room-joined", handleRoomJoined);
    socket.on("support-error", handleError);

    //  Join room if conversation exists
    if (conversationId && !hasJoinedRoom.current) {
      console.log("🚪 [Support] Auto joining room:", conversationId);
      socket.emit("join-support-room", conversationId);
    }

    // Cleanup
    return () => {
      console.log("🧹 [Support] Cleaning up listeners");
      socket.off("new-support-message", handleNewMessage);
      socket.off("support-typing", handleTyping);
      socket.off("support-typing-stop", handleTypingStop);
      socket.off("room-joined", handleRoomJoined);
      socket.off("support-error", handleError);
    };
  }, [socket, isConnected, isOpen, user, conversationId]);

  // Load conversation
  const loadConversation = async () => {
    if (!user) return;

    setLoadingChat(true);

    try {
      // Get or create conversation
      const response = await fetch(`${API_BASE}/api/v1/support/conversation`, {
        credentials: "include",
      });

      const data = await response.json();

      if (data.success && data.conversation) {
        setConversationId(data.conversation._id);

        // Load messages
        const msgResponse = await fetch(
          `${API_BASE}/api/v1/support/${data.conversation._id}/messages`,
          { credentials: "include" }
        );

        const msgData = await msgResponse.json();

        if (msgData.success) {
          setMessages(msgData.messages);
        }

        // Join room via existing socket
        if (socket && isConnected) {
          console.log("🚪 [Support] Joining room:", data.conversation._id);
          socket.emit("join-support-room", data.conversation._id);
        }

        console.log("✅ [Support] Loaded conversation:", data.conversation._id);
      }
    } catch (error) {
      console.error("❌ [Support] Load conversation error:", error);
    } finally {
      setLoadingChat(false);
    }
  };

  // Open widget
  const handleOpen = () => {
    setIsOpen(true);

    if (!user) return;

    if (!conversationId) {
      loadConversation();
    }
  };

  // Close widget
  const handleClose = () => {
    setIsOpen(false);

    if (conversationId && socket) {
      socket.emit("leave-support-room", conversationId);
      hasJoinedRoom.current = false;
    }
  };

  // Send message
  const handleSendMessage = () => {
    if (!messageInput.trim() || sending || !conversationId || !socket) {
      console.warn("⚠️ [Support] Cannot send:", {
        hasInput: !!messageInput.trim(),
        sending,
        hasConversation: !!conversationId,
        hasSocket: !!socket,
      });
      return;
    }

    setSending(true);
    const content = messageInput.trim();
    setMessageInput("");

    console.log("📤 [Support] Sending message:", content);

    socket.emit("send-support-message", {
      conversationId,
      content,
    });

    setTimeout(() => setSending(false), 500);
  };

  // Typing
  const handleTyping = (e) => {
    setMessageInput(e.target.value);

    if (!conversationId || !socket) return;

    // Start typing
    socket.emit("support-typing-start", { conversationId });

    // Stop typing after 1s
    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("support-typing-stop", { conversationId });
    }, 1000);
  };

  // Format time
  const formatTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return null;

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={handleOpen}
        className="fixed bottom-8 right-8 z-998 flex items-center gap-2 px-5 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-full font-semibold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
      >
        <MessageCircle className="w-5 h-5" />
        Hỗ trợ
        {!isConnected && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
        )}
      </button>

      {/* Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-8 w-[400px] h-[600px] bg-white rounded-2xl shadow-2xl flex flex-col z-999 animate-in slide-in-from-bottom-4 max-sm:w-full max-sm:h-screen max-sm:bottom-0 max-sm:right-0 max-sm:rounded-none">
          {/* Header */}
          <div className="bg-linear-to-r from-blue-600 to-purple-600 text-white p-4 rounded-t-2xl flex items-center justify-between max-sm:rounded-none">
            <div className="flex items-center gap-3">
              <MessageCircle className="w-8 h-8" />
              <div>
                <div className="font-bold flex items-center gap-2">
                  Hỗ Trợ Khách Hàng
                  {isConnected ? (
                    <span className="w-2 h-2 bg-green-400 rounded-full" />
                  ) : (
                    <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                  )}
                </div>
                <div className="text-xs opacity-90">
                  {user
                    ? isConnected
                      ? "Chúng tôi sẵn sàng hỗ trợ"
                      : "Đang kết nối..."
                    : "Vui lòng đăng nhập"}
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden flex flex-col bg-gray-50">
            {!user ? (
              // Login required
              <div className="flex flex-col items-center justify-center p-10 text-center h-full">
                <Lock className="w-16 h-16 text-gray-400 mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Vui lòng đăng nhập
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Bạn cần đăng nhập để sử dụng tính năng hỗ trợ
                </p>
                <button
                  onClick={() => (window.location.href = "/login")}
                  className="px-6 py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg"
                >
                  Đăng nhập ngay
                </button>
              </div>
            ) : loadingChat ? (
              // Loading
              <div className="flex items-center justify-center h-full">
                <div className="text-gray-500">⏳ Đang tải...</div>
              </div>
            ) : (
              // Chat
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400">
                      <MessageCircle className="w-16 h-16 mb-3" />
                      <p className="text-sm">Bắt đầu cuộc trò chuyện</p>
                    </div>
                  ) : (
                    messages.map((msg) => (
                      <div
                        key={msg._id}
                        className={`flex flex-col ${
                          msg.senderType === "user"
                            ? "items-end"
                            : msg.isSystemMessage
                            ? "items-center"
                            : "items-start"
                        }`}
                      >
                        {msg.isSystemMessage ? (
                          <div className="px-4 py-2 bg-gray-200 text-gray-600 rounded-xl text-xs">
                            {msg.content}
                          </div>
                        ) : (
                          <>
                            <div
                              className={`px-4 py-2.5 rounded-2xl max-w-[75%] text-sm ${
                                msg.senderType === "user"
                                  ? "bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-br-sm"
                                  : "bg-white border border-gray-200 text-gray-900 rounded-bl-sm"
                              }`}
                            >
                              {msg.content}
                            </div>
                            <div className="text-xs text-gray-400 mt-1">
                              {formatTime(msg.createdAt)}
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-2xl rounded-bl-sm max-w-fit">
                      <div className="flex gap-1">
                        {[1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                            style={{ animationDelay: `${i * 0.15}s` }}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-600 italic">
                        Admin đang nhập...
                      </span>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="flex gap-2 p-4 bg-white border-t border-gray-200">
                  <input
                    type="text"
                    placeholder={
                      isConnected ? "Nhập tin nhắn..." : "Đang kết nối..."
                    }
                    value={messageInput}
                    onChange={handleTyping}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    disabled={sending || !isConnected}
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-full focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim() || sending || !isConnected}
                    className="w-11 h-11 bg-linear-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white hover:shadow-lg hover:scale-105 transition-all disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
