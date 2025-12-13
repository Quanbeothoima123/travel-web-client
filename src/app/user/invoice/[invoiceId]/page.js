// app/user/invoice/[invoiceId]/page.jsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import {
  ArrowLeft,
  Calendar,
  Users,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  FileText,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Receipt,
  User,
  Home,
} from "lucide-react";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

  useEffect(() => {
    const fetchInvoiceDetail = async () => {
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE}/api/v1/invoice/detail/${params.invoiceId}`,
          {
            credentials: "include",
          }
        );

        if (!res.ok) {
          throw new Error("Không thể tải thông tin hóa đơn");
        }

        const data = await res.json();
        setInvoice(data);
      } catch (err) {
        console.error(err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (params.invoiceId) {
      fetchInvoiceDetail();
    }
  }, [params.invoiceId, API_BASE]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Không tìm thấy hóa đơn
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "Hóa đơn không tồn tại"}
          </p>
          <button
            onClick={() => router.push("/user/transactions_tour")}
            className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: {
        label: "Chờ xử lý",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-700",
        icon: Clock,
      },
      confirmed: {
        label: "Đã xác nhận",
        bgColor: "bg-blue-100",
        textColor: "text-blue-700",
        icon: CheckCircle,
      },
      completed: {
        label: "Hoàn thành",
        bgColor: "bg-green-100",
        textColor: "text-green-700",
        icon: CheckCircle,
      },
      canceled: {
        label: "Đã hủy",
        bgColor: "bg-red-100",
        textColor: "text-red-700",
        icon: XCircle,
      },
    };

    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;

    return (
      <div
        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${config.bgColor} ${config.textColor} font-medium`}
      >
        <Icon size={18} />
        {config.label}
      </div>
    );
  };

  const getTourStatusBadge = (status) => {
    const statusConfig = {
      "not-started": {
        label: "Chưa khởi hành",
        bgColor: "bg-gray-100",
        textColor: "text-gray-700",
      },
      ongoing: {
        label: "Đang diễn ra",
        bgColor: "bg-blue-100",
        textColor: "text-blue-700",
      },
      completed: {
        label: "Đã hoàn thành",
        bgColor: "bg-green-100",
        textColor: "text-green-700",
      },
    };

    const config = statusConfig[status] || statusConfig["not-started"];

    return (
      <span
        className={`inline-block px-3 py-1 rounded-full text-sm ${config.bgColor} ${config.textColor} font-medium`}
      >
        {config.label}
      </span>
    );
  };

  const getPaymentMethodLabel = (method) => {
    const methods = {
      momo: "Ví MoMo",
      vnpay: "VNPay",
      cash: "Tiền mặt",
      bank_transfer: "Chuyển khoản",
    };
    return methods[method] || method;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header with Back Button */}
        <div className="mb-6">
          <button
            onClick={() => router.push("/user/transactions_tour")}
            className="flex items-center gap-2 text-gray-600 hover:text-primary transition-colors mb-4 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Quay lại danh sách giao dịch</span>
          </button>

          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">
                Chi tiết hóa đơn
              </h1>
              <p className="text-gray-600">
                Mã hóa đơn:{" "}
                <span className="font-semibold text-primary">
                  {invoice.invoiceCode}
                </span>
              </p>
            </div>
            {getStatusBadge(invoice.status)}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tour Information */}
            {invoice.tourId && (
              <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <FileText className="text-primary" size={24} />
                  Thông tin tour
                </h2>
                <div className="flex gap-4 max-sm:flex-col">
                  <div className="relative w-[200px] h-[130px] rounded-lg overflow-hidden shrink-0 max-sm:w-full">
                    <Image
                      src={invoice.tourId.thumbnail}
                      alt={invoice.tourId.title}
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">
                      {invoice.tourId.title}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center gap-2">
                        <Calendar className="text-primary" size={16} />
                        <span>
                          Ngày khởi hành:{" "}
                          <strong>
                            {new Date(invoice.departureDate).toLocaleDateString(
                              "vi-VN"
                            )}
                          </strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="text-primary" size={16} />
                        <span>
                          Số chỗ đặt: <strong>{invoice.seatLimit}</strong>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="text-primary" size={16} />
                        <span>
                          Trạng thái tour:{" "}
                          {getTourStatusBadge(invoice.tourStatus)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Details */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="text-primary" size={24} />
                Chi tiết đặt chỗ
              </h2>

              {/* Seat For */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-700 mb-3">
                  Số lượng hành khách
                </h3>
                <div className="space-y-2">
                  {invoice.seatFor.map((seat, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <span className="text-gray-700">
                        {seat.typeOfPersonId?.name || "N/A"}
                      </span>
                      <span className="font-semibold text-gray-800">
                        {seat.quantity} người
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Additional Seats */}
              {invoice.seatAddFor && invoice.seatAddFor.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-3">
                    Chỗ ngồi bổ sung
                  </h3>
                  <div className="space-y-2">
                    {invoice.seatAddFor.map((seat, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center p-3 bg-amber-50 rounded-lg border border-amber-200"
                      >
                        <div>
                          <span className="text-gray-700">
                            {seat.typeOfPersonId?.name || "N/A"}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            Phụ thu:{" "}
                            {seat.moneyMoreForOne?.toLocaleString("vi-VN")}
                            đ/người
                          </p>
                        </div>
                        <span className="font-semibold text-gray-800">
                          {seat.quantity} người
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-700">
                    Tổng số người:
                  </span>
                  <span className="text-xl font-bold text-primary">
                    {invoice.totalPeople} người
                  </span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <User className="text-primary" size={24} />
                Thông tin khách hàng
              </h2>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <User className="text-primary mt-1 shrink-0" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Họ và tên</p>
                    <p className="font-semibold text-gray-800">
                      {invoice.nameOfUser}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="text-primary mt-1 shrink-0" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-semibold text-gray-800">
                      {invoice.phoneNumber}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="text-primary mt-1 shrink-0" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-800">
                      {invoice.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Home className="text-primary mt-1 shrink-0" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Địa chỉ</p>
                    <p className="font-semibold text-gray-800">
                      {invoice.address}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="text-primary mt-1 shrink-0" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Tỉnh/Thành phố</p>
                    <p className="font-semibold text-gray-800">
                      {invoice.province?.name_with_type || "N/A"}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="text-primary mt-1 shrink-0" size={18} />
                  <div>
                    <p className="text-sm text-gray-500">Phường/Xã</p>
                    <p className="font-semibold text-gray-800">
                      {invoice.ward?.name_with_type || "N/A"}
                    </p>
                  </div>
                </div>
                {invoice.note && (
                  <div className="flex items-start gap-3">
                    <FileText
                      className="text-primary mt-1 shrink-0"
                      size={18}
                    />
                    <div>
                      <p className="text-sm text-gray-500">Ghi chú</p>
                      <p className="font-semibold text-gray-800">
                        {invoice.note}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Payment & Summary */}
          <div className="space-y-6">
            {/* Payment Status */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Receipt className="text-primary" size={24} />
                Thanh toán
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Phương thức</span>
                  <div className="flex items-center gap-2">
                    <CreditCard className="text-primary" size={16} />
                    <span className="font-semibold">
                      {getPaymentMethodLabel(invoice.typeOfPayment)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-600">Trạng thái</span>
                  <span
                    className={`font-semibold ${
                      invoice.isPaid ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {invoice.isPaid ? (
                      <span className="flex items-center gap-1">
                        <CheckCircle size={16} />
                        Đã thanh toán
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        <XCircle size={16} />
                        Chưa thanh toán
                      </span>
                    )}
                  </span>
                </div>

                {invoice.transactionId && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Mã giao dịch</p>
                    <p className="font-mono text-sm font-semibold text-gray-800">
                      {invoice.transactionId}
                    </p>
                  </div>
                )}

                {invoice.datePayment && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">
                      Ngày thanh toán
                    </p>
                    <p className="font-semibold text-gray-800">
                      {new Date(invoice.datePayment).toLocaleString("vi-VN")}
                    </p>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Giá gốc</span>
                    <span className="font-semibold text-gray-800">
                      {invoice.discountedBase?.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="font-bold text-gray-800">Tổng tiền</span>
                    <span className="font-bold text-red-600 text-2xl">
                      {invoice.totalPrice?.toLocaleString("vi-VN")}đ
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-lg font-bold text-gray-800 mb-4">
                Thông tin bổ sung
              </h2>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-500">Ngày tạo</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(invoice.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Cập nhật lần cuối</p>
                  <p className="font-semibold text-gray-800">
                    {new Date(invoice.updatedAt).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
