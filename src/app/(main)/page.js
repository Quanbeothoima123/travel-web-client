import React from "react";
import TourCard from "@/components/common/TourCard";
import TourTabSection from "@/components/common/TourTabSection";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

// Metadata cho SEO
export const metadata = {
  title: "Tour Du Lịch Hot - Khám Phá Việt Nam & Thế Giới",
  description:
    "Khám phá các tour du lịch trong nước và nước ngoài với giá ưu đãi. Đặt tour ngay hôm nay!",
  keywords: "tour du lịch, tour trong nước, tour nước ngoài, du lịch việt nam",
  openGraph: {
    title: "Tour Du Lịch Hot - Khám Phá Việt Nam & Thế Giới",
    description:
      "Khám phá các tour du lịch trong nước và nước ngoài với giá ưu đãi",
    type: "website",
  },
};

// Server Component - fetch data phía server
async function getTours(endpoint) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/tours/${endpoint}`, {
      next: { revalidate: 300 }, // Cache 5 phút
    });

    if (!res.ok) throw new Error("Failed to fetch tours");

    return res.json();
  } catch (error) {
    console.error("Error fetching tours:", error);
    return [];
  }
}

export default async function Home() {
  // Fetch cả 2 loại tour song song
  const [domesticTours, aboardTours] = await Promise.all([
    getTours("tour-list-domestic"),
    getTours("tour-list-aboard"),
  ]);

  return (
    <div className="text-center">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold my-8 text-gray-800">TOUR HOT</h1>

        {/* Client Component để xử lý interaction */}
        <TourTabSection
          domesticTours={domesticTours}
          aboardTours={aboardTours}
        />
      </div>
    </div>
  );
}
