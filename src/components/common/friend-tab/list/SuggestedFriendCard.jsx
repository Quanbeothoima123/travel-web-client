"use client";

import { useState } from "react";
import { UserPlus, Eye } from "lucide-react";
import FriendRequestModal from "@/components/common/friend-tab/list/FriendRequestModal";

const SuggestedFriendCard = ({ user, onAddFriend, onViewProfile }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const displayName = user.customName || user.userName || "Unknown";
  const avatarLetter = displayName[0]?.toUpperCase() || "U";

  const handleAddFriendClick = () => {
    setShowModal(true);
  };

  const handleSendRequest = async (message) => {
    console.log("Message to send:", message);
    setIsLoading(true);
    try {
      await onAddFriend(user._id, message);
      setShowModal(false);
    } catch (error) {
      console.error("Error sending friend request:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    if (!isLoading) {
      setShowModal(false);
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-4 transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5">
        <div className="flex items-center gap-3">
          {/* Avatar */}
          <div className="shrink-0">
            {user.avatar ? (
              <img
                src={user.avatar}
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
            <h4 className="text-base font-semibold text-gray-800 mb-1 whitespace-nowrap overflow-hidden text-ellipsis m-0">
              {displayName}
            </h4>
            <p className="text-[13px] text-gray-600 m-0">@{user.userName}</p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 items-center">
            <button
              onClick={handleAddFriendClick}
              className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white border-none rounded-md text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-blue-700 hover:-translate-y-0.5 disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isLoading}
              title="Thêm bạn bè"
            >
              <UserPlus className="w-4 h-4" />
              Kết bạn
            </button>
            <button
              onClick={() => onViewProfile(user._id)}
              className="p-2 bg-gray-200 text-gray-800 border-none rounded-md cursor-pointer transition-all duration-200 hover:bg-gray-300"
              title="Xem trang cá nhân"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <FriendRequestModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onSend={handleSendRequest}
        userName={displayName}
        isLoading={isLoading}
      />
    </>
  );
};

export default SuggestedFriendCard;
