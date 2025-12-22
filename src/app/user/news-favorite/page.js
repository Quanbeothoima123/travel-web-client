"use client";

import React, { useEffect, useState, use } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Search, Heart, Trash2, Calendar, User, Filter, X } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3000";

// Skeleton Loading Component
function NewsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 animate-pulse">
      <div className="w-full h-48 bg-gray-200"></div>
      <div className="p-4">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
        <div className="flex gap-2">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

// Favorite News Card Component
function FavoriteNewsCard({ data, onRemoveFavorite }) {
  const [removing, setRemoving] = useState(false);

  const handleRemove = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (removing) return;
    if (!confirm("Bạn có chắc muốn bỏ thích bài viết này?")) return;

    setRemoving(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/news/favorites/${data._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        onRemoveFavorite(data._id);
      } else {
        alert("Không thể bỏ thích bài viết");
      }
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Đã có lỗi xảy ra");
    } finally {
      setRemoving(false);
    }
  };

  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 relative">
      <Link
        href={`/news/detail/${data.slug}`}
        className="block relative h-48 overflow-hidden cursor-pointer"
      >
        <img
          src={data.thumbnail || "/placeholder-news.jpg"}
          alt={data.title}
          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 left-3 bg-red-500 text-white px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
          <Heart size={12} fill="white" />
          <span className="text-xs font-semibold">Đã thích</span>
        </div>
        <button
          onClick={handleRemove}
          disabled={removing}
          className="absolute top-3 right-3 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors disabled:opacity-50 shadow-lg z-10"
          title="Bỏ thích"
        >
          {removing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <Trash2 size={16} />
          )}
        </button>
      </Link>

      <div className="p-4">
        <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-3">
          {data.type === "news" && "Tin tức"}
          {data.type === "guide" && "Cẩm nang"}
          {data.type === "review" && "Đánh giá"}
          {data.type === "event" && "Sự kiện"}
          {data.type === "promotion" && "Khuyến mãi"}
        </span>

        <Link href={`/news/detail/${data.slug}`}>
          <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600 cursor-pointer transition-colors">
            {data.title}
          </h3>
        </Link>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {data.excerpt || ""}
        </p>

        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <Heart size={14} />
            {data.likes || 0}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={14} />
            {new Date(data.publishedAt).toLocaleDateString("vi-VN")}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function FavoriteNewsClient({ searchParams }) {
  const router = useRouter();
  const pathname = usePathname();

  // Unwrap searchParams Promise
  const resolvedParams = use(searchParams);

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedAuthorType, setSelectedAuthorType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState("createdAt-desc");

  const [categories, setCategories] = useState([]);

  const newsTypes = [
    { value: "", label: "Tất cả loại" },
    { value: "news", label: "Tin tức" },
    { value: "guide", label: "Cẩm nang" },
    { value: "review", label: "Đánh giá" },
    { value: "event", label: "Sự kiện" },
    { value: "promotion", label: "Khuyến mãi" },
  ];

  const languageOptions = [
    { value: "", label: "Tất cả ngôn ngữ" },
    { value: "vi", label: "Tiếng Việt" },
    { value: "en", label: "Tiếng Anh" },
  ];

  const authorTypeOptions = [
    { value: "", label: "Tất cả tác giả" },
    { value: "admin", label: "Admin" },
    { value: "user", label: "Người dùng" },
  ];

  const sortOptions = [
    { value: "createdAt-desc", label: "Thích gần đây nhất" },
    { value: "createdAt-asc", label: "Thích lâu nhất" },
    { value: "publishedAt-desc", label: "Xuất bản mới nhất" },
    { value: "publishedAt-asc", label: "Xuất bản cũ nhất" },
    { value: "title-asc", label: "Tiêu đề A-Z" },
    { value: "title-desc", label: "Tiêu đề Z-A" },
    { value: "views-desc", label: "Xem nhiều nhất" },
    { value: "likes-desc", label: "Yêu thích nhất" },
  ];

  // Load categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/v1/news-category/getAll`);
        const data = await res.json();
        setCategories(data.data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Sync state with URL params
  useEffect(() => {
    if (!resolvedParams) return;

    const q = resolvedParams.q || "";
    const category = resolvedParams.newsCategoryId || "";
    const type = resolvedParams.type || "";
    const language = resolvedParams.language || "";
    const authorType = resolvedParams.authorType || "";
    const dateF = resolvedParams.dateFrom || "";
    const dateT = resolvedParams.dateTo || "";
    const sort = resolvedParams.sort || "createdAt-desc";
    const currentPage = parseInt(resolvedParams.page) || 1;

    setQuery(q);
    setSelectedCategory(category);
    setSelectedType(type);
    setSelectedLanguage(language);
    setSelectedAuthorType(authorType);
    setDateFrom(dateF);
    setDateTo(dateT);
    setSortBy(sort);
    setPage(currentPage);
  }, [resolvedParams]);

  // Fetch favorite news
  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (selectedCategory) params.set("newsCategoryId", selectedCategory);
        if (selectedType) params.set("type", selectedType);
        if (selectedLanguage) params.set("language", selectedLanguage);
        if (selectedAuthorType) params.set("authorType", selectedAuthorType);
        if (dateFrom) params.set("dateFrom", dateFrom);
        if (dateTo) params.set("dateTo", dateTo);
        if (sortBy) params.set("sort", sortBy);
        params.set("page", page);

        const res = await fetch(
          `${API_BASE}/api/v1/news/favorites?${params.toString()}`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Failed to fetch favorites");
        }

        const data = await res.json();
        setNews(data.data || []);
        setTotalPages(data.totalPages || 1);
        setTotalResults(data.totalResults || 0);
      } catch (err) {
        console.error("Error fetching favorites:", err);
        setNews([]);
        setTotalResults(0);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [
    page,
    query,
    selectedCategory,
    selectedType,
    selectedLanguage,
    selectedAuthorType,
    dateFrom,
    dateTo,
    sortBy,
  ]);

  // Handle search
  const handleSearch = () => {
    updateURL();
  };

  // Update URL with filters
  const updateURL = (newPage = 1) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedCategory) params.set("newsCategoryId", selectedCategory);
    if (selectedType) params.set("type", selectedType);
    if (selectedLanguage) params.set("language", selectedLanguage);
    if (selectedAuthorType) params.set("authorType", selectedAuthorType);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    if (sortBy) params.set("sort", sortBy);
    params.set("page", newPage);

    router.push(`${pathname}?${params.toString()}`);
  };

  // Clear filters
  const clearFilters = () => {
    setQuery("");
    setSelectedCategory("");
    setSelectedType("");
    setSelectedLanguage("");
    setSelectedAuthorType("");
    setDateFrom("");
    setDateTo("");
    setSortBy("createdAt-desc");
    setPage(1);
    router.push(pathname);
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    updateURL(newPage);
  };

  // Handle remove favorite
  const handleRemoveFavorite = (newsId) => {
    setNews((prev) => prev.filter((item) => item._id !== newsId));
    setTotalResults((prev) => prev - 1);
  };

  return (
    <div className="max-w-[1200px] mx-auto p-5 max-sm:p-4">
      {/* Page Header */}
      <div className="text-center mb-10 py-10 px-5 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Heart size={40} fill="white" color="white" />
          <h1 className="text-white text-[32px] font-bold m-0 max-md:text-2xl">
            Bài viết đã yêu thích
          </h1>
        </div>
        <p className="text-white text-base m-0 opacity-90 max-md:text-sm">
          Quản lý danh sách các bài viết du lịch bạn đã lưu
        </p>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white rounded-xl p-6 mb-8 shadow-md border border-gray-200 max-md:p-5">
        <div className="flex flex-col gap-5">
          {/* Main Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch();
                }
              }}
              placeholder="Tìm kiếm bài viết đã thích..."
              className="w-full py-3 pl-11 pr-4 border border-gray-300 rounded-lg text-sm bg-gray-50 text-gray-900 outline-none transition-all focus:border-blue-500 focus:bg-white focus:shadow-lg"
            />
          </div>

          {/* Filter Row 1 */}
          <div className="grid grid-cols-4 gap-4 max-lg:grid-cols-2 max-md:grid-cols-1">
            {/* Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                <Filter size={14} /> Danh mục
              </label>
              <select
                className="py-2.5 px-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 cursor-pointer transition-all outline-none focus:border-blue-500 focus:shadow-lg"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">
                Loại bài viết
              </label>
              <select
                className="py-2.5 px-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 cursor-pointer transition-all outline-none focus:border-blue-500 focus:shadow-lg"
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
              >
                {newsTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Language */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">
                Ngôn ngữ
              </label>
              <select
                className="py-2.5 px-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 cursor-pointer transition-all outline-none focus:border-blue-500 focus:shadow-lg"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {languageOptions.map((lang) => (
                  <option key={lang.value} value={lang.value}>
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Author Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                <User size={14} /> Tác giả
              </label>
              <select
                className="py-2.5 px-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 cursor-pointer transition-all outline-none focus:border-blue-500 focus:shadow-lg"
                value={selectedAuthorType}
                onChange={(e) => setSelectedAuthorType(e.target.value)}
              >
                {authorTypeOptions.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Row 2 */}
          <div className="grid grid-cols-4 gap-4 items-end max-lg:grid-cols-2 max-md:grid-cols-1">
            {/* Date From */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide flex items-center gap-1">
                <Calendar size={14} /> Từ ngày
              </label>
              <input
                type="date"
                className="py-2.5 px-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 cursor-pointer transition-all outline-none focus:border-blue-500 focus:shadow-lg"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>

            {/* Date To */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">
                Đến ngày
              </label>
              <input
                type="date"
                className="py-2.5 px-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 cursor-pointer transition-all outline-none focus:border-blue-500 focus:shadow-lg"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700 uppercase tracking-wide">
                Sắp xếp
              </label>
              <select
                className="py-2.5 px-3 border border-gray-300 rounded-lg text-sm bg-white text-gray-900 cursor-pointer transition-all outline-none focus:border-blue-500 focus:shadow-lg"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 items-center max-md:col-span-full max-md:justify-center max-md:mt-2">
              <button
                type="button"
                onClick={handleSearch}
                className="py-2.5 px-4 bg-blue-600 text-white rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-blue-700 hover:-translate-y-0.5 hover:shadow-lg whitespace-nowrap max-md:flex-1 flex items-center justify-center gap-2"
              >
                <Search size={16} /> Tìm kiếm
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="py-2.5 px-4 bg-gray-600 text-white rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-gray-700 hover:-translate-y-0.5 whitespace-nowrap max-md:flex-1 flex items-center justify-center gap-2"
              >
                <X size={16} /> Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center mb-5 py-3 px-4 bg-white rounded-lg border border-gray-200">
        <span className="font-medium text-gray-900 flex items-center gap-2">
          <Heart size={18} className="text-red-500" fill="currentColor" />
          {loading ? "Đang tải..." : `${totalResults} bài viết đã thích`}
        </span>
      </div>

      {/* News List */}
      <div className="mb-10">
        {loading ? (
          <div className="w-full grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 items-start max-xl:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] max-xl:gap-5 max-lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] max-lg:gap-[18px] max-md:grid-cols-1 max-md:gap-4">
            {[...Array(6)].map((_, index) => (
              <NewsCardSkeleton key={index} />
            ))}
          </div>
        ) : news.length > 0 ? (
          <div className="w-full grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6 items-start max-xl:grid-cols-[repeat(auto-fill,minmax(320px,1fr))] max-xl:gap-5 max-lg:grid-cols-[repeat(auto-fill,minmax(280px,1fr))] max-lg:gap-[18px] max-md:grid-cols-1 max-md:gap-4">
            {news.map((newsItem) => (
              <FavoriteNewsCard
                key={newsItem._id}
                data={newsItem}
                onRemoveFavorite={handleRemoveFavorite}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-[60px] px-5 bg-white rounded-lg border border-gray-200">
            <Heart size={64} className="mx-auto mb-4 text-gray-300" />
            <h3 className="m-0 mb-3 text-gray-800 text-xl font-bold">
              Chưa có bài viết yêu thích
            </h3>
            <p className="m-0 text-gray-600 text-base mb-5">
              Hãy khám phá và lưu lại những bài viết bạn thích nhé!
            </p>
            <Link
              href="/news/all"
              className="inline-block py-3 px-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Khám phá bài viết
            </Link>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 flex-wrap">
          <button
            onClick={() => handlePageChange(page - 1)}
            disabled={page === 1}
            className="py-2 px-4 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Trước
          </button>

          {[...Array(totalPages)].map((_, i) => {
            const pageNum = i + 1;
            if (
              pageNum === 1 ||
              pageNum === totalPages ||
              (pageNum >= page - 1 && pageNum <= page + 1)
            ) {
              return (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`py-2 px-4 rounded-lg transition-colors ${
                    page === pageNum
                      ? "bg-blue-600 text-white"
                      : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {pageNum}
                </button>
              );
            } else if (pageNum === page - 2 || pageNum === page + 2) {
              return (
                <span key={pageNum} className="py-2 px-2">
                  ...
                </span>
              );
            }
            return null;
          })}

          <button
            onClick={() => handlePageChange(page + 1)}
            disabled={page === totalPages}
            className="py-2 px-4 border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Sau
          </button>
        </div>
      )}
    </div>
  );
}
