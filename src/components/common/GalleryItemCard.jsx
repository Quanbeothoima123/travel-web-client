import React from "react";
import Link from "next/link";
import { Eye, Heart, Share2, Image, Video } from "lucide-react";

const GalleryItemCard = ({ item }) => {
  // Cắt mô tả ngắn nếu quá dài
  const truncateDescription = (text, maxLength = 100) => {
    if (!text) return "Chưa có mô tả";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + "...";
  };

  // Đếm số lượng ảnh và video
  const imageCount = item.images?.length || 0;
  const videoCount = item.videos?.length || 0;

  return (
    <Link
      href={`/gallery/detail/${item.slug || item._id}`}
      className="block bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_24px_rgba(0,0,0,0.15)] no-underline group"
    >
      {/* Thumbnail Container */}
      <div className="relative h-60 overflow-hidden bg-gradient-to-br from-indigo-100 to-indigo-200">
        <img
          src={item.thumbnail || "/placeholder.jpg"}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = "/placeholder.jpg";
          }}
        />

        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"></div>

        {/* Media Count Badge */}
        <div className="absolute top-3 right-3 flex gap-2 z-10">
          {imageCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
              <Image className="w-3 h-3 text-blue-500" />
              <span>{imageCount}</span>
            </div>
          )}
          {videoCount > 0 && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-semibold text-gray-700">
              <Video className="w-3 h-3 text-red-500" />
              <span>{videoCount}</span>
            </div>
          )}
        </div>

        {/* Category Badge */}
        {item.galleryCategory?.title && (
          <div className="absolute top-3 left-3 px-3 py-1.5 bg-indigo-600/95 backdrop-blur-sm rounded-full text-xs font-bold text-white z-10">
            {item.galleryCategory.title}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug line-clamp-2 transition-colors duration-300 group-hover:text-indigo-600">
          {item.title || "Chưa có tiêu đề"}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed mb-4 line-clamp-2">
          {truncateDescription(item.shortDescription)}
        </p>

        {/* Stats */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <div className="flex items-center gap-4">
            {/* Views */}
            <div className="flex items-center gap-1.5 text-gray-600">
              <Eye className="w-3.5 h-3.5" />
              <span className="text-sm font-semibold">
                {item.views?.toLocaleString() || 0}
              </span>
            </div>

            {/* Likes */}
            <div className="flex items-center gap-1.5 text-rose-500">
              <Heart className="w-3.5 h-3.5" />
              <span className="text-sm font-semibold">
                {item.likes?.toLocaleString() || 0}
              </span>
            </div>

            {/* Shares */}
            <div className="flex items-center gap-1.5 text-blue-500">
              <Share2 className="w-3.5 h-3.5" />
              <span className="text-sm font-semibold">
                {item.shares?.toLocaleString() || 0}
              </span>
            </div>
          </div>

          {/* View More Arrow */}
          <div className="text-sm font-semibold text-indigo-600 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            Xem →
          </div>
        </div>

        {/* Tour Info (if exists) */}
        {item.tour?.title && (
          <div className="mt-3 pt-3 border-t border-gray-200 text-xs">
            <span className="text-gray-400 mr-1.5">Tour:</span>
            <span className="text-gray-700 font-semibold">
              {item.tour.title}
            </span>
          </div>
        )}
      </div>
    </Link>
  );
};

export default GalleryItemCard;
