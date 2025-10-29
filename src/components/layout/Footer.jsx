"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const Footer = () => {
  const [config, setConfig] = useState(null);
  const [email, setEmail] = useState("");
  const [newsletterLoading, setNewsletterLoading] = useState(false);
  const [newsletterMessage, setNewsletterMessage] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/site-config`);
        if (response.ok) {
          const data = await response.json();
          setConfig(data);
        }
      } catch (error) {
        console.error("Không thể tải cấu hình footer:", error);
      }
    };
    fetchConfig();
  }, []);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setNewsletterMessage("Vui lòng nhập email hợp lệ");
      return;
    }

    setNewsletterLoading(true);
    setNewsletterMessage("");

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));
      setNewsletterMessage("Đăng ký thành công! Cảm ơn bạn đã quan tâm.");
      setEmail("");
    } catch (error) {
      setNewsletterMessage("Có lỗi xảy ra. Vui lòng thử lại.");
    } finally {
      setNewsletterLoading(false);
    }
  };

  if (!config) {
    return null;
  }

  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-linear-to-br from-[#1a1a2e] to-[#16213e] text-gray-300 pt-12 mt-16 border-t-4 border-[#000080]">
      <div className="max-w-7xl mx-auto px-8">
        {/* PHẦN 1: GRID CHÍNH */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
          {/* THÔNG TIN CÔNG TY */}
          <div className="max-w-sm animate-fadeIn">
            {config.logoLight && (
              <Image
                src={config.logoLight}
                alt={config.companyName}
                width={160} // Thêm width
                height={60} // Thêm height
                className="max-w-40 h-auto mb-4 brightness-110"
              />
            )}

            {/* MẠNG XÃ HỘI */}
            {config.socialMedia && config.socialMedia.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-semibold text-white mb-4">
                  Kết nối với chúng tôi
                </h4>
                <div className="flex gap-3 flex-wrap">
                  {config.socialMedia
                    .filter((social) => social.isActive)
                    .sort((a, b) => a.order - b.order)
                    .map((social, index) => (
                      <a
                        key={index}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-10 h-10 bg-white/10 rounded-full border-2 border-transparent hover:bg-[#000080] hover:border-[#000080] hover:-translate-y-1 hover:scale-105 hover:shadow-lg hover:shadow-[#000080]/40 transition-all duration-300"
                        title={social.platform}
                      >
                        {social.icon ? (
                          <Image
                            src={social.icon}
                            alt={social.platform}
                            width={20} // Thêm width
                            height={20} // Thêm height
                            className="w-5 h-5 brightness-0 invert"
                          />
                        ) : (
                          <span className="text-xs text-white uppercase">
                            {social.platform}
                          </span>
                        )}
                      </a>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* THÔNG TIN LIÊN HỆ */}
          <div className="animate-fadeIn" style={{ animationDelay: "0.1s" }}>
            <h4 className="text-lg font-bold text-white mb-5 uppercase tracking-wide relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-[#000080] after:rounded">
              Thông tin liên hệ
            </h4>
            <ul className="space-y-4">
              {config.headquartersAddress && (
                <li className="flex items-start gap-3 text-sm leading-relaxed text-gray-400">
                  <span className="text-lg shrink-0">📍</span>
                  <span>{config.headquartersAddress}</span>
                </li>
              )}
              {config.headquartersPhone &&
                config.headquartersPhone.length > 0 && (
                  <li className="flex items-start gap-3 text-sm">
                    <span className="text-lg shrink-0">📞</span>
                    <div className="flex flex-col gap-1">
                      {config.headquartersPhone.map((phone, index) => (
                        <a
                          key={index}
                          href={`tel:${phone}`}
                          className="text-gray-400 hover:text-[#000080] hover:underline transition-colors duration-200"
                        >
                          {phone}
                        </a>
                      ))}
                    </div>
                  </li>
                )}
              {config.headquartersEmail && (
                <li className="flex items-start gap-3 text-sm">
                  <span className="text-lg shrink-0">✉️</span>
                  <a
                    href={`mailto:${config.headquartersEmail}`}
                    className="text-gray-400 hover:text-[#000080] hover:underline transition-colors duration-200"
                  >
                    {config.headquartersEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>

          {/* CHI NHÁNH */}
          {config.branches && config.branches.length > 0 && (
            <div className="animate-fadeIn" style={{ animationDelay: "0.2s" }}>
              <h4 className="text-lg font-bold text-white mb-5 uppercase tracking-wide relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-[#000080] after:rounded">
                Chi nhánh
              </h4>
              <ul className="space-y-6">
                {config.branches
                  .sort((a, b) => a.order - b.order)
                  .map((branch, index) => (
                    <li
                      key={index}
                      className="pb-6 border-b border-white/10 last:border-0 last:pb-0"
                    >
                      <strong className="block text-white text-sm mb-2">
                        {branch.name}
                      </strong>
                      <p className="text-xs text-gray-400 leading-relaxed my-1">
                        {branch.address}
                      </p>
                      {branch.phone && branch.phone.length > 0 && (
                        <a
                          href={`tel:${branch.phone[0]}`}
                          className="inline-block mt-2 text-[#000080] hover:text-[#0052a3] hover:underline text-sm font-medium transition-colors duration-200"
                        >
                          {branch.phone[0]}
                        </a>
                      )}
                    </li>
                  ))}
              </ul>
            </div>
          )}

          {/* LIÊN KẾT NHANH */}
          <div className="animate-fadeIn" style={{ animationDelay: "0.3s" }}>
            <h4 className="text-lg font-bold text-white mb-5 uppercase tracking-wide relative pb-3 after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-10 after:h-0.5 after:bg-[#000080] after:rounded">
              Liên kết nhanh
            </h4>
            <ul className="space-y-3">
              {[
                { href: "/", label: "Trang chủ" },
                { href: "/tours", label: "Tours du lịch" },
                { href: "/about", label: "Về chúng tôi" },
                { href: "/contact", label: "Liên hệ" },
                { href: "/policy", label: "Chính sách & Điều khoản" },
              ].map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-gray-400 text-sm hover:text-[#000080] hover:pl-1 transition-all duration-200 inline-block relative before:content-['›'] before:mr-2 before:text-[#000080] before:font-bold before:transition-all before:duration-200 hover:before:mr-3"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* PHẦN 2: NEWSLETTER */}
        {config.newsletterEnabled && (
          <div className="bg-white/5 p-8 rounded-xl mb-10 border border-white/10">
            <div className="max-w-2xl">
              <h4 className="text-xl text-white mb-2 font-bold">
                {config.newsletterTitle || "Đăng ký nhận tin khuyến mãi"}
              </h4>
              <p className="text-gray-400 mb-5 text-sm">
                Nhận thông tin về các tour du lịch mới và ưu đãi đặc biệt
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex gap-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={
                    config.newsletterPlaceholder || "Nhập email của bạn"
                  }
                  disabled={newsletterLoading}
                  className="flex-1 px-5 py-3 border-2 border-white/20 rounded-lg bg-white/10 text-white text-sm placeholder:text-white/50 focus:outline-none focus:border-[#000080] focus:bg-white/15 focus:ring-4 focus:ring-[#000080]/20 transition-all duration-300"
                />
                <button
                  type="submit"
                  disabled={newsletterLoading}
                  className="px-7 py-3 bg-[#000080] text-white border-none rounded-lg font-semibold text-sm cursor-pointer hover:bg-[#0052a3] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#000080]/40 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-60 transition-all duration-300 whitespace-nowrap"
                >
                  {newsletterLoading ? "Đang gửi..." : "Đăng ký"}
                </button>
              </form>
              {newsletterMessage && (
                <p className="mt-4 px-4 py-3 bg-green-900/20 border-l-4 border-green-500 rounded text-green-300 text-sm">
                  {newsletterMessage}
                </p>
              )}
            </div>
          </div>
        )}

        {/* PHẦN 3: THÔNG TIN PHÁP LÝ */}
        <div className="border-t border-b border-white/10 py-6 mb-6">
          <div className="flex flex-col gap-2">
            {config.businessLicenseNumber && (
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-white font-semibold">GPKD:</strong>{" "}
                {config.businessLicenseNumber} - Cấp bởi:{" "}
                {config.businessLicenseIssuer}
              </p>
            )}
            {config.travelLicenseNumber && (
              <p className="text-xs text-gray-400 leading-relaxed">
                <strong className="text-white font-semibold">
                  {config.travelLicenseType}:
                </strong>{" "}
                {config.travelLicenseNumber}
              </p>
            )}
          </div>
        </div>

        {/* PHẦN 4: COPYRIGHT */}
        <div className="flex flex-col md:flex-row justify-between items-center py-6 border-t border-white/10 gap-4 flex-wrap">
          <p className="text-sm text-gray-500">
            © {currentYear} {config.companyShortName || config.companyName}. Tất
            cả quyền được bảo lưu.
          </p>
          <div className="flex items-center gap-3 text-sm flex-wrap justify-center">
            <Link
              href="/privacy"
              className="text-gray-400 hover:text-[#000080] hover:underline transition-colors duration-200"
            >
              Chính sách bảo mật
            </Link>
            <span className="text-white/30">•</span>
            <Link
              href="/terms"
              className="text-gray-400 hover:text-[#000080] hover:underline transition-colors duration-200"
            >
              Điều khoản sử dụng
            </Link>
            <span className="text-white/30">•</span>
            <Link
              href="/sitemap"
              className="text-gray-400 hover:text-[#000080] hover:underline transition-colors duration-200"
            >
              Sơ đồ trang
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
