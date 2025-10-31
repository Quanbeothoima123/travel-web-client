// app/gallery/layout.jsx
export const metadata = {
  title: {
    template: "%s | Gallery Du Lịch Việt Nam",
    default: "Gallery - Bộ Sưu Tập Du Lịch",
  },
  description: "Khám phá các bộ sưu tập ảnh du lịch tuyệt đẹp từ khắp Việt Nam",
};

export default function GalleryLayout({ children }) {
  return (
    <div className="gallery-section">
      {/* Có thể thêm breadcrumb, sidebar, etc */}
      {children}
    </div>
  );
}
