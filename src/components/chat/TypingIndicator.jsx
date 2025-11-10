// ========================================
// components/chat/TypingIndicator.jsx
// ========================================
export default function TypingIndicator({ typingUsers, conversation }) {
  if (typingUsers.length === 0) return null;

  return (
    <div className="flex items-center space-x-2">
      {typingUsers.slice(0, 3).map((userId) => {
        const user = conversation?.members?.find((m) => m.userId === userId);
        return (
          <img
            key={userId}
            src={user?.avatar || "/default-avatar.png"}
            alt=""
            className="w-6 h-6 rounded-full"
          />
        );
      })}
      <div className="flex space-x-1 bg-gray-200 rounded-full px-3 py-2">
        <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
        <div
          className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
          style={{ animationDelay: "0.1s" }}
        ></div>
        <div
          className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"
          style={{ animationDelay: "0.2s" }}
        ></div>
      </div>
    </div>
  );
}
