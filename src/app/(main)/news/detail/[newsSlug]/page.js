"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import {
  Calendar,
  Eye,
  Heart,
  Bookmark,
  Share2,
  Tags,
  User,
  Loader2,
} from "lucide-react";
import ScrollToTopButton from "@/components/common/ScrollToTopButton";
import Comment from "@/components/common/Commnent";
import { useToast } from "@/contexts/ToastContext";

// Dynamic import SimpleTOCWrapper to avoid SSR issues
const SimpleTOCWrapper = dynamic(
  () => import("@/components/common/SimpleTOCWrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center py-10">
        <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
      </div>
    ),
  }
);

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const NewsDetail = () => {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const newsSlug = params?.newsSlug;

  // States
  const [newsData, setNewsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [userLoading, setUserLoading] = useState(true);

  // Fetch current user
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/users/me`, {
        method: "GET",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const result = await response.json();
        setCurrentUser(result.data || result.user || result);
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin user:", error);
      setCurrentUser(null);
    } finally {
      setUserLoading(false);
    }
  };

  // Update view count
  const updateViewCount = async (newsId) => {
    try {
      await fetch(`${API_BASE}/api/v1/news/update-views/${newsId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (err) {
      console.error("Error updating view count:", err);
    }
  };

  // Load liked status
  const loadStatusLikedForUser = async (newsId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/user-favorite/getStatusForNews/${newsId}`,
        { credentials: "include" }
      );
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setLiked(false);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const { favorite } = await response.json();
      setLiked(!!favorite?._id);
    } catch (error) {
      console.error("Error loading liked status:", error);
      setLiked(false);
    }
  };

  // Load saved status
  const loadStatusSavedForUser = async (newsId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/user-saves/status/news/${newsId}`,
        { credentials: "include" }
      );
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          setSaved(false);
          return;
        }
        throw new Error(`HTTP ${response.status}`);
      }

      const { favorite } = await response.json();
      setSaved(!!favorite?._id);
    } catch (error) {
      console.error("Error loading saved status:", error);
      setSaved(false);
    }
  };

  // Fetch news detail
  useEffect(() => {
    const fetchNewsDetail = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `${API_BASE}/api/v1/news/detail/${newsSlug}`,
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Không tìm thấy bài viết");
        }

        const data = await response.json();
        setNewsData(data.data);

        // Update view count
        updateViewCount(data.data._id).catch(console.error);

        // Load liked and saved status
        loadStatusLikedForUser(data.data._id).catch(console.error);
        loadStatusSavedForUser(data.data._id).catch(console.error);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (newsSlug) {
      fetchNewsDetail();
      fetchCurrentUser();
    }
  }, [newsSlug]);

  // Handle like toggle
  const handleLikeToggle = async (likedStatus) => {
    if (!newsData) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/user-favorite/${likedStatus ? "add" : "delete"}/${
          newsData._id
        }`,
        {
          method: likedStatus ? "POST" : "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Không thể cập nhật trạng thái yêu thích"
        );
      }

      setLiked(likedStatus);
      setNewsData((prev) => ({
        ...prev,
        likes: likedStatus
          ? (prev.likes || 0) + 1
          : Math.max((prev.likes || 0) - 1, 0),
      }));
      showToast(`Đã ${likedStatus ? "thích" : "bỏ thích"} bài viết`, "success");
    } catch (error) {
      console.error("Error toggling like:", error);
      showToast(
        error.message || "Có lỗi khi cập nhật trạng thái yêu thích",
        "error"
      );
    }
  };

  // Handle save toggle
  const handleSaveToggle = async (savedStatus) => {
    if (!newsData) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/user-saves/news/${newsData._id}`,
        {
          method: savedStatus ? "POST" : "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Không thể cập nhật trạng thái lưu bài viết"
        );
      }

      setSaved(savedStatus);
      setNewsData((prev) => ({
        ...prev,
        saves: savedStatus
          ? (prev.saves || 0) + 1
          : Math.max((prev.saves || 0) - 1, 0),
      }));
      showToast(`Đã ${savedStatus ? "lưu" : "bỏ lưu"} bài viết`, "success");
    } catch (error) {
      console.error("Error toggling save:", error);
      showToast(
        error.message || "Có lỗi khi cập nhật trạng thái lưu bài viết",
        "error"
      );
    }
  };

  // Handle share
  const handleShare = async () => {
    if (!newsData) return;

    try {
      if (navigator.share) {
        await navigator.share({
          title: newsData.title,
          text: newsData.excerpt,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Đã sao chép liên kết!", "success");
      }

      const response = await fetch(
        `${API_BASE}/api/v1/user-shares/news/${newsData._id}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (response.ok) {
        setNewsData((prev) => ({
          ...prev,
          shares: (prev.shares || 0) + 1,
        }));
      }
    } catch (err) {
      console.error("Error sharing:", err);
      try {
        const textArea = document.createElement("textarea");
        textArea.value = window.location.href;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
        showToast("Đã sao chép liên kết!", "success");
      } catch (fallbackErr) {
        showToast("Không thể chia sẻ hoặc sao chép liên kết", "error");
      }
    }
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Get type label
  const getTypeLabel = (type) => {
    const labels = {
      news: "Tin tức",
      guide: "Cẩm nang",
      review: "Đánh giá",
      event: "Sự kiện",
      promotion: "Khuyến mãi",
    };
    return labels[type] || "Bài viết";
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-5">
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <Loader2 className="w-10 h-10 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Đang tải bài viết...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-5">
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <h2 className="text-gray-900 mb-3 text-xl font-semibold">
            Không thể tải bài viết
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/news/tin-tuc"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all hover:-translate-y-0.5"
          >
            Quay lại trang tin tức
          </Link>
        </div>
      </div>
    );
  }

  if (!newsData) {
    return (
      <div className="max-w-6xl mx-auto px-5 py-5">
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <h2 className="text-gray-900 mb-3 text-xl font-semibold">
            Không tìm thấy bài viết
          </h2>
          <Link
            href="/news"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-all hover:-translate-y-0.5"
          >
            Quay lại trang tin tức
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-5 py-5">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6 text-gray-600 flex-wrap">
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-700 transition-colors"
        >
          Trang chủ
        </Link>
        <span>/</span>
        <Link
          href="/news/tin-tuc"
          className="text-blue-600 hover:text-blue-700 transition-colors"
        >
          Tin tức
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[300px]">
          {newsData.title}
        </span>
      </div>

      {/* Article */}
      <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {/* Header */}
        <header className="px-10 py-10 text-center bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200">
          <div className="inline-block px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold uppercase tracking-wide rounded-full mb-4">
            {getTypeLabel(newsData.type)}
          </div>

          <h1 className="text-3xl md:text-4xl font-bold leading-tight text-gray-900 mb-4 max-w-3xl mx-auto">
            {newsData.title}
          </h1>

          {newsData.excerpt && (
            <p className="text-lg leading-relaxed text-gray-600 mb-6 max-w-2xl mx-auto">
              {newsData.excerpt}
            </p>
          )}

          <div className="flex justify-center gap-6 mb-8 flex-wrap">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span>
                {formatDate(newsData.publishedAt || newsData.createdAt)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Eye className="w-4 h-4 text-blue-600" />
              <span>{newsData.views || 0} lượt xem</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Heart className="w-4 h-4 text-blue-600" />
              <span>{newsData.likes || 0} lượt thích</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <Share2 className="w-4 h-4 text-blue-600" />
              <span>{newsData.shares || 0} lượt chia sẻ</span>
            </div>
            {newsData.author && (
              <div className="flex items-center gap-1.5 text-sm text-gray-600">
                <User className="w-4 h-4 text-blue-600" />
                <span>
                  Tác giả:{" "}
                  {newsData.author.type === "admin"
                    ? "Quản trị viên"
                    : "Người dùng"}
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              className={`flex items-center gap-2 px-5 py-3 border-2 text-sm font-medium rounded-full transition-all hover:-translate-y-0.5 ${
                liked
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              }`}
              onClick={() => handleLikeToggle(!liked)}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-current" : ""}`} />
              <span>{liked ? "Đã thích" : "Thích"}</span>
            </button>
            <button
              className={`flex items-center gap-2 px-5 py-3 border-2 text-sm font-medium rounded-full transition-all hover:-translate-y-0.5 ${
                saved
                  ? "border-blue-600 text-blue-600 bg-blue-50"
                  : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
              }`}
              onClick={() => handleSaveToggle(!saved)}
            >
              <Bookmark className={`w-4 h-4 ${saved ? "fill-current" : ""}`} />
              <span>{saved ? "Đã lưu" : "Lưu"}</span>
            </button>
            <button
              className="flex items-center gap-2 px-5 py-3 border-2 border-blue-600 text-blue-600 text-sm font-medium rounded-full hover:bg-blue-600 hover:text-white transition-all hover:-translate-y-0.5"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4" />
              <span>Chia sẻ</span>
            </button>
          </div>
        </header>

        {/* Thumbnail */}
        {newsData.thumbnail && (
          <div className="w-full max-h-[400px] overflow-hidden flex items-center justify-center bg-gray-50">
            <img
              src={newsData.thumbnail}
              alt={newsData.title}
              className="w-full h-auto max-h-[400px] object-cover"
            />
          </div>
        )}

        {/* Content */}
        <div className="px-10 py-10">
          <SimpleTOCWrapper
            htmlContent={newsData.content}
            tocOptions={{
              tocTitle: "Mục lục",
              smoothScroll: true,
              includeNumbers: false,
            }}
            className="nd-simple-toc"
          />

          {/* Additional Content */}
          <div className="mt-10">
            {/* Tags */}
            {newsData.tags && newsData.tags.length > 0 && (
              <div className="mb-10 p-6 bg-gray-50 rounded-xl">
                <h3 className="flex items-center gap-2 mb-4 text-lg text-gray-900 font-semibold">
                  <Tags className="w-5 h-5" /> Từ khóa
                </h3>
                <div className="flex flex-wrap gap-2">
                  {newsData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-sm text-gray-600 hover:border-blue-600 hover:text-blue-600 transition-colors"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Tours */}
            {newsData.relatedTourIds && newsData.relatedTourIds.length > 0 && (
              <div className="p-6 bg-gray-50 rounded-xl">
                <h3 className="mb-5 text-lg text-gray-900 font-semibold">
                  Tour liên quan
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {newsData.relatedTourIds.map((tour) => (
                    <Link
                      key={tour._id}
                      href={`/tours/${tour.slug}`}
                      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md hover:-translate-y-1 transition-all"
                    >
                      {tour.thumbnail && (
                        <img
                          src={tour.thumbnail}
                          alt={tour.title}
                          className="w-full h-30 object-cover"
                        />
                      )}
                      <div className="p-3">
                        <h4 className="text-sm font-semibold leading-tight line-clamp-2 mb-2">
                          {tour.title}
                        </h4>
                        {tour.price && (
                          <p className="text-sm text-blue-600 font-semibold">
                            Từ {tour.price.toLocaleString("vi-VN")} VND
                          </p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comments Section */}
        <div className="border-t border-gray-200">
          {userLoading ? (
            <div className="flex items-center justify-center gap-2.5 py-10 text-gray-600">
              <Loader2 className="w-5 h-5 animate-spin" />
              <p>Đang tải...</p>
            </div>
          ) : (
            <Comment
              targetId={newsData._id}
              targetType="news"
              currentUser={currentUser}
            />
          )}
        </div>
      </article>

      {/* Scroll to Top Button */}
      <ScrollToTopButton />
    </div>
  );
};

export default NewsDetail;
