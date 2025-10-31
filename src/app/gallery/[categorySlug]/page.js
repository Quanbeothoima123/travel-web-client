// app/gallery/[categorySlug]/page.jsx
import { Suspense } from "react";
import GalleryPageClient from "./GalleryPageClient";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yoursite.com";

// Fetch category data for metadata
async function getCategoryData(categorySlug) {
  if (categorySlug === "all" || !categorySlug) {
    return null;
  }

  try {
    const res = await fetch(
      `${API_BASE}/api/v1/gallery/by-category/${categorySlug}?page=1&limit=1`,
      {
        next: { revalidate: 3600 },
        cache: "force-cache",
      }
    );

    if (!res.ok) return null;

    const data = await res.json();
    return data.success ? data : null;
  } catch (error) {
    console.error("Error fetching category data:", error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params, searchParams }) {
  const { categorySlug } = await params;
  const resolvedSearchParams = await searchParams;
  const keyword = resolvedSearchParams?.keyword || "";

  // Default metadata for "all" galleries
  if (categorySlug === "all" || !categorySlug) {
    return {
      title: "Tất Cả Bộ Sưu Tập - Gallery Du Lịch Việt Nam",
      description:
        "Khám phá hàng trăm bộ sưu tập ảnh du lịch tuyệt đẹp từ khắp Việt Nam. Lưu giữ những khoảnh khắc đáng nhớ trong hành trình khám phá của bạn.",
      keywords:
        "gallery du lịch, bộ sưu tập ảnh, hình ảnh du lịch Việt Nam, ảnh đẹp du lịch, travel photography",
      openGraph: {
        title: "Tất Cả Bộ Sưu Tập - Gallery Du Lịch Việt Nam",
        description:
          "Khám phá hàng trăm bộ sưu tập ảnh du lịch tuyệt đẹp từ khắp Việt Nam",
        type: "website",
        url: `${SITE_URL}/gallery/all`,
        siteName: "Du Lịch Việt Nam",
      },
      twitter: {
        card: "summary_large_image",
        title: "Tất Cả Bộ Sưu Tập - Gallery Du Lịch Việt Nam",
        description:
          "Khám phá hàng trăm bộ sưu tập ảnh du lịch tuyệt đẹp từ khắp Việt Nam",
      },
      alternates: {
        canonical: `${SITE_URL}/gallery/all`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  }

  // Fetch category data for dynamic metadata
  const categoryData = await getCategoryData(categorySlug);

  if (categoryData?.category) {
    const { title, slug, description } = categoryData.category;
    const totalItems = categoryData.pagination?.totalItems || 0;

    const pageTitle = keyword
      ? `${keyword} - ${title} - Gallery Du Lịch`
      : `${title} - Bộ Sưu Tập Ảnh Du Lịch`;

    const pageDescription =
      description ||
      `Khám phá ${totalItems} bộ sưu tập ảnh tuyệt đẹp về ${title}. Lưu giữ những khoảnh khắc đáng nhớ trong hành trình du lịch của bạn.`;

    return {
      title: pageTitle,
      description: pageDescription,
      keywords: `${title}, gallery ${title}, ảnh ${title}, bộ sưu tập ${title}, du lịch ${title}`,
      openGraph: {
        title: pageTitle,
        description: pageDescription,
        type: "website",
        url: `${SITE_URL}/gallery/${slug}`,
        siteName: "Du Lịch Việt Nam",
      },
      twitter: {
        card: "summary_large_image",
        title: pageTitle,
        description: pageDescription,
      },
      alternates: {
        canonical: `${SITE_URL}/gallery/${slug}`,
      },
      robots: {
        index: true,
        follow: true,
        googleBot: {
          index: true,
          follow: true,
          "max-video-preview": -1,
          "max-image-preview": "large",
          "max-snippet": -1,
        },
      },
    };
  }

  // Fallback metadata if category not found
  return {
    title: "Gallery - Bộ Sưu Tập Ảnh Du Lịch",
    description: "Khám phá các bộ sưu tập ảnh du lịch tuyệt đẹp",
    robots: {
      index: false,
      follow: true,
    },
  };
}

// Loading fallback
function GalleryPageLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-indigo-100">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="h-10 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse"
            >
              <div className="w-full h-60 bg-gray-200"></div>
              <div className="p-5">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main Page Component
export default async function GalleryPage({ params, searchParams }) {
  const { categorySlug } = await params;

  return (
    <Suspense fallback={<GalleryPageLoading />}>
      <GalleryPageClient categorySlug={categorySlug} />
    </Suspense>
  );
}

// Optional: Generate static params for popular categories
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/gallery-category/getAll`, {
      next: { revalidate: 86400 }, // Revalidate every 24 hours
    });
    const data = await res.json();

    if (Array.isArray(data) && data.length > 0) {
      // Return top level categories
      return data
        .filter((cat) => !cat.parentId)
        .slice(0, 10) // Limit to 10 categories
        .map((cat) => ({
          categorySlug: cat.slug,
        }));
    }
  } catch (error) {
    console.error("Error generating static params:", error);
  }

  // Always include "all" page
  return [{ categorySlug: "all" }];
}
