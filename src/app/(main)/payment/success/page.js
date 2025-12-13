"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle, XCircle, Clock, Home } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

function PaymentResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [orderData, setOrderData] = useState(null);
  const [invoice, setInvoice] = useState(null);
  const [error, setError] = useState(null);

  const orderId = searchParams.get("orderId");
  const resultCode = searchParams.get("resultCode");
  const orderInfo = searchParams.get("orderInfo");
  const transId = searchParams.get("transId");

  useEffect(() => {
    const fetchOrderData = async () => {
      try {
        if (!orderId) {
          setError("Không tìm thấy ID đơn hàng");
          setLoading(false);
          return;
        }

        const response = await fetch(
          `${API_BASE}/api/v1/invoice/detail/${orderId}`,
          {
            credentials: "include",
          }
        );

        const data = await response.json();
        if (data && data._id) {
          setInvoice(data);
          setOrderData({
            success: resultCode === "0",
            resultCode,
            orderInfo,
            transId,
          });
        } else {
          setError(data.message || "Không tìm thấy thông tin đơn hàng");
        }
      } catch (err) {
        setError("Lỗi tải thông tin: " + err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [orderId, resultCode, orderInfo, transId]);

  const getStatusInfo = () => {
    if (!invoice) return null;

    const { typeOfPayment, isPaid, status } = invoice;

    if (typeOfPayment === "cash") {
      return {
        icon: Clock,
        color: "amber",
        title: "Đơn đặt tour đang chờ xác nhận",
        subtitle:
          "Vui lòng thanh toán tại công ty để hoàn tất đơn đặt tour của bạn",
        message:
          "Chúng tôi đã nhận được thông tin đặt tour của bạn. Vui lòng thanh toán tại công ty trong giờ làm việc để xác nhận.",
      };
    }

    if (isPaid || status === "paid") {
      return {
        icon: CheckCircle,
        color: "green",
        title: "Thanh toán thành công!",
        subtitle: "Đơn đặt tour của bạn đã được xác nhận",
        message:
          "Cảm ơn bạn đã đặt tour. Chúng tôi sẽ liên hệ với bạn sớm nhất.",
      };
    }

    if (status === "canceled") {
      return {
        icon: XCircle,
        color: "red",
        title: "Đơn đặt tour đã bị hủy",
        subtitle: "Vui lòng liên hệ với chúng tôi để biết thêm chi tiết",
        message: "Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ hỗ trợ.",
      };
    }

    return {
      icon: Clock,
      color: "blue",
      title: "Đơn đặt tour đang xử lý",
      subtitle: "Vui lòng chờ xác nhận",
      message: "Chúng tôi đang xử lý thông tin của bạn, vui lòng đợi.",
    };
  };

  const statusInfo = getStatusInfo();
  const StatusIcon = statusInfo?.icon;

  const formatVND = (n) =>
    (n || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-linear-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full">
          <div className="flex justify-center mb-4">
            <XCircle className="w-16 h-16 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-900 mb-2">
            Lỗi
          </h1>
          <p className="text-center text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => router.push("/")}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <Home className="w-5 h-5" />
            Về trang chủ
          </button>
        </div>
      </div>
    );
  }

  const bgGradient =
    statusInfo?.color === "green"
      ? "from-green-50 to-emerald-100"
      : statusInfo?.color === "amber"
      ? "from-amber-50 to-orange-100"
      : statusInfo?.color === "red"
      ? "from-red-50 to-pink-100"
      : "from-blue-50 to-indigo-100";

  const iconBg =
    statusInfo?.color === "green"
      ? "bg-green-100"
      : statusInfo?.color === "amber"
      ? "bg-amber-100"
      : statusInfo?.color === "red"
      ? "bg-red-100"
      : "bg-blue-100";

  const iconColor =
    statusInfo?.color === "green"
      ? "text-green-600"
      : statusInfo?.color === "amber"
      ? "text-amber-600"
      : statusInfo?.color === "red"
      ? "text-red-600"
      : "text-blue-600";

  return (
    <div
      className={`min-h-screen bg-linear-to-br ${bgGradient} flex items-center justify-center p-4 py-12`}
    >
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl w-full">
        <div
          className={`${iconBg} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6`}
        >
          <StatusIcon className={`w-12 h-12 ${iconColor}`} />
        </div>

        <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
          {statusInfo?.title}
        </h1>
        <p className="text-center text-gray-600 mb-8">{statusInfo?.subtitle}</p>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <p className="text-gray-700 text-center">{statusInfo?.message}</p>
        </div>

        {invoice && (
          <div className="space-y-6 mb-8">
            <div className="border-l-4 border-blue-500 pl-4">
              <p className="text-sm text-gray-600 mb-1">Mã đơn hàng</p>
              <p className="text-xl font-bold text-gray-900">
                {invoice.invoiceCode}
              </p>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-3 font-semibold">
                Thông tin đặt tour
              </p>
              <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                <div>
                  <span className="text-sm text-gray-600">Tên tour:</span>
                  <p className="font-semibold text-gray-900">
                    {invoice.tourId?.title || "N/A"}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Số khách:</span>
                  <p className="font-semibold text-gray-900">
                    {invoice.totalPeople} người
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Ngày khởi hành:</span>
                  <p className="font-semibold text-gray-900">
                    {new Date(invoice.departureDate).toLocaleDateString(
                      "vi-VN"
                    )}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">
                    Hình thức thanh toán:
                  </span>
                  <p className="font-semibold text-gray-900">
                    {invoice.typeOfPayment === "cash"
                      ? "Thanh toán tại công ty"
                      : invoice.typeOfPayment === "momo"
                      ? "Ví MoMo"
                      : invoice.typeOfPayment === "card"
                      ? "Thẻ tín dụng"
                      : invoice.typeOfPayment}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-sm text-gray-600 mb-3 font-semibold">
                Thông tin khách hàng
              </p>
              <div className="grid md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg text-sm">
                <div>
                  <span className="text-gray-600">Họ tên:</span>
                  <p className="font-semibold text-gray-900">
                    {invoice.nameOfUser}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Điện thoại:</span>
                  <p className="font-semibold text-gray-900">
                    {invoice.phoneNumber}
                  </p>
                </div>
                <div>
                  <span className="text-gray-600">Email:</span>
                  <p className="font-semibold text-gray-900">{invoice.email}</p>
                </div>
                <div>
                  <span className="text-gray-600">Địa chỉ:</span>
                  <p className="font-semibold text-gray-900">
                    {invoice.address}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-linear-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Tổng tiền</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatVND(invoice.totalPrice)}
              </p>
            </div>

            {invoice.typeOfPayment === "cash" && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm font-semibold text-amber-900 mb-2">
                  📍 Địa điểm thanh toán
                </p>
                <p className="text-sm text-amber-800">
                  Nhà số 1, ngõ 30, làng Hương Ngải, xã Tây Phương, Hà Nội
                </p>
                <p className="text-xs text-amber-700 mt-2">
                  ⏰ Giờ làm việc: 8:00 - 17:00 (Thứ Hai - Thứ Sáu)
                </p>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-4">
          <button
            onClick={() => router.push("/tours")}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Tiếp tục mua tour
          </button>
          <button
            onClick={() => router.push("/user/invoice/" + orderId)}
            className="flex-1 bg-gray-200 text-gray-900 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Xem chi tiết
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 text-center text-sm text-gray-600">
          <p>Cần hỗ trợ? Liên hệ chúng tôi qua:</p>
          <p className="font-semibold text-gray-900 mt-1">
            📞 Hotline | 📧 support@example.com
          </p>
        </div>
      </div>
    </div>
  );
}

export default function PaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải thông tin...</p>
          </div>
        </div>
      }
    >
      <PaymentResultContent />
    </Suspense>
  );
}
