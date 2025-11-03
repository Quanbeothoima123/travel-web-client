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
    </div>
  );
}
