// app/tour/[slug]/page.js
import { notFound } from "next/navigation";
import TourDetailClient from "./TourDetailClient";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

// Fetch tour data on server
async function getTourDetail(slug) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/tours/tour-detail/${slug}`, {
      cache: "no-store", // hoặc next: { revalidate: 3600 }
    });

    if (!res.ok) return null;
    const data = await res.json();
    return data.tourDetail;
  } catch (error) {
    console.error("Error fetching tour:", error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  // QUAN TRỌNG: await params trong Next.js 15
  const { slug } = await params;
  const tour = await getTourDetail(slug);

  if (!tour) {
    return {
      title: "Tour không tìm thấy",
    };
  }

  const duration = `${tour.travelTimeId?.day || 0} Ngày ${
    tour.travelTimeId?.night || 0
  } Đêm`;
  const price = tour.prices * (1 - (tour.discount || 0) / 100);
  const description = `${
    tour.title
  } - ${duration}. Giá từ ${price.toLocaleString("vi-VN")}đ. Khởi hành ${
    tour.frequency?.title || "hàng ngày"
  }. ${tour.specialExperience?.substring(0, 150) || ""}`;

  return {
    title: `${tour.title} | Du lịch Việt Nam`,
    description: description,
    keywords: tour.tags?.join(", "),
    openGraph: {
      title: tour.title,
      description: description,
      images: [
        {
          url: tour.thumbnail,
          width: 1200,
          height: 630,
          alt: tour.title,
        },
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: tour.title,
      description: description,
      images: [tour.thumbnail],
    },
    alternates: {
      canonical: `/tour/${slug}`,
    },
  };
}

export default async function TourDetailPage({ params }) {
  // QUAN TRỌNG: await params trong Next.js 15
  const { slug } = await params;
  const tourDetail = await getTourDetail(slug);

  if (!tourDetail) {
    notFound();
  }

  // JSON-LD structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "TouristTrip",
    name: tourDetail.title,
    description: tourDetail.specialExperience,
    image: tourDetail.thumbnail,
    offers: {
      "@type": "Offer",
      price: tourDetail.prices * (1 - (tourDetail.discount || 0) / 100),
      priceCurrency: "VND",
    },
    itinerary: tourDetail.description?.map((day) => ({
      "@type": "Day",
      name: day.title,
      description: day.description,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <TourDetailClient tourDetail={tourDetail} />
    </>
  );
}
