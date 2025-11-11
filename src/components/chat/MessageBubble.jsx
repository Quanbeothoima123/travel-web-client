// ========================================
// components/chat/MessageBubble.jsx
// ========================================
import { Reply, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default function MessageBubble({
  message,
  prevMessage,
  isGroup,
  currentUserId,
  onReply,
  onDelete,
}) {
  const [showActions, setShowActions] = useState(false);
  const isOwnMessage = message.senderId._id === currentUserId;
  const isDeleted = message.deletedFor?.includes(currentUserId);

  if (isDeleted) return null;

  // Check if should show avatar
  const showAvatar =
    !prevMessage ||
    prevMessage.senderId._id !== message.senderId._id ||
    new Date(message.createdAt) - new Date(prevMessage.createdAt) > 60000;

  return (
    <div
      className={`flex ${isOwnMessage ? "justify-end" : "justify-start"} ${
        !showAvatar && !isOwnMessage ? "ml-12" : ""
      }`}
    >
      {/* Avatar */}
      {!isOwnMessage && isGroup && showAvatar && (
        <img
          src={message.senderId.avatar || "/default-avatar.png"}
          alt=""
          className="w-8 h-8 rounded-full mr-2 flex-shrink-0"
        />
      )}
      {!isOwnMessage && isGroup && !showAvatar && <div className="w-8 mr-2" />}

      <div className={`max-w-md ${isOwnMessage ? "items-end" : "items-start"}`}>
        {/* Sender name */}
        {!isOwnMessage && isGroup && showAvatar && (
          <p className="text-xs text-gray-600 mb-1 ml-1">
            {message.senderId.customName || message.senderId.userName}
          </p>
        )}

        {/* Reply To */}
        {message.replyTo && (
          <div className="bg-gray-200 rounded-lg p-2 mb-1 text-xs max-w-xs">
            <p className="font-semibold text-gray-700">
              {message.replyTo.senderId?.customName || "Người dùng"}
            </p>
            <p className="text-gray-600 truncate">
              {message.replyTo.deletedFor?.length > 0
                ? "Tin nhắn đã bị xóa"
                : message.replyTo.content}
            </p>
          </div>
        )}

        {/* Message Bubble */}
        <div
          className="relative group"
          onMouseEnter={() => setShowActions(true)}
          onMouseLeave={() => setShowActions(false)}
        >
          <div
            className={`rounded-2xl px-4 py-2 ${
              isOwnMessage
                ? "bg-purple-600 text-white"
                : "bg-gray-200 text-gray-900"
            }`}
          >
            <p className="break-words whitespace-pre-wrap">{message.content}</p>
            {message.edited && (
              <span className="text-xs opacity-70 italic ml-2">
                (đã chỉnh sửa)
              </span>
            )}
          </div>

          {/* Actions */}
          {showActions && (
            <div
              className={`absolute top-0 flex space-x-1 ${
                isOwnMessage ? "right-full mr-2" : "left-full ml-2"
              }`}
            >
              <button
                onClick={() => onReply(message)}
                className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                title="Trả lời"
              >
                <Reply className="w-4 h-4 text-gray-600" />
              </button>
              {isOwnMessage && (
                <button
                  onClick={() => onDelete(message._id)}
                  className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <p className="text-xs text-gray-500 mt-1 ml-1">
          {formatDistanceToNow(new Date(message.createdAt), {
            addSuffix: true,
            locale: vi,
          })}
        </p>
      </div>
    </div>
  );
}
