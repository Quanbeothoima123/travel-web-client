export const metadata = {
  metadataBase: new URL("https://yourdomain.com"),
  title: {
    template: "%s | Du lịch Việt Nam",
    default: "Tin tức & Bài viết - Du lịch Việt Nam",
  },
  description:
    "Cập nhật những thông tin, cẩm nang và bài viết mới nhất về du lịch Việt Nam",
};

export default function NewsLayout({ children }) {
  return (
    <div className="news-layout">
      {/* Có thể thêm breadcrumb, sidebar chung ở đây */}
      {children}
    </div>
  );
}
