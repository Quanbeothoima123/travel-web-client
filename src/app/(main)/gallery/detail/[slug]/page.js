// app/gallery/detail/[slug]/page.js
import { Suspense } from "react";
import GalleryDetailClient from "./GalleryDetailClient";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://yoursite.com";

// Fetch gallery data for metadata
async function getGalleryData(slug) {
  try {
    const res = await fetch(`${API_BASE}/api/v1/gallery/detail/${slug}`, {
      next: { revalidate: 3600 },
      cache: "force-cache",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data.success ? data.data : null;
  } catch (error) {
    console.error("Error fetching gallery data:", error);
    return null;
  }
}

// Generate metadata for SEO
export async function generateMetadata({ params }) {
  const { slug } = await params;
  const gallery = await getGalleryData(slug);

  if (!gallery) {
    return {
      title: "Không tìm thấy bộ sưu tập",
      robots: {
        index: false,
        follow: true,
      },
    };
  }

  const title = `${gallery.title} - Gallery Du Lịch Việt Nam`;
  const description =
    gallery.shortDescription ||
    gallery.longDescription?.substring(0, 160) ||
    `Khám phá bộ sưu tập ${gallery.title} với ${
      gallery.images?.length || 0
    } hình ảnh tuyệt đẹp`;

  const images =
    gallery.images?.map((img) => ({
      url: img.url,
      alt: img.title || gallery.title,
    })) || [];

  return {
    title,
    description,
    keywords: gallery.tags?.join(", ") || `${gallery.title}, gallery, du lịch`,
    openGraph: {
      title,
      description,
      type: "article",
      url: `${SITE_URL}/gallery/detail/${slug}`,
      siteName: "Du Lịch Việt Nam",
      images: images.slice(0, 6),
      publishedTime: gallery.createdAt,
      modifiedTime: gallery.updatedAt,
      locale: "vi_VN",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: images.length > 0 ? [images[0].url] : [],
    },
    alternates: {
      canonical: `${SITE_URL}/gallery/detail/${slug}`,
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

// Loading component
function GalleryDetailLoading() {
  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="aspect-4/3 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Main page component
export default async function GalleryDetailPage({ params }) {
  const { slug } = await params;

  return (
    <Suspense fallback={<GalleryDetailLoading />}>
      <GalleryDetailClient slug={slug} />
    </Suspense>
  );
}

// Generate static params for popular galleries
export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/api/v1/gallery/all?page=1&limit=20`, {
      next: { revalidate: 86400 },
    });
    const data = await res.json();

    if (data.success && Array.isArray(data.data)) {
      return data.data.map((gallery) => ({
        slug: gallery.slug,
      }));
    }
  } catch (error) {
    console.error("Error generating static params:", error);
  }

  return [];
}
