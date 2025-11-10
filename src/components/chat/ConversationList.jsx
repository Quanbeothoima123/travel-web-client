// components/chat/ConversationList.jsx
import { Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { vi } from "date-fns/locale";

export default function ConversationList({ conversations, loading, onSelect }) {
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-4">
        <p className="text-gray-500 text-center">Chưa có cuộc trò chuyện nào</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conv) => (
        <button
          key={conv.conversationId}
          onClick={() => onSelect(conv.conversationId)}
          className="w-full p-4 hover:bg-gray-50 transition flex items-start space-x-3 border-b border-gray-100"
        >
          {/* Avatar */}
          <div className="relative flex-shrink-0">
            {conv.type === "group" ? (
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
            ) : (
              <img
                src={conv.avatar || "/default-avatar.png"}
                alt=""
                className="w-12 h-12 rounded-full object-cover"
              />
            )}
            {conv.unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
              </span>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between mb-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {conv.name}
              </h3>
              {conv.lastMessage && (
                <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                  {formatDistanceToNow(new Date(conv.lastMessage.createdAt), {
                    addSuffix: true,
                    locale: vi,
                  })}
                </span>
              )}
            </div>
            {conv.type === "group" && (
              <p className="text-xs text-gray-500 mb-1">
                {conv.groupInfo?.membersCount} thành viên
              </p>
            )}
            {conv.lastMessage && (
              <p
                className={`text-sm truncate ${
                  conv.unreadCount > 0
                    ? "font-semibold text-gray-900"
                    : "text-gray-600"
                }`}
              >
                {conv.lastMessage.isMe && "Bạn: "}
                {conv.lastMessage.content}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
