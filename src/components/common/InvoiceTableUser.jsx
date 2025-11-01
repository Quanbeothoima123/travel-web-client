"use client";

import React from "react";
import Link from "next/link";
import {
  Hash,
  FileText,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Globe,
  Info,
  Settings,
  XCircle,
  Eye,
  Phone,
  CreditCard,
} from "lucide-react";

export default function InvoiceTableUser({
  data,
  onCancelTour,
  onViewDetails,
  onContact,
}) {
  if (!data || !data.invoices || data.invoices.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
        <FileText className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          Không có hóa đơn nào được tìm thấy
        </p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getTourTypeText = (type) => {
    return type === "aboard" ? "Nước ngoài" : "Trong nước";
  };

  const getStatusText = (status) => {
    const statusMap = {
      pending: "Chờ xử lý",
      paid: "Đã thanh toán",
      cancelled: "Đã hủy",
      canceled: "Đã hủy",
      refunded: "Đã hoàn tiền",
    };
    return statusMap[status] || status;
  };

  const handleCancelTour = (invoiceId) => {
    if (onCancelTour) {
      onCancelTour(invoiceId);
    } else {
      console.log("Cancel tour:", invoiceId);
    }
  };

  const handleViewDetails = (invoiceId) => {
    if (onViewDetails) {
      onViewDetails(invoiceId);
    } else {
      console.log("View details:", invoiceId);
    }
  };

  const handleContact = (invoiceId) => {
    if (onContact) {
      onContact(invoiceId);
    } else {
      console.log("Contact support:", invoiceId);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm overflow-hidden">
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
        <table className="w-full border-collapse bg-white dark:bg-gray-800">
          <thead className="bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300">
            <tr>
              <th className="px-3 py-4 text-center align-middle">
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Hash className="w-3.5 h-3.5" />
                  <span className="font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                    STT
                  </span>
                </span>
              </th>
              <th className="px-3 py-4 text-center align-middle">
                <span className="inline-flex items-center justify-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span className="font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                    Mã thanh toán
                  </span>
                </span>
              </th>
              <th className="px-3 py-4 text-center align-middle">
                <span className="inline-flex items-center justify-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                    Tên tour
                  </span>
                </span>
              </th>
              <th className="px-3 py-4 text-center align-middle">
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  <span className="font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                    Ngày đặt
                  </span>
                </span>
              </th>
              <th className="px-3 py-4 text-center align-middle">
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Users className="w-3.5 h-3.5" />
                  <span className="font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                    Số ghế
                  </span>
                </span>
              </th>
              <th className="px-3 py-4 text-center align-middle">
                <span className="inline-flex items-center justify-center gap-1.5">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span className="font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                    Tổng tiền
                  </span>
                </span>
              </th>
              <th className="px-3 py-4 text-center align-middle">
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  <span className="font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                    Loại tour
                  </span>
                </span>
              </th>
              <th className="px-3 py-4 text-center align-middle">
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Info className="w-3.5 h-3.5" />
                  <span className="font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                    Trạng thái
                  </span>
                </span>
              </th>
              <th className="px-3 py-4 text-center align-middle">
                <span className="inline-flex items-center justify-center gap-1.5">
                  <Settings className="w-3.5 h-3.5" />
                  <span className="font-semibold text-xs uppercase tracking-wide whitespace-nowrap">
                    Hành động
                  </span>
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            {data.invoices.map((invoice, index) => (
              <tr
                key={invoice._id}
                className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-3 py-4 text-center align-middle text-sm text-gray-900 dark:text-gray-100">
                  {index +
                    1 +
                    (data.pagination.currentPage - 1) * data.pagination.limit}
                </td>
                <td className="px-3 py-4 text-center align-middle">
                  <span className="font-mono font-semibold text-blue-600 dark:text-blue-400 text-sm">
                    {invoice.invoiceCode}
                  </span>
                </td>
                <td className="px-3 py-4 align-middle max-w-xs">
                  <a
                    href={`/tour/${invoice.tourId.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block no-underline text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={invoice.tourId.thumbnail}
                        alt={invoice.tourId.title}
                        className="w-[70px] h-[45px] rounded border border-gray-200 dark:border-gray-600 object-cover shrink-0"
                      />
                      <span className="font-medium leading-tight text-xs line-clamp-2">
                        {invoice.tourId.title}
                      </span>
                    </div>
                  </a>
                </td>
                <td className="px-3 py-4 text-center align-middle text-sm text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  {formatDate(invoice.createdAt)}
                </td>
                <td className="px-3 py-4 text-center align-middle text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {invoice.totalPeople}
                </td>
                <td className="px-3 py-4 text-center align-middle font-bold text-red-600 dark:text-red-400 text-base whitespace-nowrap">
                  {formatPrice(invoice.totalPrice)}
                </td>
                <td className="px-3 py-4 text-center align-middle">
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${
                      invoice.tourId.type === "aboard"
                        ? "bg-green-500 text-white"
                        : "bg-gray-200 dark:bg-gray-600 text-gray-800 dark:text-gray-200"
                    }`}
                  >
                    {getTourTypeText(invoice.tourId.type)}
                  </span>
                </td>
                <td className="px-3 py-4 text-center align-middle">
                  <span
                    className={`inline-block px-3 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider ${
                      invoice.status === "pending"
                        ? "bg-yellow-400 text-yellow-900"
                        : invoice.status === "paid"
                        ? "bg-green-500 text-white"
                        : invoice.status === "cancelled" ||
                          invoice.status === "canceled"
                        ? "bg-red-500 text-white"
                        : invoice.status === "refunded"
                        ? "bg-gray-400 dark:bg-gray-600 text-white"
                        : "bg-gray-200 text-gray-800"
                    }`}
                  >
                    {getStatusText(invoice.status)}
                  </span>
                </td>
                <td className="px-3 py-4 align-middle">
                  <div className="flex flex-wrap gap-2 items-center justify-center">
                    {invoice.status === "pending" && (
                      <>
                        <button
                          onClick={() => handleCancelTour(invoice._id)}
                          className="flex items-center gap-1 px-2 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-semibold uppercase tracking-wider border-none cursor-pointer transition-all whitespace-nowrap"
                        >
                          <XCircle className="w-3 h-3" />
                          Hủy tour
                        </button>
                        {invoice.typeOfPayment === "momo" && (
                          <Link
                            href={`/repay/${invoice._id}`}
                            className="flex items-center gap-1 px-2 py-1.5 rounded bg-yellow-500 hover:bg-yellow-600 text-gray-900 text-[10px] font-semibold uppercase tracking-wider no-underline cursor-pointer transition-all whitespace-nowrap"
                          >
                            <CreditCard className="w-3 h-3" />
                            Thanh toán lại
                          </Link>
                        )}
                        <button
                          onClick={() => handleViewDetails(invoice._id)}
                          className="flex items-center gap-1 px-2 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold uppercase tracking-wider border-none cursor-pointer transition-all whitespace-nowrap"
                        >
                          <Eye className="w-3 h-3" />
                          Chi tiết
                        </button>
                      </>
                    )}

                    {invoice.status === "paid" && (
                      <>
                        <button
                          onClick={() => handleCancelTour(invoice._id)}
                          className="flex items-center gap-1 px-2 py-1.5 rounded bg-red-600 hover:bg-red-700 text-white text-[10px] font-semibold uppercase tracking-wider border-none cursor-pointer transition-all whitespace-nowrap"
                        >
                          <XCircle className="w-3 h-3" />
                          Hủy
                        </button>
                        <button
                          onClick={() => handleViewDetails(invoice._id)}
                          className="flex items-center gap-1 px-2 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold uppercase tracking-wider border-none cursor-pointer transition-all whitespace-nowrap"
                        >
                          <Eye className="w-3 h-3" />
                          Chi tiết
                        </button>
                      </>
                    )}

                    {(invoice.status === "cancelled" ||
                      invoice.status === "canceled") && (
                      <button
                        onClick={() => handleViewDetails(invoice._id)}
                        className="flex items-center gap-1 px-2 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold uppercase tracking-wider border-none cursor-pointer transition-all whitespace-nowrap"
                      >
                        <Eye className="w-3 h-3" />
                        Chi tiết
                      </button>
                    )}

                    {invoice.status === "refunded" && (
                      <>
                        <button
                          onClick={() => handleViewDetails(invoice._id)}
                          className="flex items-center gap-1 px-2 py-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-semibold uppercase tracking-wider border-none cursor-pointer transition-all whitespace-nowrap"
                        >
                          <Eye className="w-3 h-3" />
                          Chi tiết
                        </button>
                        <button
                          onClick={() => handleContact(invoice._id)}
                          className="flex items-center gap-1 px-2 py-1.5 rounded bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-semibold uppercase tracking-wider border-none cursor-pointer transition-all whitespace-nowrap"
                        >
                          <Phone className="w-3 h-3" />
                          Liên hệ
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.pagination && (
        <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="m-0 text-gray-500 dark:text-gray-400 text-sm">
            Hiển thị {data.invoices.length} trên{" "}
            {data.pagination.totalDocuments} kết quả (Trang{" "}
            {data.pagination.currentPage}/{data.pagination.totalPages})
          </p>
        </div>
      )}
    </div>
  );
}
