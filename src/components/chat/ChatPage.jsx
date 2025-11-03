"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { io } from "socket.io-client";
import {
  Send,
  ArrowLeft,
  Edit,
  Image as ImageIcon,
  Smile,
  Paperclip,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { selectAndUploadImages } from "@/lib/utils/imageUpload.utils";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

let socket = null;

const ChatPage = () => {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();

  const chatId = params?.chatId;

  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [typing, setTyping] = useState(null);
  const [showNicknameModal, setShowNicknameModal] = useState(false);
  const [nickname, setNickname] = useState("");

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
    setShowSidebar(!chatId || window.innerWidth >= 768);
  }, [chatId]);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  const loadChatList = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/chat/getChatList`, {
        credentials: "include",
      });
      const result = await response.json();

      if (result.success) {
        setChats(result.data);

        if (!chatId && result.data.length > 0 && !isMobile) {
          router.replace(`/user/chat/${result.data[0].chatId}`);
        }
      }
    } catch (error) {
      console.error("❌ Load chat list error:", error);
    }
  }, [chatId, isMobile, router]);

  const loadChatDetail = useCallback(
    async (id) => {
      setLoading(true);
      try {
        const messagesResponse = await fetch(
          `${API_BASE}/api/v1/message/get-messages/${id}`,
          { credentials: "include" }
        );
        const messagesResult = await messagesResponse.json();

        if (messagesResult.success) {
          setMessages(messagesResult.data.messages);
        }

        const chatResponse = await fetch(
          `${API_BASE}/api/v1/chat/detail/${id}`,
          { credentials: "include" }
        );
        const chatResult = await chatResponse.json();

        if (chatResult.success) {
          setActiveChat(chatResult.data);
          setNickname(chatResult.data.otherUser.name);
        }

        if (socket && socket.connected) {
          socket.emit("join-chat", id);
          socket.emit("mark-as-read", { chatId: id });
        }

        setChats((prev) =>
          prev.map((chat) =>
            chat.chatId === id ? { ...chat, unreadCount: 0 } : chat
          )
        );

        scrollToBottom();
      } catch (error) {
        console.error("❌ Load chat detail error:", error);
      } finally {
        setLoading(false);
      }
    },
    [scrollToBottom]
  );

  const createOrGetChat = useCallback(
    async (otherUserId) => {
      if (createOrGetChat.pending) {
        console.log("⏳ Chat creation already in progress");
        return;
      }

      createOrGetChat.pending = true;

      try {
        const response = await fetch(`${API_BASE}/api/v1/chat/create-or-get`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ otherUserId }),
        });

        const result = await response.json();

        if (result.success) {
          router.replace(`/user/chat/${result.data.chatId}`);
          loadChatList();
        }
      } catch (error) {
        console.error("❌ Create chat error:", error);
      } finally {
        setTimeout(() => {
          createOrGetChat.pending = false;
        }, 1000);
      }
    },
    [router, loadChatList]
  );

  useEffect(() => {
    if (!socket && user) {
      console.log("🔌 Initializing socket connection...");

      socket = io(API_BASE, {
        auth: { userId: user._id },
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socket.on("connect", () => {
        console.log("✅ Socket connected:", socket.id);
      });

      socket.on("connect_error", (error) => {
        console.error("❌ Socket connection error:", error.message);
      });

      socket.on("new-message", (message) => {
        console.log("📨 New message received:", message);
        setMessages((prev) => [...prev, message]);
        scrollToBottom();
      });

      socket.on("chat-updated", ({ chatId: updatedChatId, lastMessage }) => {
        console.log("🔄 Chat updated:", updatedChatId);
        setChats((prev) => {
          const updated = prev.map((chat) =>
            chat.chatId === updatedChatId
              ? {
                  ...chat,
                  lastMessage,
                  updatedAt: new Date(),
                  unreadCount: chat.unreadCount + 1,
                }
              : chat
          );
          return updated.sort(
            (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
          );
        });
      });

      socket.on("user-typing", ({ userId }) => {
        setTyping(userId);
      });

      socket.on("user-stop-typing", () => {
        setTyping(null);
      });

      socket.on("message-deleted", ({ messageId }) => {
        setMessages((prev) => prev.filter((m) => m._id !== messageId));
      });

      socket.on("message-edited", (editedMessage) => {
        setMessages((prev) =>
          prev.map((m) => (m._id === editedMessage._id ? editedMessage : m))
        );
      });

      socket.on("message-reacted", ({ messageId, reactions }) => {
        setMessages((prev) =>
          prev.map((m) => (m._id === messageId ? { ...m, reactions } : m))
        );
      });
    }

    return () => {
      if (socket) {
        console.log("🔌 Disconnecting socket...");
        socket.disconnect();
        socket = null;
      }
    };
  }, [user, scrollToBottom]);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setShowSidebar(true);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (user) {
      loadChatList();
    }
  }, [user, loadChatList]);

  useEffect(() => {
    if (chatId && user) {
      loadChatDetail(chatId);
      if (isMobile) setShowSidebar(false);
    }
  }, [chatId, isMobile, user, loadChatDetail]);

  useEffect(() => {
    const otherUserId = searchParams?.get("userId");

    if (otherUserId && !chatId && user) {
      console.log("📧 Creating/getting chat with user:", otherUserId);
      createOrGetChat(otherUserId);
    }
  }, [searchParams, chatId, user, createOrGetChat]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId || !socket) return;

    const messageData = {
      chatId,
      content: newMessage.trim(),
      type: "text",
    };

    setNewMessage("");

    socket.emit("send-message", messageData);
    socket.emit("typing-stop", { chatId });
  };

  const handleSendImage = () => {
    if (!chatId || uploading || !socket) return;

    selectAndUploadImages({
      multiple: false,
      onStart: () => {
        setUploading(true);
      },
      onSuccess: (imageUrl) => {
        const messageData = {
          chatId,
          content: imageUrl,
          type: "image",
        };

        socket.emit("send-message", messageData);
        setUploading(false);
      },
      onError: (error) => {
        console.error("❌ Upload image error:", error);
        alert("Không thể tải ảnh lên. Vui lòng thử lại!");
        setUploading(false);
      },
    });
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);

    if (socket && chatId) {
      socket.emit("typing-start", { chatId });

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing-stop", { chatId });
      }, 1000);
    }
  };

  const handleSetNickname = async () => {
    if (!chatId) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/chat/nickname/${chatId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ nickname }),
        }
      );

      const result = await response.json();

      if (result.success) {
        setActiveChat((prev) => ({
          ...prev,
          otherUser: { ...prev.otherUser, name: nickname },
        }));

        setChats((prev) =>
          prev.map((chat) =>
            chat.chatId === chatId
              ? { ...chat, otherUser: { ...chat.otherUser, name: nickname } }
              : chat
          )
        );

        setShowNicknameModal(false);
        alert("Đã đặt biệt danh thành công!");
      }
    } catch (error) {
      console.error("❌ Set nickname error:", error);
      alert("Không thể đặt biệt danh");
    }
  };

  if (authLoading) {
    return (
      <div className="text-center py-[60px] px-5 text-base text-gray-600">
        Đang tải...
      </div>
    );
  }

  if (!user) {
    router.replace("/login");
    return null;
  }

  const formatTime = (date) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Vừa xong";
    if (diffMins < 60) return `${diffMins} phút`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)} giờ`;
    return d.toLocaleDateString("vi-VN");
  };

  const formatMessagePreview = (msg) => {
    if (!msg) return "Chưa có tin nhắn";
    switch (msg.type) {
      case "image":
        return "📷 Hình ảnh";
      case "file":
        return "📎 File";
      case "video":
        return "🎥 Video";
      default:
        return msg.content || "";
    }
  };

  return (
    <div className="flex h-[800px] bg-white overflow-hidden rounded-xl border border-gray-200 shadow-sm">
      {/* Sidebar */}
      <div
        className={`w-[360px] border-r border-gray-200 flex flex-col bg-white transition-all duration-300 ${
          showSidebar ? "" : "hidden md:flex"
        } ${isMobile && !showSidebar ? "hidden" : ""}`}
      >
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 m-0">Đoạn chat</h2>
        </div>

        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => (
            <div
              key={chat.chatId}
              className={`flex items-center p-3 cursor-pointer transition-colors ${
                chatId === chat.chatId ? "bg-blue-50" : "hover:bg-gray-100"
              }`}
              onClick={() => {
                router.push(`/user/chat/${chat.chatId}`);
                if (isMobile) setShowSidebar(false);
              }}
            >
              <div className="w-14 h-14 mr-3 shrink-0">
                <img
                  src={chat.otherUser.avatar || "/default-avatar.png"}
                  alt={chat.otherUser.name}
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[15px] mb-0.5 overflow-hidden text-ellipsis whitespace-nowrap text-gray-900">
                  {chat.otherUser.name}
                </div>
                <div className="text-[13px] text-gray-600 overflow-hidden text-ellipsis whitespace-nowrap">
                  {chat.lastMessage?.isMe && "Bạn: "}
                  {formatMessagePreview(chat.lastMessage)}
                </div>
              </div>

              <div className="flex flex-col items-end ml-2">
                <div className="text-xs text-gray-600 mb-1">
                  {formatTime(chat.updatedAt)}
                </div>
                {chat.unreadCount > 0 && (
                  <div className="bg-blue-600 text-white rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center text-xs font-semibold">
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            </div>
          ))}

          {chats.length === 0 && (
            <div className="p-8 text-center text-gray-600 text-[15px]">
              Chưa có đoạn chat nào
            </div>
          )}
        </div>
      </div>

      {/* Chat Content */}
      <div className="flex-1 flex flex-col bg-white min-w-0">
        {!chatId ? (
          <div className="flex-1 flex items-center justify-center text-gray-600 text-base">
            <p>Chọn một đoạn chat để bắt đầu nhắn tin</p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center p-3 border-b border-gray-200 bg-white">
              {isMobile && (
                <button
                  className="p-2 mr-2 rounded-full hover:bg-gray-100 text-gray-900"
                  onClick={() => {
                    setShowSidebar(true);
                    router.push("/user/chat");
                  }}
                >
                  <ArrowLeft size={20} />
                </button>
              )}

              <div className="flex items-center flex-1 min-w-0">
                <img
                  src={activeChat?.otherUser.avatar || "/default-avatar.png"}
                  alt={activeChat?.otherUser.name}
                  className="w-10 h-10 rounded-full mr-3 object-cover"
                />
                <div className="font-semibold text-[15px] text-gray-900 truncate">
                  {activeChat?.otherUser.name}
                </div>
              </div>

              <button
                className="p-2 rounded-full hover:bg-gray-100 text-gray-600"
                onClick={() => setShowNicknameModal(true)}
                title="Đặt biệt danh"
              >
                <Edit size={18} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 bg-white">
              {loading && (
                <div className="text-center p-5 text-gray-600">Đang tải...</div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg._id}
                  className={`flex items-end gap-2 ${
                    msg.sender._id === user._id ? "flex-row-reverse" : ""
                  }`}
                >
                  {msg.sender._id !== user._id && (
                    <img
                      src={msg.sender.avatar || "/default-avatar.png"}
                      alt={msg.sender.userName}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                    />
                  )}

                  <div
                    className={`max-w-[60%] p-2 px-3 rounded-[18px] break-words ${
                      msg.sender._id === user._id
                        ? "bg-blue-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {msg.type === "image" ? (
                      <div className="max-w-[300px] rounded-xl overflow-hidden cursor-pointer">
                        <img
                          src={msg.content}
                          alt="Attachment"
                          className="w-full h-auto block"
                          onClick={() => window.open(msg.content, "_blank")}
                        />
                      </div>
                    ) : (
                      <div className="text-[15px] leading-[1.4] break-words">
                        {msg.content}
                        {msg.edited && (
                          <span className="text-xs opacity-70 italic">
                            {" "}
                            (đã chỉnh sửa)
                          </span>
                        )}
                      </div>
                    )}
                    <div className="text-[11px] mt-1 opacity-70">
                      {new Date(msg.createdAt).toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                </div>
              ))}

              {typing && (
                <div className="flex items-center gap-1 p-2 px-3 bg-gray-100 rounded-[18px] w-fit">
                  <span className="w-2 h-2 rounded-full bg-gray-600 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-gray-600 animate-pulse" />
                  <span className="w-2 h-2 rounded-full bg-gray-600 animate-pulse" />
                </div>
              )}

              {uploading && (
                <div className="p-2 px-3 bg-blue-50 text-blue-600 rounded-[18px] w-fit text-[13px]">
                  Đang tải ảnh lên...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form
              className="flex items-center gap-2 p-3 border-t border-gray-200 bg-white"
              onSubmit={sendMessage}
            >
              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 text-blue-600"
                onClick={handleSendImage}
                disabled={uploading}
                title="Gửi ảnh"
              >
                <ImageIcon size={20} />
              </button>

              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 text-blue-600"
                disabled
              >
                <Paperclip size={20} />
              </button>

              <input
                type="text"
                value={newMessage}
                onChange={handleTyping}
                placeholder="Aa"
                className="flex-1 py-2.5 px-4 border-none rounded-[20px] bg-gray-100 text-[15px] outline-none focus:bg-gray-200"
                disabled={uploading}
              />

              <button
                type="button"
                className="p-2 rounded-full hover:bg-gray-100 text-blue-600"
                disabled
              >
                <Smile size={20} />
              </button>

              <button
                type="submit"
                className="p-2 rounded-full hover:bg-gray-100 text-blue-600 disabled:opacity-50"
                disabled={!newMessage.trim() || uploading}
              >
                <Send size={18} />
              </button>
            </form>
          </>
        )}
      </div>

      {/* Nickname Modal */}
      {showNicknameModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[1000]"
          onClick={() => setShowNicknameModal(false)}
        >
          <div
            className="bg-white p-6 rounded-xl w-[400px] max-w-[90%]"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-semibold mb-4 mt-0">Đặt biệt danh</h3>
            <input
              type="text"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Nhập biệt danh"
              className="w-full p-3 border border-gray-200 rounded-lg text-[15px] mb-4 outline-none focus:border-blue-600"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowNicknameModal(false)}
                className="py-2.5 px-5 border-none rounded-lg text-[15px] font-semibold bg-gray-200 text-gray-900 hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleSetNickname}
                className="py-2.5 px-5 border-none rounded-lg text-[15px] font-semibold bg-blue-600 text-white hover:bg-blue-700"
              >
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatPage;
