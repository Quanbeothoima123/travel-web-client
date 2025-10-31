"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Search } from "lucide-react";
import NewsCategoryTreeSelect from "@/components/common/NewsCategoryTreeSelect";
import NewsCard from "@/components/common/NewsCard";
import Pagination from "@/components/common/Pagination";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

// Skeleton Loading Component
function NewsCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md border border-[--color-border] animate-pulse">
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

export default function NewsPageClient({ newsCategorySlug, searchParams }) {
  const router = useRouter();
  const pathname = usePathname();

  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [query, setQuery] = useState("");
  const [selectedNewsCategory, setSelectedNewsCategory] = useState(null);
  const [selectedRelatedTour, setSelectedRelatedTour] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [eventDateFrom, setEventDateFrom] = useState("");
  const [eventDateTo, setEventDateTo] = useState("");
  const [sortBy, setSortBy] = useState("");

  const [allRelatedTours, setAllRelatedTours] = useState([]);

  // News types
  const newsTypes = [
    { value: "", label: "Tất cả loại" },
    { value: "news", label: "Tin tức" },
    { value: "guide", label: "Cẩm nang" },
    { value: "review", label: "Đánh giá" },
    { value: "event", label: "Sự kiện" },
    { value: "promotion", label: "Khuyến mãi" },
  ];

  // Language options
  const languageOptions = [
    { value: "", label: "Tất cả ngôn ngữ" },
    { value: "vi", label: "Tiếng Việt" },
    { value: "en", label: "Tiếng Anh" },
  ];

  // Sort options
  const sortOptions = [
    { value: "", label: "Mặc định" },
    { value: "publishedAt-desc", label: "Mới nhất" },
    { value: "publishedAt-asc", label: "Cũ nhất" },
    { value: "title-asc", label: "Tiêu đề A-Z" },
    { value: "title-desc", label: "Tiêu đề Z-A" },
    { value: "views-desc", label: "Xem nhiều nhất" },
    { value: "likes-desc", label: "Yêu thích nhất" },
    { value: "eventDate-desc", label: "Sự kiện gần nhất" },
  ];

  // Load related tours
  useEffect(() => {
    const fetchRelatedTours = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/tours/get-id-title?limit=100`
        );
        const data = await res.json();
        setAllRelatedTours(data.tours || []);
      } catch (err) {
        console.error("Error fetching related tours:", err);
      }
    };
    fetchRelatedTours();
  }, []);

  // Fetch news category by slug
  useEffect(() => {
    const fetchNewsCategory = async () => {
      if (!newsCategorySlug || newsCategorySlug === "all") return;
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/news-category/get-news-category-by-slug/${newsCategorySlug}`
        );
        const data = await res.json();
        setSelectedNewsCategory(data.data);
      } catch (err) {
        console.error("Error fetching news category:", err);
      }
    };
    fetchNewsCategory();
  }, [newsCategorySlug]);

  // Sync state with URL params
  useEffect(() => {
    const q = searchParams.q || "";
    const type = searchParams.type || "";
    const language = searchParams.language || "";
    const eventFrom = searchParams.eventDateFrom || "";
    const eventTo = searchParams.eventDateTo || "";
    const relatedTour = searchParams.relatedTour || "";
    const sort = searchParams.sort || "";
    const currentPage = parseInt(searchParams.page) || 1;

    setQuery(q);
    setSelectedType(type);
    setSelectedLanguage(language);
    setEventDateFrom(eventFrom);
    setEventDateTo(eventTo);
    setSelectedRelatedTour(relatedTour);
    setSortBy(sort);
    setPage(currentPage);
  }, [searchParams]);

  // Fetch news
  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (selectedType) params.set("type", selectedType);
        if (selectedLanguage) params.set("language", selectedLanguage);
        if (eventDateFrom) params.set("eventDateFrom", eventDateFrom);
        if (eventDateTo) params.set("eventDateTo", eventDateTo);
        if (selectedRelatedTour) params.set("relatedTour", selectedRelatedTour);
        if (sortBy) params.set("sort", sortBy);
        params.set("page", page);

        const categorySlug = newsCategorySlug || "all";
        const url = `${API_BASE}/api/v1/news/advanced-search/${categorySlug}?${params.toString()}`;

        const res = await fetch(url);
        const data = await res.json();

        setNews(data.data || []);
        setTotalPages(data.totalPages || 1);
      } catch (err) {
        console.error("Error fetching news:", err);
        setNews([]);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [
    newsCategorySlug,
    page,
    query,
    selectedType,
    selectedLanguage,
    eventDateFrom,
    eventDateTo,
    selectedRelatedTour,
    sortBy,
  ]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();

    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedType) params.set("type", selectedType);
    if (selectedLanguage) params.set("language", selectedLanguage);
    if (eventDateFrom) params.set("eventDateFrom", eventDateFrom);
    if (eventDateTo) params.set("eventDateTo", eventDateTo);
    if (selectedRelatedTour) params.set("relatedTour", selectedRelatedTour);
    if (sortBy) params.set("sort", sortBy);
    params.set("page", "1");

    const targetCategorySlug =
      selectedNewsCategory?.slug || newsCategorySlug || "all";
    router.push(`/news/${targetCategorySlug}?${params.toString()}`);
  };

  // Clear filters
  const clearFilters = () => {
    setQuery("");
    setSelectedNewsCategory(null);
    setSelectedType("");
    setSelectedLanguage("");
    setEventDateFrom("");
    setEventDateTo("");
    setSelectedRelatedTour("");
    setSortBy("");
    setPage(1);
    router.push("/news/all");
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedType) params.set("type", selectedType);
    if (selectedLanguage) params.set("language", selectedLanguage);
    if (eventDateFrom) params.set("eventDateFrom", eventDateFrom);
    if (eventDateTo) params.set("eventDateTo", eventDateTo);
    if (selectedRelatedTour) params.set("relatedTour", selectedRelatedTour);
    if (sortBy) params.set("sort", sortBy);
    params.set("page", newPage);

    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="max-w-[1200px] mx-auto p-5 max-sm:p-4">
      {/* Page Header */}
      <div className="text-center mb-10 py-10 px-5 bg-primary rounded-2xl">
        <h1 className="text-white text-[32px] font-bold m-0 mb-3 [text-shadow:0_2px_4px_rgba(0,0,0,0.1)] max-md:text-2xl">
          Tin tức & Bài viết
        </h1>
        <p className="text-white text-base m-0 opacity-90 max-md:text-sm">
          Cập nhật những thông tin, cẩm nang và bài viết mới nhất
        </p>
      </div>

      {/* Search & Filter Section */}
      <div className="bg-white rounded-xl p-6 mb-8 shadow-md border border-[--color-border] max-md:p-5">
        <div className="flex flex-col gap-5">
          {/* Main Search */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[--color-text-muted] w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSearch(e);
                }
              }}
              placeholder="Tìm kiếm tin tức, bài viết..."
              className="w-full py-3 pl-11 pr-4 border border-[--color-border] rounded-lg text-sm bg-[--color-bg] text-[--color-text] outline-none transition-all focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,0,128,0.1)]"
            />
          </div>

          {/* Filter Row 1 */}
          <div className="grid grid-cols-4 gap-4 items-end max-lg:grid-cols-2 max-md:grid-cols-1">
            {/* News Category */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[--color-text] uppercase tracking-wide">
                Danh mục tin tức
              </label>
              <NewsCategoryTreeSelect
                value={selectedNewsCategory}
                onChange={(node) => setSelectedNewsCategory(node)}
                fetchUrl={`${API_BASE}/api/v1/news-category/getAll?tree=true`}
                placeholder="Chọn danh mục tin tức..."
                noDataText="Không có danh mục"
              />
            </div>

            {/* Related Tour */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[--color-text] uppercase tracking-wide">
                Tour liên quan
              </label>
              <select
                className="py-2.5 px-3 border border-[--color-border] rounded-lg text-sm bg-[--color-card-bg] text-[--color-text] cursor-pointer transition-all outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_2px_rgba(0,0,128,0.1)]"
                value={selectedRelatedTour}
                onChange={(e) => setSelectedRelatedTour(e.target.value)}
              >
                <option value="">Tất cả tour</option>
                {allRelatedTours.map((tour) => (
                  <option key={tour._id} value={tour._id}>
                    {tour.title}
                  </option>
                ))}
              </select>
            </div>

            {/* News Type */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[--color-text] uppercase tracking-wide">
                Loại bài viết
              </label>
              <select
                className="py-2.5 px-3 border border-[--color-border] rounded-lg text-sm bg-[--color-card-bg] text-[--color-text] cursor-pointer transition-all outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_2px_rgba(0,0,128,0.1)]"
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
              <label className="text-[13px] font-semibold text-[--color-text] uppercase tracking-wide">
                Ngôn ngữ
              </label>
              <select
                className="py-2.5 px-3 border border-[--color-border] rounded-lg text-sm bg-[--color-card-bg] text-[--color-text] cursor-pointer transition-all outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_2px_rgba(0,0,128,0.1)]"
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
          </div>

          {/* Filter Row 2 */}
          <div className="grid grid-cols-4 gap-4 items-end max-lg:grid-cols-2 max-md:grid-cols-1">
            {/* Event Date From */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[--color-text] uppercase tracking-wide">
                Sự kiện từ ngày
              </label>
              <input
                type="date"
                className="py-2.5 px-3 border border-[--color-border] rounded-lg text-sm bg-[--color-card-bg] text-[--color-text] cursor-pointer transition-all outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_2px_rgba(0,0,128,0.1)]"
                value={eventDateFrom}
                onChange={(e) => setEventDateFrom(e.target.value)}
              />
            </div>

            {/* Event Date To */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[--color-text] uppercase tracking-wide">
                Đến ngày
              </label>
              <input
                type="date"
                className="py-2.5 px-3 border border-[--color-border] rounded-lg text-sm bg-[--color-card-bg] text-[--color-text] cursor-pointer transition-all outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_2px_rgba(0,0,128,0.1)]"
                value={eventDateTo}
                onChange={(e) => setEventDateTo(e.target.value)}
              />
            </div>

            {/* Sort */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-[--color-text] uppercase tracking-wide">
                Sắp xếp
              </label>
              <select
                className="py-2.5 px-3 border border-[--color-border] rounded-lg text-sm bg-[--color-card-bg] text-[--color-text] cursor-pointer transition-all outline-none focus:border-primary focus:bg-white focus:shadow-[0_0_0_2px_rgba(0,0,128,0.1)]"
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
                className="py-2.5 px-4 bg-primary text-white rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-[--color-primary-hover] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,128,0.3)] whitespace-nowrap max-md:flex-1"
              >
                Tìm kiếm
              </button>
              <button
                type="button"
                onClick={clearFilters}
                className="py-2.5 px-4 bg-gray-600 text-white rounded-lg text-sm font-medium cursor-pointer transition-all hover:bg-gray-700 hover:-translate-y-0.5 whitespace-nowrap max-md:flex-1"
              >
                Xóa bộ lọc
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results Info */}
      <div className="flex justify-between items-center mb-5 py-3 px-4 bg-white rounded-lg border border-[--color-border]">
        <span className="font-medium text-[--color-text]">
          {loading ? "Đang tải..." : `${news.length} kết quả`}
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
            {news.map((newsItem, index) => (
              <NewsCard
                key={newsItem._id}
                data={newsItem}
                thumbnailPosition={index % 2 === 0 ? "top" : "bottom"}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-[60px] px-5 bg-white rounded-lg border border-[--color-border]">
            <h3 className="m-0 mb-3 text-[--color-text] text-xl">
              Không tìm thấy tin tức nào
            </h3>
            <p className="m-0 text-[--color-text-muted] text-base">
              Hãy thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
