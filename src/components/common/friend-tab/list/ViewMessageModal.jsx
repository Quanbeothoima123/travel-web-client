"use client";

import { X } from "lucide-react";

const ViewMessageModal = ({ open, onClose, message, userName }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-9999 animate-fadeIn">
      <div className="bg-white rounded-xl max-w-[500px] w-[90%] shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-slideUp m-4 md:m-0">
        <div className="flex justify-between items-center px-5 py-4 md:px-6 md:py-5 border-b border-gray-200">
          <h3 className="text-base md:text-lg font-semibold text-gray-800 m-0">
            Lời nhắn từ {userName}
          </h3>
          <button
            onClick={onClose}
            className="p-2 bg-transparent border-none text-gray-600 cursor-pointer rounded-md transition-all duration-200 flex items-center justify-center text-lg hover:bg-gray-100 hover:text-gray-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-5 md:p-6">
          <p className="m-0 text-gray-700 leading-relaxed whitespace-pre-wrap wrap-break-word">
            {message}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ViewMessageModal;
