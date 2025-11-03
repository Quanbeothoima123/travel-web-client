// app/search/tours/[slug]/layout.js
const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://localhost:5000";

export async function generateMetadata({ params, searchParams }) {
  //  Await params theo yêu cầu Next.js 15+
  const { slug } = await params;

  // Fetch thông tin category để tạo metadata động
  let categoryTitle = "Tour Du Lịch";
  let categoryDescription =
    "Tìm kiếm và khám phá các tour du lịch hấp dẫn với giá tốt nhất";

  try {
    const res = await fetch(
      `${API_BASE}/api/v1/tour-category/get-tour-category-by-slug/${slug}`,
      { cache: "no-store" }
    );
    const data = await res.json();

    if (data.data) {
      categoryTitle = data.data.title || data.data.name;
      categoryDescription =
        data.data.description ||
        `Khám phá các tour ${categoryTitle} hấp dẫn với giá tốt nhất. Đặt ngay hôm nay!`;
    }
  } catch (error) {
    console.error("Error fetching category for metadata:", error);
  }

  // Query params để tạo description chi tiết hơn
  const query = searchParams?.q || "";
  const minPrice = searchParams?.minPrice || "";
  const maxPrice = searchParams?.maxPrice || "";

  let enhancedDescription = categoryDescription;
  if (query) {
    enhancedDescription += ` Tìm kiếm: "${query}".`;
  }
  if (minPrice || maxPrice) {
    enhancedDescription += ` Lọc theo giá từ ${
      minPrice
        ? `${Number(minPrice).toLocaleString("vi-VN")}đ`
        : "không giới hạn"
    } đến ${
      maxPrice
        ? `${Number(maxPrice).toLocaleString("vi-VN")}đ`
        : "không giới hạn"
    }.`;
  }

  return {
    title: `${categoryTitle} | Tìm Kiếm Tour Du Lịch`,
    description: enhancedDescription,
    keywords: `${categoryTitle}, tour du lịch, đặt tour online, tour giá rẻ, du lịch ${categoryTitle}`,
    openGraph: {
      title: `${categoryTitle} | Tìm Kiếm Tour Du Lịch`,
      description: enhancedDescription,
      type: "website",
      locale: "vi_VN",
      url: `/search/tours/${slug}`,
      siteName: "Tour Du Lịch",
    },
    twitter: {
      card: "summary_large_image",
      title: `${categoryTitle} | Tìm Kiếm Tour`,
      description: enhancedDescription,
    },
    alternates: {
      canonical: `/search/tours/${slug}`,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export default function SearchToursLayout({ children }) {
  return (
    <>
      {/* JSON-LD Schema cho SEO tốt hơn */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Tìm kiếm Tour Du Lịch",
            description:
              "Tìm kiếm và đặt tour du lịch trong nước và quốc tế với giá tốt nhất",
            provider: {
              "@type": "Organization",
              name: "Tour Du Lịch",
            },
          }),
        }}
      />
      {children}
    </>
  );
}
