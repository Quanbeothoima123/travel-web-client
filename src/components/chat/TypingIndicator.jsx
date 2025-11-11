// ========================================
// components/chat/TypingIndicator.jsx
// ========================================
export default function TypingIndicator({ typingUsers, conversation }) {
  if (!typingUsers || typingUsers.length === 0) return null;

  // Hiển thị tối đa 3 người
  const displayUsers = typingUsers.slice(0, 3);

  return (
    <div className="flex items-start space-x-2 px-4">
      {/* Avatar của người typing */}
      <div className="flex -space-x-2">
        {displayUsers.map((user, index) => (
          <img
            key={user.userId}
            src={user.userInfo?.avatar || "/default-avatar.png"}
            alt={user.userInfo?.customName || user.userInfo?.name || "User"}
            className="w-6 h-6 rounded-full border-2 border-white"
            style={{ zIndex: displayUsers.length - index }}
            title={user.userInfo?.customName || user.userInfo?.name}
          />
        ))}
      </div>

      {/* Typing animation dots */}
      <div className="bg-gray-200 rounded-2xl px-4 py-2.5 flex items-center">
        <div className="flex space-x-1">
          <span
            className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
            style={{ animationDelay: "0ms" }}
          ></span>
          <span
            className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
            style={{ animationDelay: "150ms" }}
          ></span>
          <span
            className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
            style={{ animationDelay: "300ms" }}
          ></span>
        </div>
      </div>

      {/* Optional: Text mô tả ai đang typing */}
      {typingUsers.length === 1 && (
        <span className="text-xs text-gray-500 self-end mb-1">
          {displayUsers[0].userInfo?.customName ||
            displayUsers[0].userInfo?.name}{" "}
          đang nhắn...
        </span>
      )}

      {typingUsers.length === 2 && (
        <span className="text-xs text-gray-500 self-end mb-1">
          {displayUsers[0].userInfo?.customName ||
            displayUsers[0].userInfo?.name}{" "}
          và{" "}
          {displayUsers[1].userInfo?.customName ||
            displayUsers[1].userInfo?.name}{" "}
          đang nhắn...
        </span>
      )}

      {typingUsers.length > 2 && (
        <span className="text-xs text-gray-500 self-end mb-1">
          {typingUsers.length} người đang nhắn...
        </span>
      )}
    </div>
  );
}
