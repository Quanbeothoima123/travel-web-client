// app/gallery/detail/[slug]/GalleryDetailClient.js
"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Eye,
  Heart,
  Share2,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Folder,
  Calendar,
  ZoomIn,
  ZoomOut,
  Maximize,
  Loader2,
} from "lucide-react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function GalleryDetailClient({ slug }) {
  const [gallery, setGallery] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showLightbox, setShowLightbox] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [liked, setLiked] = useState(false);
  const viewCountedRef = useRef(false);
  const transformComponentRef = useRef(null);

  useEffect(() => {
    fetchGalleryDetail();
  }, [slug]);

  useEffect(() => {
    if (gallery && !viewCountedRef.current) {
      handleIncrementView();
      viewCountedRef.current = true;
    }
  }, [gallery]);

  const fetchGalleryDetail = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/api/v1/gallery/detail/${slug}`, {
        credentials: "include",
      });
      const data = await res.json();

      if (data.success) {
        setGallery(data.data);
      }
    } catch (error) {
      console.error("Error fetching gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleIncrementView = async () => {
    if (!gallery?._id) return;
    try {
      await fetch(`${API_BASE}/api/v1/gallery/view/${gallery._id}`, {
        method: "POST",
        credentials: "include",
      });
    } catch (error) {
      console.error("Error incrementing view:", error);
    }
  };

  const handleLike = async () => {
    if (liked) return;
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/gallery/like/${gallery._id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );
      const data = await res.json();

      if (data.success) {
        setGallery((prev) => ({ ...prev, likes: data.likes }));
        setLiked(true);
      }
    } catch (error) {
      console.error("Error liking gallery:", error);
    }
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: gallery.title,
          text: gallery.shortDescription,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link đã được sao chép!");
      }

      await fetch(`${API_BASE}/api/v1/gallery/share/${gallery._id}`, {
        method: "POST",
        credentials: "include",
      });
      setGallery((prev) => ({ ...prev, shares: (prev.shares || 0) + 1 }));
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setShowLightbox(true);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setShowLightbox(false);
    document.body.style.overflow = "auto";
  };

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === gallery.images.length - 1 ? 0 : prev + 1
    );
    if (transformComponentRef.current) {
      transformComponentRef.current.resetTransform();
    }
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? gallery.images.length - 1 : prev - 1
    );
    if (transformComponentRef.current) {
      transformComponentRef.current.resetTransform();
    }
  };

  useEffect(() => {
    if (!showLightbox) return;

    const handleKeyPress = (e) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [showLightbox, gallery]);

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return "";
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11
      ? `https://www.youtube.com/embed/${match[2]}`
      : url;
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("vi-VN");
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2
          size={48}
          className="animate-spin"
          style={{ color: "var(--color-primary)" }}
        />
      </div>
    );
  }

  if (!gallery) {
    return (
      <div className="text-center py-24 px-5">
        <h2
          className="text-3xl font-bold mb-5"
          style={{ color: "var(--color-text)" }}
        >
          Không tìm thấy bộ sưu tập
        </h2>
        <Link
          href="/gallery/all"
          className="inline-block px-7 py-3 rounded-lg text-white font-medium transition-all"
          style={{ backgroundColor: "var(--color-primary)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor =
              "var(--color-primary-hover)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "var(--color-primary)";
          }}
        >
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-10">
      {/* Header */}
      <div className="mb-12">
        {/* Breadcrumb */}
        <div
          className="flex items-center gap-2 text-sm mb-5 flex-wrap"
          style={{ color: "var(--color-text-muted)" }}
        >
          <Link
            href="/"
            className="transition-colors"
            style={{ color: "var(--color-primary)" }}
          >
            Trang chủ
          </Link>
          <span>/</span>
          <Link
            href="/gallery/all"
            className="transition-colors"
            style={{ color: "var(--color-primary)" }}
          >
            Gallery
          </Link>
          {gallery.galleryCategory && (
            <>
              <span>/</span>
              <Link
                href={`/gallery/${gallery.galleryCategory.slug}`}
                className="transition-colors"
                style={{ color: "var(--color-primary)" }}
              >
                {gallery.galleryCategory.title}
              </Link>
            </>
          )}
          <span>/</span>
          <span style={{ color: "var(--color-text)", fontWeight: 500 }}>
            {gallery.title}
          </span>
        </div>

        {/* Title */}
        <h1
          className="text-4xl font-bold mb-4 leading-tight max-md:text-3xl"
          style={{ color: "var(--color-text)" }}
        >
          {gallery.title}
        </h1>

        {gallery.shortDescription && (
          <p
            className="text-lg leading-relaxed mb-6"
            style={{ color: "var(--color-text-muted)" }}
          >
            {gallery.shortDescription}
          </p>
        )}

        {/* Meta Info */}
        <div
          className="flex gap-7 flex-wrap mb-7"
          style={{ color: "var(--color-text-secondary)" }}
        >
          {gallery.tour && (
            <div className="flex items-center gap-2">
              <MapPin size={16} style={{ color: "var(--color-primary)" }} />
              <Link
                href={`/tour/${gallery.tour.slug}`}
                className="font-medium transition-colors"
                style={{ color: "var(--color-primary)" }}
              >
                {gallery.tour.title}
              </Link>
            </div>
          )}
          {gallery.galleryCategory && (
            <div className="flex items-center gap-2">
              <Folder size={16} style={{ color: "var(--color-primary)" }} />
              <span>{gallery.galleryCategory.title}</span>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar size={16} style={{ color: "var(--color-primary)" }} />
            <span>{formatDate(gallery.createdAt)}</span>
          </div>
        </div>

        {/* Stats & Actions */}
        <div
          className="flex justify-between items-center py-5 flex-wrap gap-5"
          style={{
            borderTop: "1px solid var(--color-border)",
            borderBottom: "1px solid var(--color-border)",
          }}
        >
          <div className="flex gap-7">
            <span
              className="flex items-center gap-2 font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <Eye size={18} style={{ color: "var(--color-primary)" }} />
              {gallery.views || 0}
            </span>
            <span
              className="flex items-center gap-2 font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <Heart size={18} style={{ color: "var(--color-primary)" }} />
              {gallery.likes || 0}
            </span>
            <span
              className="flex items-center gap-2 font-medium"
              style={{ color: "var(--color-text-secondary)" }}
            >
              <Share2 size={18} style={{ color: "var(--color-primary)" }} />
              {gallery.shares || 0}
            </span>
          </div>

          <div className="flex gap-4">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                liked ? "cursor-not-allowed" : ""
              }`}
              style={{
                backgroundColor: liked ? "#e74c3c" : "transparent",
                color: liked ? "white" : "#e74c3c",
                border: "2px solid #e74c3c",
              }}
              disabled={liked}
              onMouseEnter={(e) => {
                if (!liked) {
                  e.currentTarget.style.backgroundColor = "#e74c3c";
                  e.currentTarget.style.color = "white";
                }
              }}
              onMouseLeave={(e) => {
                if (!liked) {
                  e.currentTarget.style.backgroundColor = "transparent";
                  e.currentTarget.style.color = "#e74c3c";
                }
              }}
            >
              <Heart size={16} fill={liked ? "currentColor" : "none"} />
              {liked ? "Đã thích" : "Yêu thích"}
            </button>
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white transition-all"
              style={{ backgroundColor: "var(--color-primary)" }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "var(--color-primary-hover)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "var(--color-primary)";
              }}
            >
              <Share2 size={16} />
              Chia sẻ
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mt-12">
        {/* Images Section */}
        {gallery.images && gallery.images.length > 0 && (
          <section className="mb-14">
            <h2
              className="text-3xl font-semibold mb-7 pb-4"
              style={{
                color: "var(--color-text)",
                borderBottom: "3px solid var(--color-primary)",
              }}
            >
              Hình ảnh ({gallery.images.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {gallery.images.map((image, index) => (
                <div
                  key={index}
                  className="relative aspect-[4/3] overflow-hidden rounded-xl cursor-pointer transition-all group"
                  style={{ boxShadow: "var(--shadow-md)" }}
                  onClick={() => openLightbox(index)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-5px)";
                    e.currentTarget.style.boxShadow = "var(--shadow-lg)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "var(--shadow-md)";
                  }}
                >
                  <img
                    src={image.url}
                    alt={image.title || gallery.title}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  {image.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-5 pt-12 translate-y-full transition-transform duration-300 group-hover:translate-y-0">
                      <span className="text-white text-sm font-medium block">
                        {image.title}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Description */}
        {gallery.longDescription && (
          <section className="mb-14">
            <h2
              className="text-3xl font-semibold mb-7 pb-4"
              style={{
                color: "var(--color-text)",
                borderBottom: "3px solid var(--color-primary)",
              }}
            >
              Mô tả chi tiết
            </h2>
            <div
              className="prose max-w-none text-base leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
              dangerouslySetInnerHTML={{ __html: gallery.longDescription }}
            />
          </section>
        )}

        {/* Videos Section */}
        {gallery.videos && gallery.videos.length > 0 && (
          <section className="mb-14">
            <h2
              className="text-3xl font-semibold mb-7 pb-4"
              style={{
                color: "var(--color-text)",
                borderBottom: "3px solid var(--color-primary)",
              }}
            >
              Video ({gallery.videos.length})
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-7">
              {gallery.videos.map((video, index) => (
                <div
                  key={index}
                  className="bg-white rounded-xl overflow-hidden"
                  style={{ boxShadow: "var(--shadow-md)" }}
                >
                  {video.title && (
                    <h3
                      className="px-5 py-4 font-semibold"
                      style={{
                        color: "var(--color-text)",
                        backgroundColor: "var(--color-bg-card)",
                      }}
                    >
                      {video.title}
                    </h3>
                  )}
                  <div className="relative pb-[56.25%] h-0 overflow-hidden">
                    <iframe
                      src={getYouTubeEmbedUrl(video.url)}
                      title={video.title || `Video ${index + 1}`}
                      className="absolute top-0 left-0 w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Tags */}
        {gallery.tags && gallery.tags.length > 0 && (
          <section className="mb-14">
            <h2
              className="text-3xl font-semibold mb-7 pb-4"
              style={{
                color: "var(--color-text)",
                borderBottom: "3px solid var(--color-primary)",
              }}
            >
              Tags
            </h2>
            <div className="flex flex-wrap gap-3">
              {gallery.tags.map((tag, index) => (
                <span
                  key={index}
                  className="inline-block px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer"
                  style={{
                    backgroundColor: "#e8f4f8",
                    color: "var(--color-primary)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor =
                      "var(--color-primary)";
                    e.currentTarget.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#e8f4f8";
                    e.currentTarget.style.color = "var(--color-primary)";
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox */}
      {showLightbox && gallery.images && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center animate-fadeIn"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.95)" }}
          onClick={closeLightbox}
        >
          <button
            className="absolute top-5 right-5 w-12 h-12 rounded-full flex items-center justify-center bg-white/90 transition-all z-[10000]"
            onClick={closeLightbox}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.9)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <X size={20} style={{ color: "#333" }} />
          </button>

          <button
            className="absolute left-5 w-12 h-12 rounded-full flex items-center justify-center bg-white/90 transition-all z-[10000]"
            onClick={(e) => {
              e.stopPropagation();
              prevImage();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.9)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <ChevronLeft size={20} style={{ color: "#333" }} />
          </button>

          <button
            className="absolute right-5 w-12 h-12 rounded-full flex items-center justify-center bg-white/90 transition-all z-[10000]"
            onClick={(e) => {
              e.stopPropagation();
              nextImage();
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.transform = "scale(1.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor =
                "rgba(255, 255, 255, 0.9)";
              e.currentTarget.style.transform = "scale(1)";
            }}
          >
            <ChevronRight size={20} style={{ color: "#333" }} />
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
              wheel={{ step: 0.1 }}
              doubleClick={{ mode: "reset" }}
              panning={{ velocityDisabled: true }}
            >
              {({ zoomIn, zoomOut, resetTransform, state }) => (
                <>
                  <div
                    className="absolute bottom-7 left-1/2 -translate-x-1/2 flex gap-2.5 bg-white/95 px-4 py-3 rounded-full z-[10001] items-center"
                    style={{ boxShadow: "var(--shadow-lg)" }}
                  >
                    <button
                      onClick={() => zoomOut()}
                      title="Zoom Out"
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                      style={{ color: "#333" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f0f0";
                        e.currentTarget.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <ZoomOut size={16} />
                    </button>
                    <button
                      onClick={() => resetTransform()}
                      title="Reset Zoom"
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                      style={{ color: "#333" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f0f0";
                        e.currentTarget.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <Maximize size={16} />
                    </button>
                    <button
                      onClick={() => zoomIn()}
                      title="Zoom In"
                      className="w-9 h-9 rounded-full flex items-center justify-center transition-all"
                      style={{ color: "#333" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = "#f0f0f0";
                        e.currentTarget.style.transform = "scale(1.1)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        e.currentTarget.style.transform = "scale(1)";
                      }}
                    >
                      <ZoomIn size={16} />
                    </button>
                    <span
                      className="text-sm font-semibold min-w-[45px] text-center px-2"
                      style={{ color: "#333" }}
                    >
                      {Math.round((state?.scale || 1) * 100)}%
                    </span>
                  </div>

                  <TransformComponent
                    wrapperClass="!w-[90vw] !h-[80vh] !flex !items-center !justify-center !cursor-grab active:!cursor-grabbing !overflow-hidden"
                    contentClass="flex items-center justify-center w-full h-full"
                  >
                    <img
                      src={gallery.images[currentImageIndex]?.url}
                      alt={
                        gallery.images[currentImageIndex]?.title ||
                        gallery.title
                      }
                      className="max-w-full max-h-full object-contain rounded-lg select-none pointer-events-none"
                      style={{ boxShadow: "0 10px 50px rgba(0, 0, 0, 0.5)" }}
                      draggable={false}
                    />
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>

            {gallery.images[currentImageIndex]?.title && (
              <div className="mt-5 text-white text-center max-w-[600px]">
                {gallery.images[currentImageIndex].title}
              </div>
            )}
            <div
              className="absolute -top-10 right-0 text-white text-sm px-4 py-2 rounded-full"
              style={{ backgroundColor: "rgba(0, 0, 0, 0.7)" }}
            >
              {currentImageIndex + 1} / {gallery.images.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
