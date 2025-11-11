"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MessageCircle, MoreVertical, User, UserX } from "lucide-react";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const FriendCard = ({ friend, onUnfriend, onViewProfile }) => {
  const { fetchWithAuth } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const displayName = friend.customName || friend.userName || "Unknown";
  const avatarLetter = displayName[0]?.toUpperCase() || "U";

  const handleUnfriendClick = () => {
    setShowMenu(false);
    setShowConfirm(true);
  };

  const handleConfirmUnfriend = () => {
    onUnfriend(friend._id);
    setShowConfirm(false);
  };

  const handleMessageClick = async (e) => {
    e.preventDefault();
    if (isCreatingChat) return;

    setIsCreatingChat(true);

    try {
      const response = await fetchWithAuth(
        `${API_BASE}/api/v1/conversation/create-or-get`,
        {
          method: "POST",
          body: JSON.stringify({ otherUserId: friend._id }),
        }
      );
      const result = await response.json();
      if (result.success) {
        router.push(`/user/chat/${result.data.conversationId}`);
      } else {
        console.error("❌ Create chat failed:", result);
        showToast("Không thể tạo đoạn chat. Vui lòng thử lại!", "error");
      }
    } catch (error) {
      console.error("❌ Create chat error:", error);
      showToast("Đã xảy ra lỗi. Vui lòng thử lại!", "error");
    } finally {
      setTimeout(() => setIsCreatingChat(false), 2000);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-4 transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="shrink-0">
            {friend.avatar ? (
              <img
                src={friend.avatar}
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
                {avatarLetter}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-base font-semibold text-gray-800 mb-1 whitespace-nowrap overflow-hidden text-ellipsis">
              {displayName}
            </h4>
            <p className="text-[13px] text-gray-600 m-0">@{friend.userName}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 items-center">
            {/* Message Button */}
            <button
              onClick={handleMessageClick}
              className="p-2.5 bg-blue-500 text-white border-none rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center text-base hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Nhắn tin"
              disabled={isCreatingChat}
            >
              {isCreatingChat ? (
                <span className="text-sm">...</span>
              ) : (
                <MessageCircle className="w-4 h-4" />
              )}
            </button>

            {/* More Menu */}
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2.5 bg-gray-100 text-gray-600 border-none rounded-lg cursor-pointer transition-all duration-200 flex items-center justify-center text-base hover:bg-gray-200 hover:text-gray-800"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-9"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-[calc(100%+4px)] bg-white border border-gray-200 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.15)] py-2 min-w-[200px] z-10">
                    <button
                      onClick={() => {
                        onViewProfile(friend._id);
                        setShowMenu(false);
                      }}
                      className="w-full px-4 py-2.5 bg-transparent border-none text-left cursor-pointer transition-colors duration-200 flex items-center gap-2.5 text-sm text-gray-800 hover:bg-gray-100"
                    >
                      <User className="w-4 h-4" />
                      Xem trang cá nhân
                    </button>
                    <button
                      onClick={handleUnfriendClick}
                      className="w-full px-4 py-2.5 bg-transparent border-none text-left cursor-pointer transition-colors duration-200 flex items-center gap-2.5 text-sm text-red-600 hover:bg-red-50"
                    >
                      <UserX className="w-4 h-4" />
                      Hủy kết bạn
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirmUnfriend}
        title="Hủy kết bạn"
        message={`Bạn có chắc muốn hủy kết bạn với ${displayName}?`}
      />
    </>
  );
};

export default FriendCard;
