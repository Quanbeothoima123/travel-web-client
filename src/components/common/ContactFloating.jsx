"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const ContactFloating = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [contactItems, setContactItems] = useState([]);
  const [isEnabled, setIsEnabled] = useState(false);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch(`${API_BASE}/api/v1/site-config`);

        if (response.ok) {
          const config = await response.json();

          if (!config.contactFloatingEnabled) {
            setIsEnabled(false);
            return;
          }

          setIsEnabled(true);

          const items = [];

          // 1. Thêm số điện thoại đầu tiên (nếu có)
          if (config.headquartersPhone && config.headquartersPhone.length > 0) {
            items.push({
              id: "phone",
              icon:
                config.contactFloatingItems?.find((item) => item.id === "phone")
                  ?.icon || "/assets/images/phone.png",
              alt: "Hotline",
              label: `Hotline\n${config.headquartersPhone[0]}`,
              link: `tel:${config.headquartersPhone[0]}`,
              order: -1,
              isActive: true,
            });
          }

          // 2. Thêm các contact floating items từ config
          if (
            config.contactFloatingItems &&
            config.contactFloatingItems.length > 0
          ) {
            config.contactFloatingItems.forEach((item) => {
              if (item.isActive && item.id !== "phone") {
                items.push({
                  id: item.id,
                  icon: item.icon || "/assets/images/default-icon.png",
                  alt: item.alt || item.label || item.id,
                  label: item.label || item.id,
                  link: item.link || "",
                  order: item.order || 0,
                  isActive: item.isActive,
                });
              }
            });
          }

          // 3. Thêm các social media items
          if (config.socialMedia && config.socialMedia.length > 0) {
            config.socialMedia.forEach((social) => {
              if (social.isActive && social.url) {
                const existingItem = items.find(
                  (item) =>
                    item.link === social.url || item.id === social.platform
                );

                if (!existingItem) {
                  items.push({
                    id: social.platform,
                    icon: social.icon || "/assets/images/default-icon.png",
                    alt: social.platform,
                    label:
                      social.platform.charAt(0).toUpperCase() +
                      social.platform.slice(1),
                    link: social.url,
                    order: social.order + 100,
                    isActive: social.isActive,
                  });
                }
              }
            });
          }

          items.sort((a, b) => a.order - b.order);
          setContactItems(items);
        }
      } catch (error) {
        console.error("Không thể tải cấu hình contact floating:", error);
        setIsEnabled(false);
      }
    };

    fetchConfig();
  }, []);

  const handleClick = (link) => {
    if (!link) return;

    if (link.startsWith("tel:")) {
      // Sử dụng anchor element thay vì window.location
      const anchor = document.createElement("a");
      anchor.href = link;
      anchor.click();
    } else {
      window.open(link, "_blank", "noopener,noreferrer");
    }
  };

  if (!isEnabled || contactItems.length === 0) {
    return null;
  }

  const getButtonColorClass = (id) => {
    const colorMap = {
      phone: "bg-gradient-to-br from-purple-600 to-indigo-700",
      messenger: "bg-gradient-to-br from-blue-500 to-blue-700",
      "facebook-messenger": "bg-gradient-to-br from-blue-500 to-blue-700",
      facebook: "bg-gradient-to-br from-blue-500 to-blue-700",
      1: "bg-gradient-to-br from-blue-500 to-blue-700",
      zalo: "bg-gradient-to-br from-cyan-600 to-blue-500",
      whatsapp: "bg-gradient-to-br from-green-500 to-green-700",
      telegram: "bg-gradient-to-br from-blue-500 to-blue-700",
      viber: "bg-gradient-to-br from-purple-500 to-purple-700",
      email: "bg-gradient-to-br from-red-500 to-red-700",
      mail: "bg-gradient-to-br from-red-500 to-red-700",
      youtube: "bg-gradient-to-br from-red-600 to-red-800",
      instagram: "bg-gradient-to-br from-pink-600 via-purple-600 to-indigo-600",
      twitter: "bg-gradient-to-br from-blue-400 to-blue-600",
      tiktok: "bg-gradient-to-br from-black via-pink-600 to-cyan-500",
      linkedin: "bg-gradient-to-br from-blue-600 to-blue-800",
    };

    return colorMap[id] || "bg-gradient-to-br from-purple-600 to-indigo-700";
  };

  return (
    <div className="fixed bottom-20 left-[30px] z-999">
      <div
        className="relative flex flex-col items-end gap-3"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {/* Main Toggle Button */}
        <button
          className={`cursor-pointer w-[60px] h-[60px] rounded-full bg-linear-to-br from-purple-600 to-indigo-700 border-0 shadow-lg flex items-center justify-center transition-all duration-300 relative z-2 hover:scale-110 hover:shadow-xl animate-contactPulse animate-contactShake ${
            isOpen ? "rotate-45" : ""
          }`}
          aria-label="Contact options"
        >
          <svg
            className="w-7 h-7 text-white"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
            />
          </svg>
        </button>

        {/* Contact Items - Hiển thị lên trên */}
        <div
          className={` flex flex-col-reverse items-end gap-3 absolute bottom-[60px] right-0 z-1 transition-opacity duration-300 ${
            isOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          {contactItems.map((item, index) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 transition-all duration-300 hover:z-10 ${
                isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
              }`}
              style={{
                transitionDelay: isOpen ? `${index * 80}ms` : "0ms",
              }}
              onClick={() => handleClick(item.link)}
            >
              {/* Label */}
              <div className="bg-white px-4 py-2 rounded-full shadow-md text-[13px] font-medium text-gray-800 whitespace-nowrap leading-snug opacity-0 translate-x-2.5 transition-all duration-300 pointer-events-none group-hover:opacity-100 group-hover:translate-x-0 peer-hover:opacity-100 peer-hover:translate-x-0">
                {item.label.split("\n").map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>

              {/* Button */}
              <button
                className={`cursor-pointer peer w-[50px] h-[50px] rounded-full border-3 border-white shadow-md flex items-center justify-center transition-all duration-300 hover:scale-115 hover:shadow-xl p-0 shrink-0 ${getButtonColorClass(
                  item.id
                )}`}
                aria-label={item.alt}
              >
                <img
                  src={item.icon}
                  alt={item.alt}
                  className="w-[30px] h-[30px] object-contain"
                  onError={(e) => {
                    e.target.src = "/assets/images/default-icon.png";
                  }}
                />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ContactFloating;
