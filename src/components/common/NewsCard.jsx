// components/NewsCard.jsx
import React from "react";
import Link from "next/link";
import Image from "next/image";
import { Calendar, Eye } from "lucide-react";

const NewsCard = ({
  data,
  thumbnailPosition = "top", // "top" | "bottom"
}) => {
  if (!data) return null;

  const { _id, title, excerpt, thumbnail, publishedAt, views, slug } = data;

  return (
    <Link
      href={`/news/detail/${slug || _id}`}
      className="flex flex-col justify-between w-full min-h-[350px] bg-white rounded-2xl overflow-hidden shadow-[0_2px_10px_rgba(0,0,0,0.1)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_6px_16px_rgba(0,0,0,0.15)] no-underline text-inherit group"
    >
      {/* Thumbnail Top */}
      {thumbnail && thumbnailPosition === "top" && (
        <div className="overflow-hidden">
          <div className="relative w-full h-[220px]">
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-5 relative grow flex flex-col justify-between">
        {/* Quote */}
        <div className="text-[32px] text-[--color-primary-hover] absolute top-3 left-3 opacity-70">
          ❝
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold m-0 mb-4 pl-8 leading-[1.4] line-clamp-2">
          {title}
        </h3>

        {/* Meta */}
        <div className="flex items-center gap-4 text-[13px] text-[--color-text-muted] mb-4 pl-8">
          {publishedAt && (
            <span className="flex items-center gap-1.5">
              <Calendar size={14} />
              {new Date(publishedAt).toLocaleDateString("vi-VN")}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <Eye size={14} /> {views ?? 0}
          </span>
        </div>

        {/* Excerpt */}
        {excerpt && (
          <p className="text-sm text-[--color-text] leading-normal m-0 pl-8 line-clamp-3">
            {excerpt}
          </p>
        )}
      </div>

      {/* Thumbnail Bottom */}
      {thumbnail && thumbnailPosition === "bottom" && (
        <div className="overflow-hidden">
          <div className="relative w-full h-[220px]">
            <Image
              src={thumbnail}
              alt={title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        </div>
      )}
    </Link>
  );
};

export default NewsCard;
