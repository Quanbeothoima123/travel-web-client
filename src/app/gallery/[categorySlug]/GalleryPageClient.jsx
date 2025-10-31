"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import GalleryItemCard from "@/components/common/GalleryItemCard";
import GalleryCategoryTreeSelect from "@/components/common/GalleryCategoryTreeSelect";
import Pagination from "@/components/common/Pagination";
import { Search } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

// Skeleton Loading Component
function GalleryCardSkeleton() {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-md border border-gray-200 animate-pulse">
      <div className="w-full h-60 bg-gray-200"></div>
      <div className="p-5">
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
        <div className="flex gap-4 pt-4 border-t border-gray-200">
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
          <div className="h-4 bg-gray-200 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

export default function GalleryPageClient({ categorySlug }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [galleries, setGalleries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentCategory, setCurrentCategory] = useState(null);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 12,
  });

  const [filters, setFilters] = useState({
    keyword: searchParams.get("keyword") || "",
    sortBy: searchParams.get("sortBy") || "createdAt",
    sortOrder: searchParams.get("sortOrder") || "desc",
  });

  const [tempFilters, setTempFilters] = useState({
    ...filters,
    galleryCategory: null,
  });

  const isFetching = useRef(false);

  // Fetch galleries
  const fetchGalleries = useCallback(async () => {
    if (isFetching.current) return;

    try {
      isFetching.current = true;
      setLoading(true);

      const params = new URLSearchParams({
        page: pagination.currentPage.toString(),
        limit: pagination.limit.toString(),
        keyword: filters.keyword,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      // Choose API endpoint
      let url;
      if (categorySlug && categorySlug !== "all") {
        url = `${API_BASE}/api/v1/gallery/by-category/${categorySlug}?${params}`;
      } else {
        url = `${API_BASE}/api/v1/gallery/all?${params}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (data.success) {
        setGalleries(data.data || []);
        setPagination(
          data.pagination || {
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            limit: 12,
          }
        );

        if (data.category) {
          setCurrentCategory(data.category);
          setTempFilters((prev) => ({
            ...prev,
            galleryCategory: data.category,
          }));
        } else {
          setCurrentCategory(null);
        }
      }
    } catch (error) {
      console.error("Error fetching galleries:", error);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [categorySlug, filters, pagination.currentPage, pagination.limit]);

  useEffect(() => {
    fetchGalleries();
  }, [fetchGalleries]);

  const handleApplyFilters = () => {
    // Build query params
    const params = new URLSearchParams();
    if (tempFilters.keyword) params.set("keyword", tempFilters.keyword);
    if (tempFilters.sortBy !== "createdAt")
      params.set("sortBy", tempFilters.sortBy);
    if (tempFilters.sortOrder !== "desc")
      params.set("sortOrder", tempFilters.sortOrder);

    const queryString = params.toString();

    // Navigate to new URL
    if (tempFilters.galleryCategory?.slug) {
      router.push(
        `/gallery/${tempFilters.galleryCategory.slug}${
          queryString ? `?${queryString}` : ""
        }`
      );
    } else {
      router.push(`/gallery/all${queryString ? `?${queryString}` : ""}`);
    }

    setFilters({
      keyword: tempFilters.keyword,
      sortBy: tempFilters.sortBy,
      sortOrder: tempFilters.sortOrder,
    });

    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleResetFilters = () => {
    const defaultFilters = {
      keyword: "",
      galleryCategory: null,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setTempFilters(defaultFilters);
    setFilters({
      keyword: "",
      sortBy: "createdAt",
      sortOrder: "desc",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    router.push("/gallery/all");
  };

  const handlePageChange = (page) => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 max-md:text-2xl">
              {currentCategory?.title || "Tất Cả Bộ Sưu Tập"}
            </h1>
            <p className="mt-1 text-sm text-gray-600">
              Khám phá {pagination.totalItems} bộ sưu tập tuyệt đẹp
            </p>
          </div>
        </div>
      </div>

      {/* Filters Panel - Always Visible */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Bộ lọc tìm kiếm
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Search */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tìm kiếm
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm theo tên..."
                  value={tempFilters.keyword}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      keyword: e.target.value,
                    }))
                  }
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleApplyFilters();
                  }}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm transition-all focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            {/* Category */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục
              </label>
              <GalleryCategoryTreeSelect
                value={tempFilters.galleryCategory}
                onChange={(val) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    galleryCategory: val,
                  }))
                }
                placeholder="Chọn danh mục..."
              />
            </div>

            {/* Sort By */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sắp xếp theo
              </label>
              <select
                value={tempFilters.sortBy}
                onChange={(e) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    sortBy: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer transition-all focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="createdAt">Mới nhất</option>
                <option value="views">Xem nhiều nhất</option>
                <option value="likes">Yêu thích nhất</option>
                <option value="shares">Chia sẻ nhiều nhất</option>
                <option value="title">Tên A-Z</option>
              </select>
            </div>

            {/* Sort Order */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Thứ tự
              </label>
              <select
                value={tempFilters.sortOrder}
                onChange={(e) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    sortOrder: e.target.value,
                  }))
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm bg-white cursor-pointer transition-all focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-100"
              >
                <option value="desc">Giảm dần</option>
                <option value="asc">Tăng dần</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3 max-md:flex-col">
            <button
              onClick={handleApplyFilters}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium transition-colors hover:bg-indigo-700 max-md:w-full"
            >
              Áp dụng
            </button>
            <button
              onClick={handleResetFilters}
              className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors hover:bg-gray-200 max-md:w-full"
            >
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-8">
        <div className="max-w-7xl mx-auto px-4">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(8)].map((_, index) => (
                <GalleryCardSkeleton key={index} />
              ))}
            </div>
          ) : galleries.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-6xl mb-4">🖼️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Không tìm thấy bộ sưu tập nào
              </h3>
              <p className="text-gray-600 text-sm">
                Thử điều chỉnh bộ lọc để xem thêm kết quả
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                {galleries.map((gallery) => (
                  <GalleryItemCard key={gallery._id} item={gallery} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <Pagination
                  currentPage={pagination.currentPage}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
