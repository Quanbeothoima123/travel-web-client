"use client";

import { useState } from "react";
import { Unlock, MoreVertical, User } from "lucide-react";
import ConfirmModal from "@/components/common/ConfirmModal";

const BlockedCard = ({ blocked, onUnblock, onViewProfile }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const displayName = blocked.customName || blocked.userName || "Unknown";
  const avatarLetter = displayName[0]?.toUpperCase() || "U";

  const handleUnblockClick = () => {
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    onUnblock(blocked._id);
    setShowConfirm(false);
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-4 transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5">
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar */}
          <div className="shrink-0">
            {blocked.avatar ? (
              <img
                src={blocked.avatar}
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover grayscale opacity-70"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-gray-500 to-gray-600 flex items-center justify-center text-white text-xl font-bold opacity-70">
                {avatarLetter}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-base md:text-base font-semibold text-gray-800 mb-1 whitespace-nowrap overflow-hidden text-ellipsis m-0">
              {displayName}
            </h4>
            <p className="text-[13px] md:text-[13px] text-gray-600 m-0 mb-1">
              @{blocked.userName}
            </p>
            {blocked.reason && (
              <p className="text-xs text-gray-400 italic m-0">
                Lý do: {blocked.reason}
              </p>
            )}
          </div>

          {/* Menu */}
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
                      onViewProfile(blocked._id);
                      setShowMenu(false);
                    }}
                    className="w-full px-4 py-2.5 bg-transparent border-none text-left cursor-pointer transition-colors duration-200 flex items-center gap-2.5 text-sm text-gray-800 hover:bg-gray-100"
                  >
                    <User className="w-4 h-4" />
                    Xem trang cá nhân
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex">
          <button
            onClick={handleUnblockClick}
            className="w-full px-4 py-2.5 md:py-2.5 bg-green-500 text-white border-none rounded-lg text-[13px] md:text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5 hover:bg-green-600"
          >
            <Unlock className="w-4 h-4" />
            Bỏ chặn
          </button>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleConfirm}
        title="Bỏ chặn người dùng"
        message={`Bạn có chắc muốn bỏ chặn ${displayName}?`}
      />
    </>
  );
};

export default BlockedCard;
