"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Loader2, AlertCircle } from "lucide-react";
import InvoiceSearchFilterUser from "@/components/common/InvoiceSearchFilterUser";
import InvoiceTableUser from "@/components/common/InvoiceTableUser";
import Pagination from "@/components/common/Pagination";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export default function HistoryTourOrder() {
  const [filters, setFilters] = useState({
    search: "",
    searchTour: "",
    categoryId: null,
    tourType: null,
    departPlaceId: null,
    status: null,
    typeOfPayment: null,
    minPrice: "",
    maxPrice: "",
    startDate: "",
    endDate: "",
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const [invoiceData, setInvoiceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const buildQueryString = useCallback((filterParams) => {
    const params = new URLSearchParams();
    Object.entries(filterParams).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== "") {
        params.append(key, value);
      }
    });
    return params.toString();
  }, []);

  const fetchInvoices = useCallback(
    async (filterParams = filters) => {
      try {
        setLoading(true);
        setError(null);
        const queryString = buildQueryString(filterParams);
        const url = `${API_BASE}/api/v1/invoice/get-all-invoice${
          queryString ? `?${queryString}` : ""
        }`;

        const response = await fetch(url, {
          method: "GET",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
        });

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();

        if (data.success) {
          setInvoiceData(data.data);
        } else {
          throw new Error(data.message || "Failed to fetch invoices");
        }
      } catch (err) {
        setError(err.message || "Có lỗi xảy ra khi tải dữ liệu");
        setInvoiceData(null);
      } finally {
        setLoading(false);
      }
    },
    [buildQueryString]
  );

  useEffect(() => {
    fetchInvoices(filters);
  }, []);

  const handleFiltersChange = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters, page: 1 }));
  }, []);

  const handleSearch = useCallback(() => {
    fetchInvoices(filters);
  }, [filters, fetchInvoices]);

  const handleResetFilters = useCallback(() => {
    const resetFilters = {
      search: "",
      searchTour: "",
      categoryId: null,
      tourType: null,
      departPlaceId: null,
      status: null,
      typeOfPayment: null,
      minPrice: "",
      maxPrice: "",
      startDate: "",
      endDate: "",
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    };
    setFilters(resetFilters);
    fetchInvoices(resetFilters);
  }, [fetchInvoices]);

  const handlePageChange = useCallback(
    (newPage) => {
      const newFilters = { ...filters, page: newPage };
      setFilters(newFilters);
      fetchInvoices(newFilters);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [filters, fetchInvoices]
  );

  const handleSortChange = useCallback(
    (sortBy, sortOrder) => {
      const newFilters = { ...filters, sortBy, sortOrder, page: 1 };
      setFilters(newFilters);
      fetchInvoices(newFilters);
    },
    [filters, fetchInvoices]
  );

  const handleCancelTour = (invoiceId) => {
    console.log("Cancel tour:", invoiceId);
    // TODO: Implement cancel tour logic
  };

  const handleViewDetails = (invoiceId) => {
    console.log("View details:", invoiceId);
    // TODO: Implement view details logic
  };

  const handleContact = (invoiceId) => {
    console.log("Contact support:", invoiceId);
    // TODO: Implement contact logic
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4 flex flex-col gap-8">
      <div className="max-w-7xl mx-auto w-full flex flex-col gap-8">
        {/* Page Header */}
        <header className="text-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-8 shadow-sm">
          <h1 className="text-4xl font-bold text-red-600 dark:text-red-500 mb-2">
            Lịch sử đặt tour
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-400 max-w-2xl mx-auto m-0">
            Quản lý và theo dõi tất cả các chuyến du lịch bạn đã đặt
          </p>
        </header>

        {/* Search Filter */}
        <section>
          <InvoiceSearchFilterUser
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onSearch={handleSearch}
            onReset={handleResetFilters}
            isLoading={loading}
          />
        </section>

        {/* Error Display */}
        {error && (
          <section className="flex items-center justify-between gap-4 p-5 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              <span className="text-yellow-800 dark:text-yellow-200">
                {error}
              </span>
            </div>
            <button
              onClick={() => fetchInvoices(filters)}
              disabled={loading}
              className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm font-medium transition-all disabled:opacity-60 disabled:cursor-not-allowed"
            >
              Thử lại
            </button>
          </section>
        )}

        {/* Results Info */}
        {invoiceData && (
          <section className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-4 sm:p-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
            <div className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              <span className="inline">
                Tìm thấy{" "}
                <strong className="text-blue-600 dark:text-blue-400 font-semibold">
                  {invoiceData.pagination.totalDocuments}
                </strong>{" "}
                kết quả
              </span>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <label
                htmlFor="sort-select"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 whitespace-nowrap"
              >
                Sắp xếp:
              </label>
              <select
                id="sort-select"
                value={`${filters.sortBy}_${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split("_");
                  handleSortChange(sortBy, sortOrder);
                }}
                className="flex-1 sm:flex-none px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 cursor-pointer transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              >
                <option value="createdAt_desc">Mới nhất</option>
                <option value="createdAt_asc">Cũ nhất</option>
                <option value="totalPrice_desc">Giá cao nhất</option>
                <option value="totalPrice_asc">Giá thấp nhất</option>
              </select>
            </div>
          </section>
        )}

        {/* Loading State */}
        {loading && (
          <section className="flex flex-col items-center justify-center p-12 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm">
            <div className="w-10 h-10 border-3 border-gray-200 dark:border-gray-700 border-t-blue-600 rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400 m-0">
              Đang tải dữ liệu...
            </p>
          </section>
        )}

        {/* Invoice Table */}
        {!loading && !error && (
          <section>
            <InvoiceTableUser
              data={invoiceData}
              onCancelTour={handleCancelTour}
              onViewDetails={handleViewDetails}
              onContact={handleContact}
            />
          </section>
        )}

        {/* Pagination */}
        {invoiceData && invoiceData.pagination.totalPages > 1 && (
          <section className="mt-6 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-sm flex flex-col items-center gap-4">
            <Pagination
              currentPage={invoiceData.pagination.currentPage}
              totalPages={invoiceData.pagination.totalPages}
              onPageChange={handlePageChange}
            />
          </section>
        )}
      </div>
    </div>
  );
}
