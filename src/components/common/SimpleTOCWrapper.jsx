"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import generateTOCFromHtml from "@/lib/utils/tocGenerator";

export default function SimpleTOCWrapper({
  htmlContent,
  children,
  tocOptions = {},
  className = "",
}) {
  const [activeId, setActiveId] = useState("");
  const [isFollowing, setIsFollowing] = useState(false);

  // Default TOC options - memoize to avoid recreation
  const defaultTocOptions = useMemo(
    () => ({
      tocTitle: "Mục lục",
      smoothScroll: true,
      includeNumbers: false,
      ...tocOptions,
    }),
    [tocOptions]
  );

  // Generate TOC when content changes
  const tocData = useMemo(() => {
    if (htmlContent) {
      return generateTOCFromHtml(htmlContent, defaultTocOptions);
    }
    return { tocHtml: "", contentHtml: "", headings: [] };
  }, [htmlContent, defaultTocOptions]);

  // Handle TOC link click with smooth scroll
  const handleTocClick = useCallback((e) => {
    if (e.target.classList.contains("toc-link")) {
      e.preventDefault();
      const targetId = e.target.getAttribute("href").substring(1);
      const targetElement = document.getElementById(targetId);

      if (targetElement) {
        const offsetTop =
          targetElement.getBoundingClientRect().top + window.pageYOffset - 120;
        window.scrollTo({
          top: offsetTop,
          behavior: "smooth",
        });
        setActiveId(targetId);
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("click", handleTocClick);
    return () => document.removeEventListener("click", handleTocClick);
  }, [handleTocClick]);

  // Track active section while scrolling
  useEffect(() => {
    if (!tocData.headings?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            setIsFollowing(true);
            setTimeout(() => setIsFollowing(false), 400);
          }
        });
      },
      {
        rootMargin: "-120px 0px -60% 0px",
        threshold: 0,
      }
    );

    // Observe all headings
    const headingElements = tocData.headings
      .map((h) => document.getElementById(h.id))
      .filter(Boolean);

    headingElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [tocData.headings]);

  // Update active class on TOC links
  useEffect(() => {
    if (!activeId) return;

    // Remove all active classes
    document.querySelectorAll(".toc-link").forEach((link) => {
      link.classList.remove("active");
    });

    // Add active class to current link
    const activeLink = document.querySelector(`.toc-link[href="#${activeId}"]`);
    if (activeLink) {
      activeLink.classList.add("active");
    }

    // Add active-section class to heading
    document.querySelectorAll(".active-section").forEach((el) => {
      el.classList.remove("active-section");
    });
    const activeHeading = document.getElementById(activeId);
    if (activeHeading) {
      activeHeading.classList.add("active-section");
    }
  }, [activeId]);

  return (
    <div className={`w-full relative ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-8 lg:gap-10 relative">
        {/* Table of Contents - Fixed Sidebar */}
        {tocData.tocHtml && (
          <aside
            className={`
              lg:sticky lg:top-5 lg:h-fit z-10
              transition-all duration-400 ease-out
              ${isFollowing ? "scale-102" : "scale-100"}
            `}
            style={{
              transitionTimingFunction: "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
            }}
          >
            <div
              className={`
                relative overflow-hidden
                bg-gray-50/95 backdrop-blur-sm
                border border-gray-200/80 rounded-xl
                p-6 shadow-lg
                max-h-[calc(100vh-120px)] overflow-y-auto
                transform transition-shadow duration-300
                ${
                  isFollowing
                    ? "shadow-2xl shadow-blue-500/25 border-blue-500/30"
                    : ""
                }
              `}
            >
              {/* Top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 to-blue-400" />

              {/* Reading progress indicator */}
              <div
                className="absolute top-[-2px] left-[-2px] h-1 bg-gradient-to-r from-blue-500 via-blue-400 to-blue-300 rounded-sm shadow-sm shadow-blue-500/30 transition-all duration-300"
                style={{
                  width: `calc(${
                    (window.scrollY /
                      (document.documentElement.scrollHeight -
                        window.innerHeight)) *
                    100
                  }% + 4px)`,
                }}
              />

              <div dangerouslySetInnerHTML={{ __html: tocData.tocHtml }} />
            </div>
          </aside>
        )}

        {/* Main Content */}
        <main className="min-w-0 scroll-smooth">
          {tocData.contentHtml ? (
            <div
              className="prose prose-lg max-w-none"
              dangerouslySetInnerHTML={{ __html: tocData.contentHtml }}
            />
          ) : (
            children
          )}
        </main>
      </div>

      {/* Global TOC Styles - All styles combined in one block */}
      <style jsx global>{`
        /* Custom scrollbar styles */
        aside > div::-webkit-scrollbar {
          width: 4px;
        }
        aside > div::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.05);
          border-radius: 2px;
        }
        aside > div::-webkit-scrollbar-thumb {
          background: rgb(59, 130, 246);
          border-radius: 2px;
          opacity: 0.7;
        }
        aside > div::-webkit-scrollbar-thumb:hover {
          opacity: 1;
        }

        /* TOC Title */
        .toc-title {
          font-weight: 700;
          font-size: 1.2em;
          margin-bottom: 1rem;
          color: #1f2937;
          text-align: center;
          position: relative;
          padding-bottom: 0.75rem;
        }

        .toc-title::after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 40px;
          height: 2px;
          background: rgb(59, 130, 246);
          border-radius: 1px;
        }

        /* TOC Lists */
        .toc-list,
        .toc-sublist {
          list-style: none;
          padding-left: 0;
          margin: 0;
        }

        .toc-sublist {
          padding-left: 1.25rem;
          margin-top: 0.375rem;
          position: relative;
        }

        .toc-sublist::before {
          content: "";
          position: absolute;
          left: 0.5rem;
          top: 0;
          bottom: 0;
          width: 1px;
          background: linear-gradient(to bottom, #e5e7eb, transparent);
        }

        .toc-item {
          margin: 0.125rem 0;
          position: relative;
        }

        /* TOC Links */
        .toc-link {
          display: block;
          color: #6b7280;
          text-decoration: none;
          padding: 0.5rem 0.75rem;
          border-radius: 0.375rem;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: 0.9em;
          line-height: 1.4;
          word-wrap: break-word;
          position: relative;
          overflow: hidden;
        }

        .toc-link::before {
          content: "";
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(59, 130, 246, 0.1),
            transparent
          );
          transition: left 0.5s ease;
        }

        .toc-link:hover::before {
          left: 100%;
        }

        .toc-link:hover {
          background: rgba(59, 130, 246, 0.05);
          color: rgb(59, 130, 246);
          transform: translateX(4px);
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
        }

        .toc-link:focus-visible {
          outline: 2px solid rgb(59, 130, 246);
          outline-offset: 2px;
          background: rgba(59, 130, 246, 0.05);
        }

        /* Active state */
        .toc-link.active {
          background: linear-gradient(
            135deg,
            rgb(59, 130, 246),
            rgb(66, 153, 225)
          );
          color: white;
          font-weight: 600;
          transform: translateX(6px);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
          position: relative;
          z-index: 2;
          animation: activeSlide 0.5s ease-out;
        }

        .toc-link.active::after {
          content: "📍";
          position: absolute;
          top: 50%;
          right: 0.5rem;
          transform: translateY(-50%);
          font-size: 10px;
          opacity: 0.8;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 0.8;
            transform: translateY(-50%) scale(1);
          }
          50% {
            opacity: 1;
            transform: translateY(-50%) scale(1.1);
          }
        }

        @keyframes activeSlide {
          0% {
            transform: translateX(0);
            box-shadow: none;
          }
          50% {
            transform: translateX(8px);
            box-shadow: 0 6px 20px rgba(59, 130, 246, 0.4);
          }
          100% {
            transform: translateX(6px);
            box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3);
          }
        }

        /* Level-specific styling */
        .toc-level-1 .toc-link {
          font-weight: 600;
          font-size: 1em;
          color: #374151;
          border-left: 3px solid transparent;
        }

        .toc-level-1 .toc-link:hover,
        .toc-level-1 .toc-link.active {
          border-left-color: rgb(59, 130, 246);
        }

        .toc-level-1 .toc-link.active {
          background: linear-gradient(
            135deg,
            rgb(59, 130, 246),
            rgb(66, 153, 225)
          );
          color: white;
          font-weight: 700;
        }

        .toc-level-2 .toc-link {
          font-weight: 500;
          color: #4b5563;
          padding-left: 1rem;
        }

        .toc-level-2 .toc-link.active {
          background: linear-gradient(
            135deg,
            rgb(66, 153, 225),
            rgb(99, 179, 237)
          );
          color: white;
        }

        .toc-level-3 .toc-link {
          font-weight: normal;
          color: #6b7280;
          font-size: 0.85em;
          padding-left: 1.25rem;
        }

        .toc-level-3 .toc-link.active {
          background: linear-gradient(
            135deg,
            rgb(99, 179, 237),
            rgb(144, 205, 244)
          );
          color: white;
        }

        .toc-level-4 .toc-link,
        .toc-level-5 .toc-link,
        .toc-level-6 .toc-link {
          font-weight: normal;
          color: #9ca3af;
          font-size: 0.8em;
          padding-left: 1.5rem;
        }

        .toc-level-4 .toc-link.active,
        .toc-level-5 .toc-link.active,
        .toc-level-6 .toc-link.active {
          background: linear-gradient(
            135deg,
            rgb(144, 205, 244),
            rgb(191, 219, 254)
          );
          color: rgb(30, 64, 175);
        }

        /* Active heading styles */
        h1,
        h2,
        h3,
        h4,
        h5,
        h6 {
          scroll-margin-top: 120px;
          transition: all 0.3s ease;
          position: relative;
        }

        h1.active-section,
        h2.active-section,
        h3.active-section,
        h4.active-section,
        h5.active-section,
        h6.active-section {
          background: linear-gradient(
            135deg,
            rgba(59, 130, 246, 0.05),
            rgba(66, 153, 225, 0.03)
          );
          border-radius: 0.5rem;
          padding: 0.75rem 1rem 0.75rem 1.5rem;
          margin: 2rem -1rem 1rem -1rem;
          border-left: 4px solid rgb(59, 130, 246);
          animation: activeHeadingSlide 0.5s ease-out;
        }

        h1.active-section::before,
        h2.active-section::before,
        h3.active-section::before,
        h4.active-section::before,
        h5.active-section::before,
        h6.active-section::before {
          content: "📍";
          position: absolute;
          right: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          font-size: 14px;
          opacity: 0.7;
          animation: bounce 2s infinite;
        }

        @keyframes activeHeadingSlide {
          0% {
            opacity: 0;
            transform: translateX(-20px);
            background: transparent;
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes bounce {
          0%,
          100% {
            transform: translateY(-50%) scale(1);
          }
          50% {
            transform: translateY(-50%) scale(1.1);
          }
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .toc-title {
            font-size: 1.1em;
            margin-bottom: 0.75rem;
          }

          .toc-link {
            padding: 0.375rem 0.625rem;
            font-size: 0.85em;
          }

          .toc-sublist {
            padding-left: 1rem;
          }
        }

        @media (max-width: 768px) {
          .toc-title {
            font-size: 1em;
            margin-bottom: 0.625rem;
          }

          .toc-link {
            padding: 0.3125rem 0.5rem;
            font-size: 0.8em;
          }

          .toc-sublist {
            padding-left: 0.75rem;
          }
        }

        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .toc-title {
            color: #e2e8f0;
          }

          .toc-sublist::before {
            background: linear-gradient(to bottom, #4a5568, transparent);
          }

          .toc-link {
            color: #cbd5e0;
          }

          .toc-link:hover {
            background: rgba(66, 153, 225, 0.1);
            color: rgb(66, 153, 225);
          }

          .toc-link.active {
            background: linear-gradient(
              135deg,
              rgb(66, 153, 225),
              rgb(99, 179, 237)
            );
            color: #1a202c;
          }

          .toc-level-1 .toc-link {
            color: #e2e8f0;
          }

          .toc-level-2 .toc-link {
            color: #cbd5e0;
          }

          .toc-level-3 .toc-link {
            color: #a0aec0;
          }

          .toc-level-4 .toc-link,
          .toc-level-5 .toc-link,
          .toc-level-6 .toc-link {
            color: #718096;
          }
        }
      `}</style>
    </div>
  );
}
