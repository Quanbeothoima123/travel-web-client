"use client";

import React, { useEffect } from "react";

const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Close on ESC key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/45 flex justify-center items-center z-[2000] animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-xl w-[360px] max-w-[90%] animate-slideIn shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title */}
        {title && (
          <h3 className="text-lg font-semibold text-center mb-3 text-gray-900">
            {title}
          </h3>
        )}

        {/* Message */}
        <p className="text-[0.95rem] text-center mb-5 text-gray-600">
          {message}
        </p>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          {/* Cancel Button */}
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all duration-200 active:scale-95"
          >
            Hủy
          </button>

          {/* Confirm Button */}
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 shadow-sm hover:shadow-md transition-all duration-200 active:scale-95"
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
