"use client";

import * as LucideIcons from "lucide-react";

const LoadingModal = ({
  open,
  message = "Đang xử lý...",
  icon, // tên icon từ lucide-react (vd: "Save", "Upload", "Trash2")
}) => {
  if (!open) return null;

  // Lấy icon component từ lucide-react
  const IconComponent = icon && LucideIcons[icon] ? LucideIcons[icon] : null;

  return (
    <div className="fixed inset-0 bg-black/45 flex justify-center items-center z-3000 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 px-8 py-5 rounded-2xl flex flex-col items-center gap-3 shadow-2xl animate-scale-in">
        {/* Spinner Container */}
        <div className="relative w-[50px] h-[50px]">
          {/* Icon in center */}
          {IconComponent && (
            <IconComponent
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 dark:text-blue-400 z-2"
              size={20}
            />
          )}

          {/* Spinning ring */}
          <div className="w-full h-full border-4 border-gray-200 dark:border-gray-700 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin absolute top-0 left-0 z-1" />
        </div>

        {/* Message */}
        <p className="m-0 text-[0.95rem] font-medium text-gray-800 dark:text-gray-200">
          {message}
        </p>
      </div>
    </div>
  );
};

export default LoadingModal;
