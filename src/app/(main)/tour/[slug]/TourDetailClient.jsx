// app/tour/[slug]/TourDetailClient.jsx
"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Slider from "react-slick";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { useToast } from "@/contexts/ToastContext";
import {
  Clock,
  Bus,
  Hotel,
  Calendar,
  Plane,
  MapPin,
  Share2,
  Bookmark,
  Phone,
  Linkedin,
  Send,
  AlertCircle,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Maximize,
  ChevronDown,
} from "lucide-react";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

export default function TourDetailClient({ tourDetail }) {
  return (
    <div className="max-w-[1200px] mx-auto p-5 max-sm:p-2.5">
      <div className="flex gap-5 items-start max-lg:flex-col">
        {/* Left Column */}
        <div className="flex-1 max-w-[690px] max-lg:max-w-full">
          <TourCarousel
            thumbnail={tourDetail?.thumbnail}
            images={tourDetail?.images || []}
          />
          <TourExperience tour={tourDetail} />
          <TourSchedule tour={tourDetail} />
          <TourTerms terms={tourDetail?.term} />
        </div>

        {/* Right Column - Sticky */}
        <div className="flex-[0_0_504px] sticky top-[50px] max-lg:flex-1 max-lg:w-full max-lg:static">
          <TourInfo tourDetail={tourDetail} />
        </div>
      </div>
    </div>
  );
}

// ==================== TOUR CAROUSEL ====================
function TourCarousel({ thumbnail, images }) {
  const [nav1, setNav1] = useState(null);
  const [nav2, setNav2] = useState(null);
  const slider1 = useRef(null);
  const slider2 = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const transformComponentRef = useRef(null);

  const fullImages = [{ url: thumbnail, index: 0 }, ...images].sort(
    (a, b) => a.index - b.index
  );

  useEffect(() => {
    setNav1(slider1.current);
    setNav2(slider2.current);
  }, []);

  useEffect(() => {
    if (lightboxOpen) {
      slider1.current?.slickPause();
      document.body.style.overflow = "hidden";
    } else {
      slider1.current?.slickPlay();
      document.body.style.overflow = "auto";
    }
  }, [lightboxOpen]);

  const mainSettings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: true,
    asNavFor: nav2,
    ref: slider1,
    beforeChange: (_, next) => setActiveIndex(next),
    responsive: [{ breakpoint: 768, settings: { arrows: false } }],
  };

  const thumbSettings = {
    slidesToShow: 5,
    slidesToScroll: 1,
    asNavFor: nav1,
    centerMode: false,
    focusOnSelect: true,
    ref: slider2,
    responsive: [
      { breakpoint: 768, settings: { slidesToShow: 3 } },
      { breakpoint: 480, settings: { slidesToShow: 2 } },
    ],
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => setLightboxOpen(false);

  const nextImage = useCallback(() => {
    setLightboxIndex((prev) => (prev === fullImages.length - 1 ? 0 : prev + 1));
    transformComponentRef.current?.resetTransform();
  }, [fullImages.length]);

  const prevImage = useCallback(() => {
    setLightboxIndex((prev) => (prev === 0 ? fullImages.length - 1 : prev - 1));
    transformComponentRef.current?.resetTransform();
  }, [fullImages.length]);

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyPress = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [lightboxOpen, nextImage, prevImage]);

  return (
    <div className="w-full p-5 bg-white rounded-xl shadow-lg flex flex-col gap-4 max-sm:p-2.5">
      {/* Main Slider */}
      <Slider {...mainSettings}>
        {fullImages.map((img, idx) => (
          <div key={idx}>
            <div
              className="relative w-full aspect-video cursor-zoom-in overflow-hidden rounded-xl transition-transform hover:scale-[1.02]"
              onClick={() => openLightbox(idx)}
            >
              <Image
                src={img.url}
                alt={`Tour ${idx}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 690px"
              />
            </div>
          </div>
        ))}
      </Slider>

      <div className="h-5" />

      {/* Thumbnail Slider */}
      <Slider {...thumbSettings}>
        {fullImages.map((img, idx) => (
          <div key={idx} className="px-1">
            <div
              className={`relative w-[120px] aspect-[4/3] cursor-pointer rounded-lg overflow-hidden transition-all hover:scale-105 hover:shadow-[0_0_10px_rgba(0,0,128,0.5)] max-md:w-[90px] max-sm:w-[70px] ${
                idx === activeIndex
                  ? "ring-3 ring-primary shadow-[0_0_12px_rgba(0,0,128,0.7)]"
                  : ""
              }`}
              onClick={() => {
                slider1.current?.slickGoTo(idx);
                setActiveIndex(idx);
              }}
            >
              <Image
                src={img.url}
                alt={`Thumb ${idx}`}
                fill
                className="object-cover"
                sizes="120px"
              />
            </div>
          </div>
        ))}
      </Slider>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center animate-[fadeIn_0.3s]"
          onClick={closeLightbox}
        >
          <button
            className="absolute top-5 right-5 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center hover:bg-white hover:scale-110 transition-all z-[10000] max-md:top-2.5 max-md:right-2.5 max-md:w-10 max-md:h-10"
            onClick={closeLightbox}
          >
            <X className="w-5 h-5 text-gray-800" />
          </button>

          <button
            className="absolute left-5 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center hover:bg-white hover:scale-110 transition-all z-[10000] max-md:w-10 max-md:h-10"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
          >
            <ChevronLeft className="w-5 h-5 text-gray-800" />
          </button>

          <button
            className="absolute right-5 w-12 h-12 rounded-full bg-white/90 flex items-center justify-center hover:bg-white hover:scale-110 transition-all z-[10000] max-md:w-10 max-md:h-10"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
          >
            <ChevronRight className="w-5 h-5 text-gray-800" />
          </button>

          <div
            className="relative max-w-[90%] max-h-[90%] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <TransformWrapper
              ref={transformComponentRef}
              initialScale={1}
              minScale={0.5}
              maxScale={4}
              centerOnInit={true}
            >
              {({ zoomIn, zoomOut, resetTransform, state }) => (
                <>
                  <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 bg-white/95 px-4 py-3 rounded-full shadow-lg z-[10001] items-center max-md:bottom-5 max-md:px-3 max-md:py-2">
                    <button
                      onClick={() => zoomOut()}
                      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all max-md:w-8 max-md:h-8"
                      title="Zoom Out"
                    >
                      <ZoomOut className="w-4 h-4 text-gray-800" />
                    </button>
                    <button
                      onClick={() => resetTransform()}
                      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all max-md:w-8 max-md:h-8"
                      title="Reset"
                    >
                      <Maximize className="w-4 h-4 text-gray-800" />
                    </button>
                    <button
                      onClick={() => zoomIn()}
                      className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-gray-100 transition-all max-md:w-8 max-md:h-8"
                      title="Zoom In"
                    >
                      <ZoomIn className="w-4 h-4 text-gray-800" />
                    </button>
                    <span className="text-sm font-semibold text-gray-800 min-w-[45px] text-center max-md:text-xs max-md:min-w-[40px]">
                      {Math.round((state?.scale || 1) * 100)}%
                    </span>
                  </div>

                  <TransformComponent
                    wrapperClass="!w-[90vw] !h-[80vh] !flex !items-center !justify-center !cursor-grab active:!cursor-grabbing !overflow-hidden"
                    contentClass="flex items-center justify-center w-full h-full"
                  >
                    <Image
                      src={fullImages[lightboxIndex]?.url}
                      alt={`Tour ${lightboxIndex}`}
                      width={1920}
                      height={1080}
                      className="max-w-full max-h-full object-contain rounded-lg shadow-[0_10px_50px_rgba(0,0,0,0.5)] select-none pointer-events-none"
                      draggable={false}
                    />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>

            <div className="absolute -top-10 right-0 text-white text-sm bg-black/70 px-4 py-2 rounded-full">
              {lightboxIndex + 1} / {fullImages.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== TOUR INFO ====================
function TourInfo({ tourDetail }) {
  const [phone, setPhone] = useState("");
  const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
  const { showToast } = useToast();
  if (!tourDetail) return null;

  const {
    _id: tourId,
    title,
    travelTimeId,
    vehicleId,
    hotelId,
    frequency,
    departPlaceId,
    prices,
    discount,
    tags,
    slug,
  } = tourDetail;

  const discountedPrice = prices * (1 - discount / 100);
  const duration = `${travelTimeId?.day || 0} Ngày ${
    travelTimeId?.night || 0
  } Đêm`;
  const transport = vehicleId?.[0]?.name || "Ô tô";
  const stay = `${hotelId?.name || "Khách sạn"} ${hotelId?.star || 3} sao`;
  const start = frequency?.title || "Hàng ngày";

  const isValidVNPhone = (number) => {
    const regex = /^(0|\+84)(3|5|7|8|9)[0-9]{8}$/;
    return regex.test(number);
  };

  const handleSend = async () => {
    if (!phone) {
      showToast("Vui lòng nhập số điện thoại!", "error");
      return;
    }
    if (!isValidVNPhone(phone)) {
      showToast("Số điện thoại không hợp lệ!", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/customer-consolation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ phoneNumber: phone, tourId }),
      });
      const data = await res.json();
      if (data.success) {
        showToast("Chúng tôi sẽ sớm liên hệ với bạn!", "success");
        setPhone("");
      } else {
        showToast(data.message || "Có lỗi xảy ra", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("Không thể kết nối server!", "error");
    }
  };

  return (
    <div className="w-full bg-white p-5 rounded-xl shadow-md transition-all hover:-translate-y-1 hover:shadow-lg max-md:p-4">
      <h1 className="text-[1.375rem] text-primary mb-4 leading-[1.4] uppercase max-md:text-lg">
        {title}
      </h1>

      <p className="text-[0.9375rem] my-1.5 flex items-center gap-2">
        <Clock className="text-primary min-w-[18px]" size={18} />
        Thời gian: {duration}
      </p>
      <p className="text-[0.9375rem] my-1.5 flex items-center gap-2">
        <Bus className="text-primary min-w-[18px]" size={18} />
        Phương tiện: {transport}
      </p>
      <p className="text-[0.9375rem] my-1.5 flex items-center gap-2">
        <Hotel className="text-primary min-w-[18px]" size={18} />
        Lưu trú: {stay}
      </p>
      <p className="text-[0.9375rem] my-1.5 flex items-center gap-2">
        <Calendar className="text-primary min-w-[18px]" size={18} />
        Khởi hành: {start}
      </p>

      {departPlaceId && (
        <>
          <p className="text-[0.9375rem] my-1.5 flex items-center gap-2">
            <Plane className="text-primary min-w-[18px]" size={18} />
            Điểm khởi hành: {departPlaceId.name}
            {departPlaceId.googleDirection && (
              <a
                href={departPlaceId.googleDirection}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-[0.8125rem] text-primary flex items-center gap-1 hover:text-[--color-primary-hover] hover:underline"
              >
                <MapPin size={14} />
                Map
              </a>
            )}
          </p>
          <p className="text-[0.9375rem] my-1.5 flex items-center gap-2">
            <AlertCircle className="text-primary min-w-[18px]" size={18} />
            Chú ý: {departPlaceId.description}
          </p>
        </>
      )}

      <div className="text-[2rem] text-red-600 my-4 font-bold max-md:text-2xl">
        {discountedPrice.toLocaleString("vi-VN", {
          style: "currency",
          currency: "VND",
        })}
        <del className="text-gray-400 text-sm ml-2">
          {prices.toLocaleString("vi-VN", {
            style: "currency",
            currency: "VND",
          })}
        </del>
      </div>

      <Link
        href={`/booking-tour/${slug}`}
        className="block text-center bg-primary text-white py-2.5 px-5 rounded-full transition-all hover:bg-transparent hover:text-white hover:ring-3 hover:ring-white hover:font-semibold my-2.5"
      >
        ĐẶT TOUR
      </Link>

      <div className="flex gap-2 flex-wrap mt-5">
        {tags?.map((tag, i) => (
          <button
            key={i}
            className="cursor-pointer bg-white text-primary border-2 border-primary py-2.5 px-5 rounded-full text-sm font-medium transition-all hover:!bg-primary hover:!text-white"
          >
            {tag}
          </button>
        ))}
      </div>

      <div className="flex gap-5 my-4 text-sm text-gray-600 items-center flex-wrap">
        <span className="flex items-center gap-1 cursor-pointer transition-colors hover:text-primary">
          <Share2 className="text-primary" size={16} />
          Chia sẻ
        </span>
        <span className="flex items-center gap-1 cursor-pointer transition-colors hover:text-primary">
          <Bookmark className="text-primary" size={16} />
          Lưu
        </span>
        <span className="flex items-center gap-1 cursor-pointer transition-colors hover:text-primary">
          <Phone className="text-primary" size={16} />
          Gọi
        </span>
        <span className="flex items-center gap-1 cursor-pointer transition-colors hover:text-primary">
          <Linkedin className="text-primary" size={16} />
          In Share
        </span>
      </div>

      <p className="text-sm text-gray-500 my-2.5">
        Hoặc Quý Khách có thể để lại thông tin liên hệ để được tư vấn chi tiết.
      </p>

      <div className="flex mt-2.5 border border-gray-200 rounded-full overflow-hidden">
        <input
          type="tel"
          placeholder="Nhập số điện thoại của bạn"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="flex-1 border-none py-2.5 px-4 text-sm outline-none"
        />
        <button
          onClick={handleSend}
          className=" cursor-pointer bg-red-600 text-white py-2.5 px-5 flex items-center gap-1.5 transition-colors hover:bg-red-700"
        >
          <Send size={16} />
          Gửi đi
        </button>
      </div>
    </div>
  );
}

// ==================== TOUR EXPERIENCE ====================
function TourExperience({ tour }) {
  const specialExperience = tour?.specialExperience || "";

  if (!specialExperience) return null;

  return (
    <div className="w-full my-5 p-5 bg-white rounded-xl shadow-md max-md:p-4">
      <h2 className="text-xl font-semibold mb-4 text-gray-800 max-md:text-lg">
        Trải nghiệm thú vị trong tour
      </h2>
      <div
        className="text-[0.9375rem] leading-[1.6] text-gray-700 prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: specialExperience }}
      />
    </div>
  );
}

// ==================== TOUR SCHEDULE ====================
function TourSchedule({ tour }) {
  const description = tour?.description || [];
  const [allOpen, setAllOpen] = useState(false);
  const [isToggleAllAction, setIsToggleAllAction] = useState(false);

  const toggleAll = () => {
    setIsToggleAllAction(true);
    setAllOpen(!allOpen);
    setTimeout(() => setIsToggleAllAction(false), 100);
  };

  const onIndividualToggle = () => {
    if (!isToggleAllAction && allOpen) {
      setAllOpen(false);
    }
  };

  if (!description || description.length === 0) return null;

  return (
    <div className="w-full my-5 p-5 bg-white rounded-xl shadow-md max-md:p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 max-md:text-lg">
          Chương trình tour
        </h2>
        <button
          onClick={toggleAll}
          className="cursor-pointer text-sm text-primary bg-white border-2 border-primary py-1 px-2.5 rounded-lg font-medium transition-all hover:!bg-primary hover:!text-white max-md:text-xs max-md:py-1 max-md:px-2"
        >
          {allOpen ? "Thu gọn" : "Xem tất cả"}
        </button>
      </div>
      {description.map((item, index) => (
        <DayItem
          key={index}
          {...item}
          isOpen={allOpen}
          onIndividualToggle={onIndividualToggle}
        />
      ))}
    </div>
  );
}

// ==================== DAY ITEM ====================
function DayItem({
  day,
  title,
  image,
  description,
  isOpen,
  onIndividualToggle,
}) {
  const [localOpen, setLocalOpen] = useState(false);
  const contentRef = useRef(null);

  // Use isOpen from parent if provided, otherwise use local state
  const expanded = isOpen !== undefined ? isOpen : localOpen;

  useEffect(() => {
    if (contentRef.current) {
      if (expanded) {
        contentRef.current.style.maxHeight =
          contentRef.current.scrollHeight + "px";
      } else {
        contentRef.current.style.maxHeight = "0px";
      }
    }
  }, [expanded]);

  const handleHeaderClick = (e) => {
    if (!e.target.closest(".day-icon")) {
      setLocalOpen(!localOpen);
      if (onIndividualToggle) {
        onIndividualToggle();
      }
    }
  };

  const handleIconClick = (e) => {
    e.stopPropagation();
    setLocalOpen(!localOpen);
    if (onIndividualToggle) {
      onIndividualToggle();
    }
  };

  const handleContentClick = (e) => {
    e.stopPropagation();
  };

  return (
    <div className="bg-white rounded-lg mb-3 p-4 cursor-pointer shadow-sm w-full overflow-hidden transition-all border border-gray-200 hover:shadow-md hover:-translate-y-0.5">
      <div
        className="flex items-center justify-between gap-3"
        onClick={handleHeaderClick}
      >
        {!expanded && image && (
          <div className="relative w-[100px] h-[60px] flex-shrink-0 rounded overflow-hidden max-md:w-20 max-md:h-12">
            <Image
              src={image}
              alt={`Day ${day}`}
              fill
              className="object-cover"
              sizes="100px"
            />
          </div>
        )}
        <div
          className={`flex-1 transition-all ${
            expanded
              ? "ml-0 whitespace-normal"
              : "overflow-hidden text-ellipsis whitespace-nowrap"
          }`}
        >
          <span className="text-[0.85rem] text-gray-500 block">Ngày {day}</span>
          <h5 className="text-base mt-1 font-semibold text-gray-800 overflow-hidden text-ellipsis whitespace-nowrap max-md:text-sm">
            {title}
          </h5>
        </div>
        <span
          className={`day-icon text-[0.8rem] transition-transform text-gray-500 ${
            expanded ? "rotate-180 text-primary" : ""
          }`}
          onClick={handleIconClick}
        >
          <ChevronDown size={16} />
        </span>
      </div>
      <div
        ref={contentRef}
        className={`max-h-0 overflow-hidden transition-all duration-[350ms] ${
          expanded ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleContentClick}
      >
        <div
          className="pt-3.5 text-[0.9rem] leading-[1.6] text-gray-700 break-words prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: description }}
        />
      </div>
    </div>
  );
}

// ==================== TOUR TERMS ====================
function TourTerms({ terms }) {
  const [activeTab, setActiveTab] = useState(0);
  const [height, setHeight] = useState("auto");
  const contentRef = useRef(null);

  const filteredTerms = (terms || [])
    .filter((term) => term.description && term.description.trim() !== "")
    .sort((a, b) => a.index - b.index);

  useEffect(() => {
    if (contentRef.current) {
      setHeight(contentRef.current.scrollHeight + "px");
    }
  }, [activeTab, filteredTerms]);

  if (filteredTerms.length === 0) return null;

  return (
    <div className="w-full my-5 p-5 bg-white rounded-xl shadow-md max-md:p-4">
      <div className="flex gap-2.5 mb-4 flex-wrap">
        {filteredTerms.map((term, index) => (
          <button
            key={term.termId?._id || index}
            className={`py-2.5 px-4 border-2 border-primary cursor-pointer rounded text-[0.9375rem] font-medium flex items-center gap-2 transition-all max-md:text-sm max-md:py-2 max-md:px-3.5 ${
              activeTab === index
                ? "bg-primary text-white -translate-y-0.5 shadow-sm"
                : "bg-white text-primary hover:!bg-primary hover:!text-white"
            }`}
            onClick={() => setActiveTab(index)}
          >
            <span>{term.termId?.title || `Điều khoản ${index + 1}`}</span>
          </button>
        ))}
      </div>
      {filteredTerms[activeTab] && (
        <div
          className="overflow-hidden transition-all duration-400"
          style={{ maxHeight: height }}
        >
          <div
            ref={contentRef}
            className="opacity-100 py-3 px-1 leading-[1.6] text-[0.9375rem] transition-opacity duration-300 text-gray-700 prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{
              __html: filteredTerms[activeTab].description,
            }}
          />
        </div>
      )}
    </div>
  );
}
