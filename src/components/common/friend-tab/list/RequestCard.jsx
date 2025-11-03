"use client";

import { useState } from "react";
import { Check, X, Ban, MoreVertical, User } from "lucide-react";
import ConfirmModal from "@/components/common/ConfirmModal";
import ViewMessageModal from "@/components/common/friend-tab/list/ViewMessageModal";

const RequestCard = ({
  request,
  type,
  onAccept,
  onReject,
  onCancel,
  onViewProfile,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);

  const displayName = request.customName || request.userName || "Unknown";
  const avatarLetter = displayName[0]?.toUpperCase() || "U";

  const truncateMessage = (msg, maxLength = 60) => {
    if (!msg) return "";
    return msg.length > maxLength ? msg.substring(0, maxLength) + "..." : msg;
  };

  const handleActionClick = (action, actionFn) => {
    setConfirmAction({ type: action, fn: actionFn });
    setShowConfirm(true);
  };

  const handleConfirm = () => {
    if (confirmAction && confirmAction.fn) {
      confirmAction.fn(request._id);
    }
    setShowConfirm(false);
    setConfirmAction(null);
  };

  const getConfirmMessage = () => {
    if (!confirmAction) return "";
    switch (confirmAction.type) {
      case "reject":
        return `Bạn có chắc muốn từ chối lời mời kết bạn từ ${displayName}?`;
      case "cancel":
        return `Bạn có chắc muốn hủy lời mời kết bạn đã gửi đến ${displayName}?`;
      default:
        return "Bạn có chắc chắn?";
    }
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-xl p-4 transition-all duration-200 hover:shadow-[0_4px_12px_rgba(0,0,0,0.1)] hover:-translate-y-0.5">
        <div className="flex items-center gap-3 mb-3">
          {/* Avatar */}
          <div className="shrink-0">
            {request.avatar ? (
              <img
                src={request.avatar}
                alt={displayName}
                className="w-12 h-12 rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-linear-to-br from-pink-400 to-red-500 flex items-center justify-center text-white text-xl font-bold">
                {avatarLetter}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h4 className="text-base md:text-base font-semibold text-gray-800 mb-1 whitespace-nowrap overflow-hidden text-ellipsis m-0">
              {displayName}
            </h4>
            <p className="text-[13px] md:text-[13px] text-gray-600 m-0">
              @{request.userName}
            </p>
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
                      onViewProfile(request._id);
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

        {/* Message */}
        {request.message && (
          <div className="bg-gray-50 p-3 rounded-lg mb-3">
            <p className="m-0 mb-1 text-sm text-gray-700 leading-normal">
              {truncateMessage(request.message)}
            </p>
            {request.message.length > 60 && (
              <button
                onClick={() => setShowMessageModal(true)}
                className="bg-transparent border-none text-blue-500 text-xs cursor-pointer p-0 hover:underline"
              >
                Xem thêm
              </button>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {type === "received" ? (
            <>
              <button
                onClick={() => onAccept(request._id)}
                className="flex-1 px-4 py-2.5 md:py-2.5 border-none rounded-lg text-[13px] md:text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5 bg-green-500 text-white hover:bg-green-600"
              >
                <Check className="w-4 h-4" />
                Chấp nhận
              </button>
              <button
                onClick={() => handleActionClick("reject", onReject)}
                className="flex-1 px-4 py-2.5 md:py-2.5 border-none rounded-lg text-[13px] md:text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5 bg-gray-200 text-gray-600 hover:bg-gray-300 hover:text-gray-800"
              >
                <X className="w-4 h-4" />
                Từ chối
              </button>
            </>
          ) : (
            <button
              onClick={() => handleActionClick("cancel", onCancel)}
              className="flex-1 px-4 py-2.5 md:py-2.5 border-none rounded-lg text-[13px] md:text-sm font-semibold cursor-pointer transition-all duration-200 flex items-center justify-center gap-1.5 bg-red-500 text-white hover:bg-red-600"
            >
              <Ban className="w-4 h-4" />
              Hủy lời mời
            </button>
          )}
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={() => {
          setShowConfirm(false);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirm}
        title={
          confirmAction?.type === "reject" ? "Từ chối lời mời" : "Hủy lời mời"
        }
        message={getConfirmMessage()}
      />

      <ViewMessageModal
        open={showMessageModal}
        onClose={() => setShowMessageModal(false)}
        message={request.message}
        userName={displayName}
      />
    </>
  );
};

export default RequestCard;
