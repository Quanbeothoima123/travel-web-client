"use client";

import React from "react";
import { Search, MapPin, Tag, DollarSign, Calendar, CreditCard, Filter, RotateCcw, Loader2 } from "lucide-react";
import CategoryTreeSelect from "@/components/common/CategoryTreeSelect";
import DepartPlaceDropDownSearch from "@/components/common/DepartPlaceDropDownSearch";

// Tour type options
const tourTypeOptions = [
  { value: "", label: "Tất cả loại tour (không lọc)" },
  { value: "aboard", label: "Nước ngoài" },
  { value: "domestic", label: "Trong nước" },
];

// Payment type options
const paymentTypeOptions = [
  { value: "", label: "Tất cả phương thức (không lọc)" },
  { value: "cash", label: "Tiền mặt" },
  { value: "momo", label: "MoMo" },
  { value: "bank_transfer", label: "Chuyển khoản" },
];

// Status options
const statusOptions = [
  { value: "", label: "Tất cả trạng thái (không lọc)" },
  { value: "pending", label: "Chờ xử lý" },
  { value: "paid", label: "Đã thanh toán" },
  { value: "canceled", label: "Đã hủy" },
];

export default function InvoiceSearchFilterUser({
  filters,
  onFiltersChange,
  onSearch,
  onReset,
  isLoading = false,
}) {
  const handleInputChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const handleDateChange = (field, value) => {
    onFiltersChange({
      ...filters,
      [field]: value,
    });
  };

  const handlePriceChange = (field, value) => {
    const numValue = value === "" ? "" : Number(value);
    onFiltersChange({
      ...filters,
      [field]: numValue,
    });
  };

  const handleCategoryChange = (category) => {
    onFiltersChange({
      ...filters,
      categoryId: category ? category._id : null,
    });
  };

  const handleDepartPlaceChange = (departPlaceId) => {
    onFiltersChange({
      ...filters,
      departPlaceId,
    });
  };

  const formatPrice = (price) => {
    return price ? price.toLocaleString("vi-VN") : "";
  };

  const parsePrice = (priceStr) => {
    return priceStr.replace(/[^\d]/g, "");
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 mb-6 shadow-sm">
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center gap-2 m-0">
          <Filter className="w-5 h-5" />
          Bộ lọc tìm kiếm
        </h3>
        <button
          type="button"
          onClick={onReset}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-gray-400 bg-transparent border border-gray-300 dark:border-gray-600 rounded-lg hover:text-blue-600 hover:border-blue-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-4 h-4" />
          Đặt lại
        </button>
      </div>

      {/* Filter Content */}
      <div className="flex flex-col gap-4 w-full">
        {/* Search Input */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <Search className="inline w-4 h-4 mr-1 mb-0.5" />
            Tìm kiếm
          </label>
          <input
            type="text"
            placeholder="Tìm theo mã hóa đơn, tên, email..."
            value={filters.search || ""}
            onChange={(e) => handleInputChange("search", e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>

        {/* Search Tour Input */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="inline w-4 h-4 mr-1 mb-0.5" />
            Tìm kiếm tour
          </label>
          <input
            type="text"
            placeholder="Tìm theo tên tour..."
            value={filters.searchTour || ""}
            onChange={(e) => handleInputChange("searchTour", e.target.value)}
            className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>

        {/* Category and Depart Place */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="flex flex-col gap-2 w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              <Tag className="inline w-4 h-4 mr-1 mb-0.5" />
              Danh mục tour
            </label>
            <CategoryTreeSelect
              value={filters.categoryId ? { _id: filters.categoryId } : null}
              onChange={handleCategoryChange}
              placeholder="Chọn danh mục tour"
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <DepartPlaceDropDownSearch
              handleChangeValue={handleDepartPlaceChange}
              defaultValue={
                filters.departPlaceId ? { value: filters.departPlaceId } : null
              }
            />
          </div>
        </div>

        {/* Tour Type and Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="flex flex-col gap-2 w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Loại tour
            </label>
            <select
              value={filters.tourType || ""}
              onChange={(e) => handleInputChange("tourType", e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            >
              {tourTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Trạng thái
            </label>
            <select
              value={filters.status || ""}
              onChange={(e) => handleInputChange("status", e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Payment Type */}
        <div className="w-full">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <CreditCard className="inline w-4 h-4 mr-1 mb-0.5" />
            Phương thức thanh toán
          </label>
          <select
            value={filters.typeOfPayment || ""}
            onChange={(e) =>
              handleInputChange("typeOfPayment", e.target.value)
            }
            className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          >
            {paymentTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="flex flex-col gap-2 w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <DollarSign className="inline w-4 h-4 mr-1 mb-0.5" />
              Giá từ (VNĐ)
            </label>
            <input
              type="text"
              placeholder="0"
              value={formatPrice(filters.minPrice)}
              onChange={(e) =>
                handlePriceChange("minPrice", parsePrice(e.target.value))
              }
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-right bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <DollarSign className="inline w-4 h-4 mr-1 mb-0.5" />
              Giá đến (VNĐ)
            </label>
            <input
              type="text"
              placeholder="0"
              value={formatPrice(filters.maxPrice)}
              onChange={(e) =>
                handlePriceChange("maxPrice", parsePrice(e.target.value))
              }
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-right bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {/* Date Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <div className="flex flex-col gap-2 w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Calendar className="inline w-4 h-4 mr-1 mb-0.5" />
              Từ ngày
            </label>
            <input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => handleDateChange("startDate", e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>

          <div className="flex flex-col gap-2 w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              <Calendar className="inline w-4 h-4 mr-1 mb-0.5" />
              Đến ngày
            </label>
            <input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => handleDateChange("endDate", e.target.value)}
              className="w-full px-3 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 transition-all focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-end gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <button
            type="button"
            onClick={onSearch}
            disabled={isLoading}
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium uppercase tracking-wider transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm hover:shadow-md hover:-translate-y-0.5 active:translate-y-0"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Đang tìm...
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                Tìm kiếm
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}