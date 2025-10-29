import React from "react";
import { Bed, Car, Hotel, Users } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const TourCard = ({ tour }) => {
  const originalPrice = tour.prices;
  const discountedPrice =
    tour.discount && tour.discount > 0
      ? tour.prices * (1 - tour.discount / 100)
      : null;

  return (
    <div className="relative bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl max-w-[380px] mx-auto mb-5 text-center">
      {/* Discount badge */}
      {tour.discount > 0 && (
        <span className="absolute top-3 -left-[30px] bg-red-600 text-white px-[30px] py-1 -rotate-45 text-sm z-10">
          -{tour.discount}%
        </span>
      )}

      {/* Image */}
      <div className="overflow-hidden relative w-full aspect-4/3">
        <Image
          src={tour.thumbnail}
          alt={tour.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-300 hover:scale-110"
        />
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold mt-3 mb-1.5 text-gray-800 px-2.5 text-left wrap-break-word">
        {tour.title}
      </h3>

      {/* Info */}
      <p className="text-sm text-gray-600 my-1 flex items-center justify-center gap-1.5">
        <Bed className="w-4 h-4" /> {tour.day} Ngày {tour.night} Đêm
      </p>

      <p className="text-sm text-gray-600 my-1 flex items-center justify-center gap-1.5">
        <Car className="w-4 h-4" /> {tour.vehicle?.join(" | ")}
      </p>

      <p className="text-sm text-gray-600 my-1 flex items-center justify-center gap-1.5">
        <Hotel className="w-4 h-4" /> Khách sạn {tour.hotelStar} sao
      </p>

      <p className="text-sm text-gray-600 my-1 flex items-center justify-center gap-1.5">
        <Users className="w-4 h-4" /> Số chỗ: {tour.seats}
      </p>

      {/* Price */}
      <div className="my-2.5 flex flex-col items-center">
        {discountedPrice && (
          <span className="line-through text-gray-500 text-sm">
            {originalPrice.toLocaleString()} VNĐ
          </span>
        )}
        <span
          className={
            discountedPrice
              ? "text-red-600 text-xl font-bold"
              : "text-xl font-bold"
          }
        >
          {(discountedPrice || originalPrice).toLocaleString()} VNĐ
        </span>
      </div>

      {/* Link */}
      <Link
        href={`/tour/${tour.slug}`}
        className="inline-block my-3 mx-0 mb-4 px-4 py-2 text-[#000080] border-2 border-[#000080] no-underline rounded-lg text-sm font-medium transition-all duration-300 hover:bg-[#000080] hover:text-white"
      >
        Xem chi tiết
      </Link>
    </div>
  );
};

export default TourCard;
