"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; // ← Import useAuth

export default function UserLayout({ children }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth(); // ← Lấy user từ AuthContext

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // ← Lấy avatar trực tiếp từ user object, không cần fetch
  const userAvatar = user?.avatar || "/default-avatar.png";

  const menuItems = [
    { label: "Thông tin cá nhân", path: "/user/profile" },
    { label: "Lịch sử đặt tour", path: "/user/transactions_tour" },
    // {
    //   label: "Lịch sử sử dụng dịch vụ khác",
    //   path: "/user/transactions_service",
    // },
    { label: "Bạn bè", path: "/user/friends" },
    { label: "Nhắn tin", path: "/user/chat" },
    // { label: "Tải video khoảng khắc", path: "/user/upload/videos" },
    // { label: "Bài viết cá nhân", path: "/user/posts" },
    { label: "Bài viết yêu thích", path: "/user/news-favorite" },
    { label: "Bộ sưu tập yêu thích", path: "/user/gallery-favorite" },
    // { label: "Tour yêu thích", path: "/user/favorites" },
    // { label: "Mã giảm giá", path: "/user/coupons" },
    // { label: "Liên hệ hỗ trợ", path: "/user/support" },
    // { label: "Chế độ tối", path: "/user/dark-mode" },
    { label: "Về trang chủ", path: "/" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Desktop Sidebar - Fixed */}
      <aside className="hidden lg:flex fixed top-0 bottom-0 left-0 w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 shadow-sm flex-col p-5 z-1002 overflow-y-auto">
        <div className="flex justify-center mb-5">
          <img
            src={userAvatar}
            alt="avatar"
            className="w-20 h-20 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
          />
        </div>

        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => {
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`px-3.5 py-3 rounded-lg transition-all duration-200 border whitespace-nowrap overflow-hidden text-ellipsis ${
                  isActive
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-transparent text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 hover:border-gray-200 dark:hover:border-gray-600"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Mobile Topbar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center px-4 z-1001">
        <button
          onClick={toggleSidebar}
          aria-label={sidebarOpen ? "Close menu" : "Open menu"}
          className="text-2xl text-gray-700 dark:text-gray-300 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <img
          src={userAvatar}
          alt="avatar"
          className="w-10 h-10 rounded-full ml-auto object-cover border border-gray-200 dark:border-gray-700"
        />
      </div>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <>
          <aside className="lg:hidden fixed top-0 bottom-0 left-0 w-72 max-w-[92vw] bg-white dark:bg-gray-800 flex flex-col p-4 z-1004 overflow-y-auto animate-sidebarSlideIn shadow-xl">
            <button
              onClick={() => setSidebarOpen(false)}
              aria-label="Close sidebar"
              className="absolute top-2.5 right-2.5 p-1.5 rounded-lg text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:rotate-90"
            >
              <X size={20} />
            </button>

            <div className="flex justify-center mb-5 mt-8">
              <img
                src={userAvatar}
                alt="avatar"
                className="w-16 h-16 rounded-full object-cover border-2 border-gray-200 dark:border-gray-700"
              />
            </div>

            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    href={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`px-3 py-2.5 rounded-lg transition-all text-sm border ${
                      isActive
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-transparent text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div
            onClick={toggleSidebar}
            className="lg:hidden fixed inset-0 bg-black/35 z-1000"
          />
        </>
      )}

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pt-20 lg:pt-5 px-3 lg:px-5 pb-4 transition-all duration-300">
        {children}
      </main>
    </div>
  );
}
