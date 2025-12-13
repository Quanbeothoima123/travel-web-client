"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckCircle,
  XCircle,
  Home,
  Mail,
  FileText,
  User,
  MapPin,
  Phone,
  Calendar,
  Users,
  Armchair,
  Tag,
  StickyNote,
  Loader2,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import LoadingModal from "@/components/common/LoadingModal";
import { useToast } from "@/contexts/ToastContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

function MomoPaymentResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); // ✅ Dùng trực tiếp, không cần wrapper
  const invoiceRef = useRef(null);

  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [error, setError] = useState(null);

  // ✅ Lấy params trực tiếp
  const orderId = searchParams.get("orderId");
  const resultCode = searchParams.get("resultCode");
  const transId = searchParams.get("transId");

  const { showToast } = useToast();

  const formatMoney = (v) =>
    v != null
      ? new Intl.NumberFormat("vi-VN", {
          style: "currency",
          currency: "VND",
        }).format(v)
      : "Chưa có thông tin";

  const formatDate = (d) =>
    d ? new Date(d).toLocaleString("vi-VN") : "Chưa có thông tin";

  // ✅ CHỈ FETCH invoice, KHÔNG gọi IPN (MoMo tự gọi)
  useEffect(() => {
    if (!orderId) {
      setError("Không tìm thấy orderId trong URL.");
      setLoading(false);
      return;
    }

    let retryCount = 0;
    const maxRetries = 5; // Thử lại 5 lần
    const retryDelay = 2000; // 2 giây mỗi lần

    const fetchInvoiceWithRetry = async () => {
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/invoice/detail/${orderId}`,
          { credentials: "include" }
        );

        if (!res.ok) throw new Error(await res.text());

        const json = await res.json();
        const invoiceData = json.invoice || json;

        setInvoice(invoiceData);

        // ⚠️ Nếu resultCode = 0 nhưng invoice chưa paid, thử lại sau
        if (
          resultCode === "0" &&
          !invoiceData.isPaid &&
          retryCount < maxRetries
        ) {
          retryCount++;
          console.log(
            `🔄 Invoice chưa cập nhật, thử lại lần ${retryCount}/${maxRetries}...`
          );
          setTimeout(fetchInvoiceWithRetry, retryDelay);
        } else {
          setLoading(false);
        }
      } catch (err) {
        setError(err.message || "Lỗi khi tải invoice");
        setLoading(false);
      }
    };

    fetchInvoiceWithRetry();
  }, [orderId, resultCode]);

  const isSuccess = () =>
    invoice?.isPaid || invoice?.status === "paid" || String(resultCode) === "0";

  const handleSendEmail = async () => {
    if (!orderId) return;
    setSendingEmail(true);

    try {
      const res = await fetch(
        `${API_BASE}/api/v1/invoice/send-email/${encodeURIComponent(orderId)}`,
        { method: "GET", credentials: "include" }
      );

      const json = await res.json();

      if (json.success) {
        showToast(json.message || "Email đã được gửi thành công 🎉", "success");
      } else {
        showToast(json.message || "Không thể gửi email.", "error");
      }
    } catch (err) {
      showToast("Lỗi khi gửi email: " + err.message, "error");
    } finally {
      setSendingEmail(false);
    }
  };

  const handlePrintPDF = async () => {
    if (!invoiceRef.current) return window.print();
    setPrinting(true);

    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgProps = pdf.getImageProperties(imgData);
      const imgHeight = (imgProps.height * (pageWidth - 20)) / imgProps.width;
      pdf.addImage(imgData, "PNG", 10, 10, pageWidth - 20, imgHeight);
      pdf.save(
        invoice?.invoiceCode
          ? `${invoice.invoiceCode}.pdf`
          : `invoice-${orderId}.pdf`
      );
    } catch (err) {
      console.error("PDF error:", err);
      window.print();
    } finally {
      setPrinting(false);
    }
  };

  const handleHome = () => router.push("/");

  const renderSeatList = (arr, isAdditional = false) =>
    Array.isArray(arr) && arr.length > 0 ? (
      <ul className="list-none p-0 m-0 space-y-2">
        {arr.map((s, idx) => (
          <li key={idx} className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-blue-600" />
            <strong>{s.typeOfPersonId?.name || "Khách"}:</strong>
            <span>{s.quantity ?? 0}</span>
            {isAdditional && s.moneyMoreForOne && (
              <span className="text-gray-600">
                (+{formatMoney(s.moneyMoreForOne)} / người)
              </span>
            )}
          </li>
        ))}
      </ul>
    ) : (
      <span className="text-gray-500 italic">Chưa có thông tin</span>
    );

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div
          className={`bg-white rounded-2xl shadow-2xl overflow-hidden ${
            isSuccess()
              ? "border-t-4 border-green-500"
              : "border-t-4 border-red-500"
          }`}
        >
          {/* Header */}
          <div
            className={`p-8 text-center ${
              isSuccess()
                ? "bg-linear-to-r from-green-50 to-emerald-50"
                : "bg-linear-to-r from-red-50 to-rose-50"
            }`}
          >
            {isSuccess() ? (
              <>
                <CheckCircle className="w-20 h-20 mx-auto mb-4 text-green-500" />
                <h2 className="text-3xl font-bold text-green-700 m-0">
                  Đặt tour thành công
                </h2>
              </>
            ) : (
              <>
                <XCircle className="w-20 h-20 mx-auto mb-4 text-red-500" />
                <h2 className="text-3xl font-bold text-red-700 m-0">
                  Đặt tour thất bại
                </h2>
              </>
            )}
          </div>

          {/* Body */}
          <div className="p-8" ref={invoiceRef}>
            {loading ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
                <p className="mt-4 text-gray-600">
                  Đang tải thông tin hóa đơn...
                </p>
              </div>
            ) : error ? (
              <p className="text-center text-red-600 py-8">{error}</p>
            ) : !invoice ? (
              <p className="text-center text-gray-500 py-8">
                Không tìm thấy hóa đơn.
              </p>
            ) : (
              <div className="space-y-1">
                <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-t-xl">
                  <h3 className="text-xl font-bold m-0">Hóa đơn chi tiết</h3>
                </div>

                <div className="border border-gray-200 rounded-b-xl divide-y divide-gray-200">
                  {/* Invoice Info */}
                  <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Tag className="w-4 h-4" />
                      <span>Mã hóa đơn</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {invoice.invoiceCode}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Tag className="w-4 h-4" />
                      <span>Trạng thái</span>
                    </div>
                    <div
                      className={`font-semibold ${
                        invoice.status === "paid"
                          ? "text-green-600"
                          : "text-orange-600"
                      }`}
                    >
                      {invoice.status === "paid"
                        ? "✅ Đã thanh toán"
                        : "⏳ " + invoice.status}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Tag className="w-4 h-4" />
                      <span>Phương thức</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {invoice.typeOfPayment}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Tag className="w-4 h-4" />
                      <span>Mã giao dịch</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {invoice.transactionId || transId || "Chưa có"}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Calendar className="w-4 h-4" />
                      <span>Ngày thanh toán</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {formatDate(invoice.datePayment)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 bg-linear-to-r from-yellow-50 to-amber-50">
                    <div className="flex items-center gap-2 text-gray-900 font-bold">
                      <Tag className="w-5 h-5" />
                      <span>Tổng tiền</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600">
                      {formatMoney(invoice.totalPrice)}
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <User className="w-4 h-4" />
                      <span>Người đặt</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {invoice.nameOfUser}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Phone className="w-4 h-4" />
                      <span>SĐT</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {invoice.phoneNumber}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Mail className="w-4 h-4" />
                      <span>Email</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {invoice.email}
                    </div>
                  </div>

                  <div className="flex justify-between items-start p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <MapPin className="w-4 h-4" />
                      <span>Địa chỉ</span>
                    </div>
                    <div className="font-semibold text-gray-900 text-right max-w-md">
                      {`${invoice.address || ""}, ${
                        invoice.ward?.name_with_type || ""
                      }, ${invoice.province?.name_with_type || ""}`.trim()}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Calendar className="w-4 h-4" />
                      <span>Ngày khởi hành</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {formatDate(invoice.departureDate)}
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Users className="w-4 h-4" />
                      <span>Tổng số khách</span>
                    </div>
                    <div className="font-semibold text-gray-900">
                      {invoice.totalPeople}
                    </div>
                  </div>

                  <div className="flex justify-between items-start p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Armchair className="w-4 h-4" />
                      <span>Ghế cơ bản</span>
                    </div>
                    <div>{renderSeatList(invoice.seatFor)}</div>
                  </div>

                  <div className="flex justify-between items-start p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <Armchair className="w-4 h-4" />
                      <span>Ghế thêm</span>
                    </div>
                    <div>{renderSeatList(invoice.seatAddFor, true)}</div>
                  </div>

                  <div className="flex justify-between items-start p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-2 text-gray-700 font-medium">
                      <StickyNote className="w-4 h-4" />
                      <span>Ghi chú</span>
                    </div>
                    <div className="font-semibold text-gray-900 text-right max-w-md">
                      {invoice.note || "Không có"}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-6 bg-gray-50 flex flex-wrap gap-3 justify-center border-t border-gray-200">
            <button
              onClick={handleHome}
              className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-100 hover:border-gray-400 transition-all"
            >
              <Home className="w-4 h-4" />
              <span>Trang chủ</span>
            </button>

            <button
              onClick={handleSendEmail}
              disabled={sendingEmail}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-blue-500 to-indigo-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <Mail className="w-4 h-4" />
              <span>Gửi email</span>
            </button>

            <button
              onClick={handlePrintPDF}
              disabled={printing || !invoice}
              className="flex items-center gap-2 px-6 py-3 bg-linear-to-r from-green-500 to-emerald-500 text-white rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
            >
              <FileText className="w-4 h-4" />
              <span>Xuất PDF</span>
            </button>
          </div>
        </div>

        <div className="text-center mt-8 text-gray-600">
          Cảm ơn bạn đã quan tâm đến dịch vụ - Chúng tôi sẽ liên hệ sớm nhất với
          bạn!
        </div>
      </div>

      {/* Loading Modals */}
      <LoadingModal
        open={sendingEmail}
        message="Đang gửi email..."
        icon="Mail"
      />
      <LoadingModal
        open={printing}
        message="Đang tạo file PDF..."
        icon="FileText"
      />
    </div>
  );
}

export default function MomoPaymentResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        </div>
      }
    >
      <MomoPaymentResultContent />
    </Suspense>
  );
}
