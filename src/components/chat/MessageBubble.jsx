// ========================================
// components/chat/MessageBubble.jsx (IMPROVED)
// ========================================
import { Reply, Trash2 } from "lucide-react";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default function MessageBubble({
  message,
  prevMessage,
  nextMessage,
  isGroup,
  currentUserId,
  onReply,
  onDelete,
}) {
  const [showActions, setShowActions] = useState(false);
  const isOwnMessage = message.senderId._id === currentUserId;
  const isDeleted = message.deletedFor?.includes(currentUserId);

  if (isDeleted) return null;

  // ✅ Logic hiển thị avatar
  const isSameSenderAsPrev =
    prevMessage && prevMessage.senderId._id === message.senderId._id;

  const isSameSenderAsNext =
    nextMessage && nextMessage.senderId._id === message.senderId._id;

  // Hiện avatar nếu:
  // - Tin nhắn đầu tiên (không có prev)
  // - Người gửi khác với tin trước
  // - Cách tin trước > 1 phút
  // - Là tin cuối của chuỗi (không có next hoặc next khác người gửi)
  const showAvatar =
    !isSameSenderAsPrev ||
    !prevMessage ||
    new Date(message.createdAt) - new Date(prevMessage.createdAt) > 60000 ||
    !isSameSenderAsNext;

  // ✅ Hiển thị tên nếu là tin đầu của chuỗi
  const showName = !isSameSenderAsPrev || !prevMessage;

  // ✅ Margin top giữa các chuỗi tin nhắn
  const marginTop = !isSameSenderAsPrev ? "mt-4" : "mt-1";

  return (
    <div
      className={`flex ${marginTop} ${
        isOwnMessage ? "justify-end" : "justify-start"
      }`}
    >
      {/* ✅ Avatar space (group chat only) */}
      {!isOwnMessage && isGroup && (
        <div className="w-8 mr-2 flex-shrink-0">
          {showAvatar ? (
            <img
              src={message.senderId.avatar || "/default-avatar.png"}
              alt=""
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : null}
        </div>
      )}

      {/* Message content */}
      <div className={`max-w-md ${isOwnMessage ? "items-end" : "items-start"}`}>
        {/* ✅ Sender name (group chat only, first message in sequence) */}
        {!isOwnMessage && isGroup && showName && (
          <p className="text-xs text-gray-600 mb-1 ml-1">
            {message.senderId.customName || message.senderId.userName}
          </p>
        )}

        {/* Reply To */}
        {message.replyTo && (
          <div className="bg-gray-200 rounded-lg p-2 mb-1 text-xs max-w-xs">
            <p className="font-semibold text-gray-700">
              {message.replyTo.senderId?.customName ||
                message.replyTo.senderId?.userName ||
                "Người dùng"}
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
                className="p-1 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
                title="Trả lời"
              >
                <Reply className="w-4 h-4 text-gray-600" />
              </button>
              {isOwnMessage && (
                <button
                  onClick={() => onDelete(message._id)}
                  className="p-1 bg-white rounded-full shadow-md hover:bg-red-50 transition-colors"
                  title="Xóa"
                >
                  <Trash2 className="w-4 h-4 text-red-600" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ✅ Timestamp (chỉ hiện ở tin cuối của chuỗi hoặc khi hover) */}
        {(showAvatar || showActions) && (
          <p className="text-xs text-gray-500 mt-1 ml-1">
            {formatDistanceToNow(new Date(message.createdAt), {
              addSuffix: true,
              locale: vi,
            })}
          </p>
        )}
      </div>
    </div>
  );
}
