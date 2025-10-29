import React from "react";

const TourCardSkeleton = () => {
  return (
    <div className="relative bg-white rounded-xl shadow-md overflow-hidden max-w-[380px] mx-auto mb-5 animate-pulse">
      {/* Image skeleton */}
      <div className="w-full aspect-4/3 bg-gray-200"></div>

      {/* Content skeleton */}
      <div className="p-4">
        {/* Title skeleton */}
        <div className="h-6 bg-gray-200 rounded mb-3"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>

        {/* Info skeleton */}
        <div className="space-y-2 mb-3">
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        </div>

        {/* Price skeleton */}
        <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mb-3"></div>

        {/* Button skeleton */}
        <div className="h-10 bg-gray-200 rounded-lg w-32 mx-auto"></div>
      </div>
    </div>
  );
};

export default TourCardSkeleton;
