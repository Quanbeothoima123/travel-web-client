"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  // Show button when page is scrolled down
  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);

    return () => {
      window.removeEventListener("scroll", toggleVisibility);
    };
  }, []);

  // Scroll to top smoothly
  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      <div
        className={`
          fixed bottom-[30px] right-[30px] z-1000
          transition-all duration-300 ease-in-out
          ${
            isVisible
              ? "opacity-100 visible translate-y-0"
              : "opacity-0 invisible translate-y-5"
          }
          md:bottom-5 md:right-5
          sm:bottom-[15px] sm:right-[15px]
        `}
      >
        <button
          onClick={scrollToTop}
          className="
            flex flex-col items-center justify-center
            w-[60px] h-[60px]
            bg-linear-to-br from-primary to-[#004494]
            text-white
            border-0 rounded-full cursor-pointer
            shadow-[0_4px_20px_rgba(0,0,128,0.3)]
            transition-all duration-300 ease-in-out
            text-xs font-medium
            hover:translate-y-[-3px] hover:shadow-[0_6px_25px_rgba(0,0,128,0.4)]
            hover:bg-linear-to-br hover:from-primary-hover hover:to-primary-dark
            active:-translate-y-px active:shadow-[0_4px_15px_rgba(0,0,128,0.3)]
            md:w-[50px] md:h-[50px] md:text-[11px]
            sm:w-[45px] sm:h-[45px]
            group
          "
          aria-label="Scroll to top"
        >
          <ArrowUp
            className="
              w-4 h-4 mb-0.5
              group-hover:animate-bounceUp
              md:w-3.5 md:h-3.5
              sm:w-3 sm:h-3
            "
          />
          <span className="text-[10px] leading-none font-semibold md:text-[9px] sm:text-[8px]">
            Lên đầu
          </span>
        </button>
      </div>

      {/* Animation styles */}
      <style jsx>{`
        @keyframes bounceUp {
          0% {
            transform: translateY(0);
          }
          100% {
            transform: translateY(-3px);
          }
        }

        .animate-bounceUp {
          animation: bounceUp 0.6s ease infinite alternate;
        }
      `}</style>
    </>
  );
}
