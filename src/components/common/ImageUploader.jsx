"use client";

import { useRef, useState } from "react";
import { Upload, Image as ImageIcon, Loader2 } from "lucide-react";

const ImageUploader = ({
  onUpload, // callback khi upload xong
  onUploadStart, // callback khi bắt đầu upload
  onUploadEnd, // callback khi kết thúc upload
  multiple = false, // có thể upload nhiều ảnh
  showPreview = false, // hiển thị preview ảnh đã chọn
  className = "", // custom className
}) => {
  const fileInputRef = useRef();
  const [previews, setPreviews] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e) => {
    const files = multiple ? Array.from(e.target.files) : [e.target.files[0]];
    if (!files.length) return;

    // Show preview nếu enabled
    if (showPreview) {
      const previewUrls = files.map((file) => URL.createObjectURL(file));
      setPreviews(previewUrls);
    }

    setIsUploading(true);
    if (onUploadStart) onUploadStart();

    const uploadedUrls = [];

    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append(
        "upload_preset",
        process.env.NEXT_PUBLIC_CLOUDINARY_PRESET
      );

      try {
        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD}/upload`,
          { method: "POST", body: formData }
        );
        const data = await res.json();
        if (data.secure_url) {
          uploadedUrls.push(data.secure_url);
        }
      } catch (error) {
        console.error("Upload failed:", error);
      }
    }

    if (multiple) {
      onUpload(uploadedUrls);
    } else {
      onUpload(uploadedUrls[0]);
    }

    setIsUploading(false);
    if (onUploadEnd) onUploadEnd();

    // Clear preview sau khi upload xong
    if (showPreview) {
      previews.forEach((url) => URL.revokeObjectURL(url));
      setPreviews([]);
    }
  };

  return (
    <div className={className}>
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 text-center cursor-pointer transition-all duration-300 bg-gray-50 dark:bg-gray-800/50 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          accept="image/*"
          multiple={multiple}
          disabled={isUploading}
        />

        <div className="flex flex-col items-center gap-3">
          {isUploading ? (
            <Loader2 className="w-12 h-12 text-blue-600 dark:text-blue-400 animate-spin" />
          ) : (
            <Upload className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          )}

          <button
            type="button"
            onClick={() => fileInputRef.current.click()}
            disabled={isUploading}
            className="px-6 py-2.5 text-blue-600 dark:text-blue-400 border-2 border-blue-600 dark:border-blue-400 rounded-lg font-medium transition-all duration-200 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-blue-600"
          >
            {isUploading
              ? "Đang tải lên..."
              : multiple
              ? "Chọn ảnh"
              : "Chọn thumbnail"}
          </button>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            {multiple
              ? "Hỗ trợ nhiều ảnh (PNG, JPG, WEBP)"
              : "Hỗ trợ PNG, JPG, WEBP"}
          </p>
        </div>
      </div>

      {/* Preview Section */}
      {showPreview && previews.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {previews.map((preview, index) => (
            <div
              key={index}
              className="relative group rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700"
            >
              <img
                src={preview}
                alt={`Preview ${index + 1}`}
                className="w-full h-32 object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <ImageIcon className="w-6 h-6 text-white" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageUploader;
