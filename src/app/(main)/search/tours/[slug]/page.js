// app/search/tours/[slug]/page.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import SearchBox from "@/components/common/SearchBox";
import CategoryTreeSelect from "@/components/common/CategoryTreeSelect";
import Pagination from "@/components/common/Pagination";
import TourCard from "@/components/common/TourCard";
import TourCardSkeleton from "@/components/common/TourCardSkeleton";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

// Utility functions
const formatVND = (amount) => {
  if (!amount) return "";
  return new Intl.NumberFormat("vi-VN").format(amount);
};

const parseVND = (formattedAmount) => {
  if (!formattedAmount) return "";
  return formattedAmount.replace(/\D/g, "");
};

export default function SearchTour() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();

  const [tours, setTours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("");

  // Form state
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [departPlace, setDepartPlace] = useState("");
  const [filters, setFilters] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [allFilters, setAllFilters] = useState([]);
  const [allVehicles, setAllVehicles] = useState([]);
  const [allDepartPlaces, setAllDepartPlaces] = useState([]);

  // Fetch filter options
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const [filterRes, vehicleRes, departPlaceRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/filter/getAll`),
          fetch(`${API_BASE}/api/v1/vehicles`),
          fetch(`${API_BASE}/api/v1/depart-place/getAll`),
        ]);
        const filterData = await filterRes.json();
        const vehicleData = await vehicleRes.json();
        const departPlaceData = await departPlaceRes.json();

        setAllFilters(filterData || []);
        setAllVehicles(vehicleData || []);
        setAllDepartPlaces(departPlaceData || []);
      } catch (err) {
        console.error("Error fetching options:", err);
      }
    };
    fetchOptions();
  }, []);

  // Fetch category by slug
  useEffect(() => {
    const categorySlug = params.slug;
    if (categorySlug && categorySlug !== "tour-du-lich") {
      fetchCategoryBySlug(categorySlug);
    } else {
      setSelectedCategory(null);
    }
  }, [params.slug]);

  const fetchCategoryBySlug = async (slug) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/v1/tour-category/get-tour-category-by-slug/${slug}`
      );
      const data = await res.json();
      if (data.data) {
        setSelectedCategory(data.data);
      }
    } catch (err) {
      console.error("Error fetching category:", err);
    }
  };

  // ✅ FIX: Sync form state và fetch tours (KHÔNG skip initial load)
  useEffect(() => {
    const syncAndFetch = async () => {
      // 1. Đọc params từ URL
      const q = searchParams.get("q") || "";
      const min = searchParams.get("minPrice") || "";
      const max = searchParams.get("maxPrice") || "";
      const depart = searchParams.get("departPlace") || "";
      const filterList = searchParams.getAll("filters") || [];
      const vehicleList = searchParams.getAll("vehicles") || [];
      const pageNum = parseInt(searchParams.get("page")) || 1;

      // 2. Update form state
      setQuery(q);
      setMinPrice(min);
      setMaxPrice(max);
      setDepartPlace(depart);
      setFilters(filterList);
      setVehicles(vehicleList);

      // 3. ✅ FETCH LUÔN (không skip)
      try {
        setLoading(true);
        const fetchParams = new URLSearchParams();

        fetchParams.set("page", pageNum.toString());
        fetchParams.set("limit", "12");

        if (q) fetchParams.set("query", q);

        const categorySlug = params.slug;
        if (categorySlug && categorySlug !== "tour-du-lich") {
          fetchParams.set("category", categorySlug);
        }

        if (min) fetchParams.set("minPrice", min);
        if (max) fetchParams.set("maxPrice", max);
        if (depart) fetchParams.set("departPlace", depart);
        filterList.forEach((f) => fetchParams.append("filters", f));
        vehicleList.forEach((v) => fetchParams.append("vehicles", v));

        const url = `${API_BASE}/api/v1/tours/search-combined?${fetchParams.toString()}`;
        console.log("🔍 Fetching:", url);

        const res = await fetch(url);

        // ✅ Check response status
        if (!res.ok) {
          console.error(`❌ API Error: ${res.status} ${res.statusText}`);
          setTours([]);
          setTotalPages(1);
          return;
        }

        const data = await res.json();
        setTours(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      } catch (err) {
        console.error("❌ Error fetching tours:", err);
        setTours([]);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    };

    syncAndFetch();
  }, [searchParams, params.slug]);

  // Sort tours
  const sortTours = (tours, sortBy) => {
    if (!sortBy) return tours;
    const sorted = [...tours];
    switch (sortBy) {
      case "name-asc":
        return sorted.sort((a, b) => a.title.localeCompare(b.title));
      case "name-desc":
        return sorted.sort((a, b) => b.title.localeCompare(a.title));
      case "price-asc":
        return sorted.sort((a, b) => (a.prices || 0) - (b.prices || 0));
      case "price-desc":
        return sorted.sort((a, b) => (b.prices || 0) - (a.prices || 0));
      default:
        return sorted;
    }
  };

  // Handle search
  const handleSearch = () => {
    const searchParamsObj = new URLSearchParams();

    if (query) searchParamsObj.set("q", query);
    if (minPrice) searchParamsObj.set("minPrice", minPrice);
    if (maxPrice) searchParamsObj.set("maxPrice", maxPrice);
    if (departPlace) searchParamsObj.set("departPlace", departPlace);
    filters.forEach((f) => searchParamsObj.append("filters", f));
    vehicles.forEach((v) => searchParamsObj.append("vehicles", v));
    searchParamsObj.set("page", "1");

    const targetSlug = selectedCategory?.slug || params.slug || "tour-du-lich";
    router.push(`/search/tours/${targetSlug}?${searchParamsObj.toString()}`);
  };

  const toggleFilter = (slug) => {
    setFilters((prev) =>
      prev.includes(slug) ? prev.filter((f) => f !== slug) : [...prev, slug]
    );
  };

  const toggleVehicle = (slug) => {
    setVehicles((prev) =>
      prev.includes(slug) ? prev.filter((v) => v !== slug) : [...prev, slug]
    );
  };

  const handlePageChange = (newPage) => {
    const searchParamsObj = new URLSearchParams(searchParams.toString());
    searchParamsObj.set("page", newPage.toString());

    const targetSlug = selectedCategory?.slug || params.slug || "tour-du-lich";
    router.push(`/search/tours/${targetSlug}?${searchParamsObj.toString()}`);

    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const currentPage = parseInt(searchParams.get("page")) || 1;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar */}
        <aside className="lg:w-80 flex-shrink-0">
          <div className="bg-white rounded-xl shadow-md p-6 lg:sticky lg:top-24">
            <h3 className="text-xl font-semibold mb-6 pb-3 border-b-2 border-primary text-text">
              Tìm kiếm & Lọc
            </h3>

            {/* Search */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-text mb-3 uppercase tracking-wide">
                Tìm kiếm tour
              </h4>
              <SearchBox initialValue={query} onSearch={setQuery} />
            </div>

            {/* Category */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-text mb-3 uppercase tracking-wide">
                Loại tour
              </h4>
              <CategoryTreeSelect
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
            </div>

            {/* Price Range */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-text mb-3 uppercase tracking-wide">
                Khoảng giá
              </h4>
              <div className="space-y-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Giá tối thiểu"
                    value={minPrice ? formatVND(minPrice) : ""}
                    onChange={(e) => setMinPrice(parseVND(e.target.value))}
                    className="w-full px-4 py-3 pr-8 border border-border rounded-lg bg-bg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary font-medium">
                    đ
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Giá tối đa"
                    value={maxPrice ? formatVND(maxPrice) : ""}
                    onChange={(e) => setMaxPrice(parseVND(e.target.value))}
                    className="w-full px-4 py-3 pr-8 border border-border rounded-lg bg-bg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-primary font-medium">
                    đ
                  </span>
                </div>
              </div>
            </div>

            {/* Depart Place */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-text mb-3 uppercase tracking-wide">
                Điểm khởi hành
              </h4>
              <select
                value={departPlace}
                onChange={(e) => setDepartPlace(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg bg-bg text-text focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              >
                <option value="">Chọn điểm khởi hành</option>
                {allDepartPlaces.map((place) => (
                  <option key={place._id} value={place.slug}>
                    {place.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filters */}
            {allFilters.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-text mb-3 uppercase tracking-wide">
                  Bộ lọc
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 sidebar-scroll">
                  {allFilters.map((f) => (
                    <label
                      key={f._id}
                      className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-card-bg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={filters.includes(f.slug)}
                        onChange={() => toggleFilter(f.slug)}
                        className="w-4 h-4 text-primary rounded border-border focus:ring-2 focus:ring-primary/20"
                      />
                      <span className="text-sm text-text">
                        {f.label || f.name}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Vehicles */}
            {allVehicles.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-text mb-3 uppercase tracking-wide">
                  Phương tiện
                </h4>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 sidebar-scroll">
                  {allVehicles.map((v) => (
                    <label
                      key={v._id}
                      className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-card-bg transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={vehicles.includes(v.slug)}
                        onChange={() => toggleVehicle(v.slug)}
                        className="w-4 h-4 text-primary rounded border-border focus:ring-2 focus:ring-primary/20"
                      />
                      <span className="text-sm text-text">{v.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={handleSearch}
              className="w-full py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-hover active:scale-[0.98] transition-all shadow-md hover:shadow-lg"
            >
              🔍 Tìm kiếm
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          {/* Sort Controls */}
          <div className="bg-white rounded-xl shadow-md p-4 mb-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <span className="font-medium text-text whitespace-nowrap">
              Sắp xếp theo:
            </span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="flex-1 w-full sm:w-auto px-4 py-2 border border-border rounded-lg bg-bg focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            >
              <option value="">Mặc định</option>
              <option value="name-asc">Tên A-Z</option>
              <option value="name-desc">Tên Z-A</option>
              <option value="price-asc">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
            </select>
          </div>

          {/* Tour Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
              Array.from({ length: 6 }).map((_, idx) => (
                <TourCardSkeleton key={idx} />
              ))
            ) : tours.length > 0 ? (
              sortTours(tours, sortBy).map((tour) => (
                <TourCard key={tour._id} tour={tour} />
              ))
            ) : (
              <div className="col-span-full text-center py-20">
                <p className="text-text-muted text-lg">
                  Không tìm thấy tour nào phù hợp
                </p>
              </div>
            )}
          </div>

          {/* Pagination */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </main>
      </div>
    </div>
  );
}
