import { Suspense } from "react";
import { notFound } from "next/navigation";
import NewsPageClient from "./NewsPageClient";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

async function getNewsCategory(slug) {
  if (!slug || slug === "all") return null;

  try {
    const res = await fetch(
      `${API_BASE}/api/v1/news-category/get-news-category-by-slug/${slug}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return null;
    const data = await res.json();
    return data.data;
  } catch (error) {
    console.error("Error fetching news category:", error);
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { newsCategorySlug } = await params;
  const category = await getNewsCategory(newsCategorySlug);

  if (!category && newsCategorySlug !== "all") {
    return {
      title: "Không tìm thấy",
    };
  }

  return {
    title: category ? category.title : "Tất cả tin tức",
    description:
      category?.description || "Tất cả bài viết và tin tức du lịch Việt Nam",
    keywords:
      category?.keywords ||
      "tin tức du lịch, cẩm nang du lịch, bài viết du lịch",
    openGraph: {
      title: category?.title || "Tin tức du lịch",
      description: category?.description,
      type: "website",
      url: `/news/${newsCategorySlug}`,
    },
    alternates: {
      canonical: `/news/${newsCategorySlug}`,
    },
  };
}

export default async function NewsPage({ params, searchParams }) {
  const { newsCategorySlug } = await params;

  return (
    <Suspense fallback={<div className="loading">Đang tải...</div>}>
      <NewsPageClient
        newsCategorySlug={newsCategorySlug}
        searchParams={searchParams}
      />
    </Suspense>
  );
}
