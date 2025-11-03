"use client";

import { useState } from "react";
import { X } from "lucide-react";

const FriendRequestModal = ({
  isOpen,
  onClose,
  onSend,
  userName,
  isLoading,
}) => {
  const defaultMessage = "Chào bạn, hãy kết bạn với mình nhé!";
  const [message, setMessage] = useState(defaultMessage);

  if (!isOpen) return null;

  const handleSend = () => {
    const trimmedMessage = message.trim();
    if (trimmedMessage) {
      console.log("Sending message:", trimmedMessage);
      onSend(trimmedMessage);
      setMessage(defaultMessage); // Reset after sending
    }
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget && !isLoading) {
      setMessage(defaultMessage); // Reset when closing
      onClose();
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && e.ctrlKey && !isLoading && message.trim()) {
      handleSend();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-5 animate-fadeIn"
      onClick={handleOverlayClick}
    >
      <div className="bg-white rounded-xl w-full max-w-[500px] shadow-[0_4px_20px_rgba(0,0,0,0.15)] animate-slideIn mx-2.5 sm:mx-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-200">
          <h3 className="m-0 text-lg sm:text-xl font-semibold text-gray-800">
            Gửi lời mời kết bạn
          </h3>
          <button
            onClick={onClose}
            className="bg-transparent border-none text-xl text-gray-600 cursor-pointer p-1.5 flex items-center justify-center rounded-full transition-all duration-200 w-8 h-8 hover:bg-gray-100 hover:text-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={isLoading}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-5">
          <p className="m-0 mb-4 text-gray-600 text-sm">
            Đến: <strong className="text-gray-800">{userName}</strong>
          </p>
          <textarea
            className="w-full p-3 border-2 border-gray-200 rounded-lg text-sm resize-y transition-colors duration-200 box-border focus:outline-none focus:border-blue-600 disabled:bg-gray-100 disabled:cursor-not-allowed"
            placeholder="Nhập tin nhắn của bạn..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={4}
            maxLength={200}
            disabled={isLoading}
            autoFocus
          />
          <div className="text-right text-xs text-gray-400 mt-1.5">
            {message.length}/200 ký tự
          </div>
          <p className="text-[11px] text-gray-400 m-0 mt-2 italic">
            Nhấn Ctrl + Enter để gửi nhanh
          </p>
        </div>

        {/* Footer */}
        <div className="flex gap-2.5 p-4 sm:p-5 border-t border-gray-200 justify-end">
          <button
            onClick={() => {
              setMessage(defaultMessage); // Reset when closing
              onClose();
            }}
            className="px-5 py-2.5 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            Hủy
          </button>
          <button
            onClick={handleSend}
            className="px-5 py-2.5 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading || !message.trim()}
          >
            {isLoading ? "Đang gửi..." : "Gửi lời mời"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FriendRequestModal;
