const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export async function generateMetadata({ params }) {
  const { newsSlug } = await params;

  let newsTitle = "Bài viết";
  let newsDescription = "Đọc bài viết chi tiết";
  let newsImage = "/default-news-image.jpg";
  let newsKeywords = "tin tức, du lịch";
  let publishedTime = null;
  let modifiedTime = null;
  let authorName = "Tác giả";

  try {
    const res = await fetch(`${API_BASE}/api/v1/news/detail/${newsSlug}`, {
      next: { revalidate: 3600 }, // Thay vì no-store để cache
    });

    if (res.ok) {
      const result = await res.json();
      const data = result.data;

      if (data) {
        newsTitle = data.title;
        newsDescription =
          data.metaDescription || data.excerpt || "Đọc bài viết chi tiết";
        newsImage = data.thumbnail || "/default-news-image.jpg";
        newsKeywords =
          data.metaKeywords?.join(", ") ||
          data.tags?.join(", ") ||
          "tin tức, du lịch";
        publishedTime = data.publishedAt || data.createdAt;
        modifiedTime = data.updatedAt || data.createdAt;
        authorName =
          data.author?.type === "admin" ? "Quản trị viên" : "Tác giả";
      }
    }
  } catch (error) {
    console.error("Error fetching news for metadata:", error);
  }

  return {
    title: newsTitle, // Template từ news/layout.js sẽ thêm suffix
    description: newsDescription,
    keywords: newsKeywords,
    authors: [{ name: authorName }],

    openGraph: {
      title: newsTitle,
      description: newsDescription,
      type: "article",
      locale: "vi_VN",
      url: `/news/detail/${newsSlug}`,
      images: [{ url: newsImage, width: 1200, height: 630, alt: newsTitle }],
      publishedTime,
      modifiedTime,
      authors: [authorName],
    },

    twitter: {
      card: "summary_large_image",
      title: newsTitle,
      description: newsDescription,
      images: [newsImage],
    },

    alternates: {
      canonical: `/news/detail/${newsSlug}`,
    },
  };
}

export default function NewsDetailLayout({ children }) {
  return <article className="news-detail-container">{children}</article>;
}
