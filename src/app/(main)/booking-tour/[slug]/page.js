"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Info, Home, Wallet, CreditCard } from "lucide-react";

import CategoryTreeSelect from "@/components/common/CategoryTreeSelect";
import TourSearchSelect from "@/components/common/TourSearchSelect";
import ProvinceSelect from "@/components/common/ProvinceSelect";
import WardSelect from "@/components/common/WardSelect";
import ConfirmModal from "@/components/common/ConfirmModal";
import { useToast } from "@/contexts/ToastContext";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export default function BookingPage() {
  const params = useParams();
  const initialSlug = params?.slug;
  const { user } = useAuth();
  const { showToast } = useToast();
  // Tour state
  const [tourDetail, setTourDetail] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedTour, setSelectedTour] = useState(null);

  // Booking state
  const [departDate, setDepartDate] = useState("");
  const [baseCounts, setBaseCounts] = useState({});
  const [exceedCounts, setExceedCounts] = useState({});

  // Customer info
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [province, setProvince] = useState(null);
  const [ward, setWard] = useState(null);
  const [note, setNote] = useState("");

  // Payment
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-fill from user data
  useEffect(() => {
    if (user) {
      setName(user.fullName || "");
      setPhone(user.phoneNumber || "");
      setEmail(user.email || "");
      setAddress(user.address || "");
      if (user.province) setProvince(user.province);
      if (user.ward) setWard(user.ward);
    }
  }, [user]);

  // Fetch tour detail
  useEffect(() => {
    const currentSlug = selectedTour?.slug || initialSlug;
    if (!currentSlug) return;

    let cancelled = false;
    fetch(`${API_BASE}/api/v1/tours/tour-detail/${currentSlug}`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return;
        const detail = data?.tourDetail || null;
        if (!detail) {
          showToast("Không tìm thấy chi tiết tour", "error");
          setTourDetail(null);
          return;
        }
        setTourDetail(detail);
      })
      .catch((err) => {
        if (!cancelled) showToast("Lỗi tải tour: " + err.message, "error");
      });

    return () => {
      cancelled = true;
    };
  }, [initialSlug, selectedTour?.slug]);

  // Derive person types from tour
  const surchargePersonTypes = useMemo(() => {
    if (!tourDetail?.additionalPrices) return [];
    const arr = tourDetail.additionalPrices
      .map((p) => {
        const tp = p?.typeOfPersonId;
        if (!tp) return null;
        let id = typeof tp === "string" ? tp : tp._id || tp.id;
        if (!id) return null;
        const name =
          typeof tp === "object" ? tp.name || tp.title || "Khách" : "Khách";
        return { id: String(id), name };
      })
      .filter(Boolean);

    const unique = [];
    const seen = new Set();
    for (const t of arr) {
      if (!seen.has(t.id)) {
        seen.add(t.id);
        unique.push(t);
      }
    }
    return unique;
  }, [tourDetail]);

  const allowPersonTypes = useMemo(() => {
    if (!tourDetail?.allowTypePeople) return [];
    const nameLookup = {};
    surchargePersonTypes.forEach((p) => {
      nameLookup[p.id] = p.name;
    });

    return tourDetail.allowTypePeople
      .map((p) => {
        let id = null;
        let name = null;
        if (typeof p === "string") {
          id = p;
          name = nameLookup[id] || "Khách";
        } else if (p?._id || p?.id) {
          id = p._id ? String(p._id) : String(p.id);
          name = p.name || p.title || nameLookup[id] || "Khách";
        }
        if (!id) return null;
        return { id, name };
      })
      .filter(Boolean);
  }, [tourDetail, surchargePersonTypes]);

  const additionalMapById = useMemo(() => {
    const map = {};
    if (!tourDetail?.additionalPrices) return map;
    for (const p of tourDetail.additionalPrices) {
      const tp = p?.typeOfPersonId;
      if (!tp) continue;
      let id = typeof tp === "string" ? tp : tp._id || tp.id;
      if (!id) continue;
      map[String(id)] = typeof p.moneyMore === "number" ? p.moneyMore : 0;
    }
    return map;
  }, [tourDetail]);

  const baseRenderTypes = allowPersonTypes.length
    ? allowPersonTypes
    : surchargePersonTypes;
  const hasAdditional = Object.keys(additionalMapById).length > 0;

  // Initialize counts when person types change
  useEffect(() => {
    setBaseCounts((prev) => {
      const next = { ...prev };
      baseRenderTypes.forEach((t) => {
        if (!(t.id in next)) next[t.id] = 0;
      });
      return next;
    });

    setExceedCounts((prev) => {
      const next = { ...prev };
      surchargePersonTypes.forEach((t) => {
        if (!(t.id in next)) next[t.id] = 0;
      });
      return next;
    });
  }, [baseRenderTypes, surchargePersonTypes]);

  // Sync selected category/tour
  useEffect(() => {
    if (!tourDetail) return;
    if (!selectedCategory) setSelectedCategory(tourDetail.categoryId || null);
    if (!selectedTour)
      setSelectedTour({ slug: tourDetail.slug, title: tourDetail.title });
  }, [tourDetail, selectedCategory, selectedTour]);

  // Price calculations
  const seats = tourDetail?.seats || 0;
  const basePriceRaw = tourDetail?.prices || 0;
  const discount = tourDetail?.discount || 0;
  const discountedBase = Math.max(
    0,
    Math.round(basePriceRaw * (1 - discount / 100))
  );

  const totalBase = Object.values(baseCounts).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0
  );
  const totalExceed = Object.values(exceedCounts).reduce(
    (sum, v) => sum + (Number(v) || 0),
    0
  );
  const totalPeople = totalBase + totalExceed;

  const surchargeTotal = surchargePersonTypes.reduce((sum, t) => {
    const count = exceedCounts[t.id] || 0;
    const surcharge = additionalMapById[t.id] || 0;
    return sum + count * surcharge;
  }, 0);

  const totalPrice = useMemo(() => {
    if (totalPeople === 0 || !discountedBase) return 0;
    if (seats <= 0 || !hasAdditional) return discountedBase;
    if (totalPeople <= seats) return discountedBase;
    return discountedBase + surchargeTotal;
  }, [discountedBase, totalPeople, seats, hasAdditional, surchargeTotal]);

  const minDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split("T")[0];
  }, []);

  const formatVND = (n) =>
    (n || 0).toLocaleString("vi-VN", { style: "currency", currency: "VND" });

  // Handlers
  const handleProvinceChange = (newProvince) => {
    setProvince(newProvince);
    if (ward && (!newProvince || newProvince.code !== province?.code)) {
      setWard(null);
    }
  };

  const handleBaseChange = (id, value) => {
    const raw = Math.max(0, parseInt(value || "0", 10));
    const currentBase = baseCounts[id] || 0;
    const othersSum = totalBase - currentBase;

    if (seats > 0) {
      const maxForThis = Math.max(0, seats - othersSum);
      if (raw > maxForThis) {
        showToast("Số người base vượt quá số chỗ!", "error");
        setBaseCounts((prev) => ({ ...prev, [id]: maxForThis }));
        return;
      }
    }

    setBaseCounts((prev) => ({ ...prev, [id]: raw }));
  };

  const handleExceedChange = (id, value) => {
    const safe = Math.max(0, parseInt(value || "0", 10));
    setExceedCounts((prev) => ({ ...prev, [id]: safe }));
  };

  // Validation
  const validateForm = () => {
    const errors = [];
    if (!name) errors.push("Họ và tên là bắt buộc");
    if (!phone) errors.push("Số điện thoại là bắt buộc");
    if (!email) errors.push("Email là bắt buộc");
    if (!address) errors.push("Địa chỉ là bắt buộc");
    if (!province) errors.push("Tỉnh/thành phố là bắt buộc");
    if (!ward) errors.push("Phường/xã là bắt buộc");
    if (!departDate) errors.push("Ngày khởi hành là bắt buộc");
    if (totalPrice <= 0) errors.push("Tổng tiền không hợp lệ");

    errors.forEach((msg) => showToast(msg, "error"));
    return errors.length === 0;
  };

  // Build payload
  const buildPayload = () => ({
    tourId: tourDetail?._id,
    departureDate: departDate,
    seatFor: baseRenderTypes.map((t) => ({
      typeOfPersonId: t.id,
      quantity: baseCounts[t.id] || 0,
    })),
    seatAddFor: surchargePersonTypes
      .map((t) => ({
        typeOfPersonId: t.id,
        quantity: exceedCounts[t.id] || 0,
        moneyMoreForOne: additionalMapById[t.id] || 0,
      }))
      .filter((s) => s.quantity > 0),
    nameOfUser: name,
    phoneNumber: phone,
    email,
    address,
    province: province?._id,
    ward: ward?._id,
    note,
    typeOfPayment: paymentMethod,
    totalPrice,
  });

  // Submit handlers
  const submitCash = async () => {
    const payload = buildPayload();
    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE}/api/v1/invoice/payUsingCash`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok && data.success && data.invoice) {
        const inv = data.invoice;
        // ✅ FIX: Redirect tới /payment/success thay vì /payment/momo/result
        const params = new URLSearchParams({
          orderId: inv._id || inv.id,
          resultCode: "0",
          orderInfo: `Thanh toán đơn hàng ${inv.invoiceCode || ""}`,
          transId: inv.transactionId || "",
        });
        window.location.href = `/payment/success?${params.toString()}`;
      } else {
        showToast(data.message || "Đặt tour thất bại", "error");
      }
    } catch (err) {
      showToast("Lỗi server: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitMomo = async () => {
    const payload = buildPayload();
    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE}/api/v1/invoice/pay-with-momo`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok && data?.payUrl) {
        // MoMo sẽ redirect trở lại sau khi thanh toán
        window.location.href = data.payUrl;
      } else {
        showToast(data?.message || "Không tạo được giao dịch MoMo", "error");
      }
    } catch (err) {
      showToast("Lỗi server khi tạo giao dịch MoMo: " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const submitCard = async () => {
    const payload = buildPayload();
    payload.typeOfPayment = "card";

    try {
      setIsSubmitting(true);
      const response = await fetch(`${API_BASE}/api/v1/invoice/create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();

      if (response.ok && data?.invoice) {
        const inv = data.invoice;
        // ✅ FIX: Redirect tới /payment/success thay vì /payment/momo/result
        const params = new URLSearchParams({
          orderId: inv._id || inv.id,
          resultCode: "0",
          orderInfo: `Thanh toán đơn hàng ${inv.invoiceCode || ""}`,
          transId: inv.transactionId || "",
        });
        window.location.href = `/payment/success?${params.toString()}`;
      } else {
        showToast(
          data?.message || "Không thể tạo hóa đơn thanh toán bằng thẻ",
          "error"
        );
      }
    } catch (err) {
      showToast("Lỗi server khi tạo hóa đơn (card): " + err.message, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const openConfirm = (action) => {
    if (!validateForm()) return;
    setConfirmAction(action);
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    setIsConfirmOpen(false);
    if (confirmAction === "cash") await submitCash();
    else if (confirmAction === "momo") await submitMomo();
    else if (confirmAction === "card") await submitCard();
    setConfirmAction(null);
  };

  const showExceedSection = hasAdditional && seats > 0 && totalBase >= seats;
  const canSubmit = totalPrice > 0;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 grid lg:grid-cols-[1fr_380px] gap-8">
        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Đặt tour</h2>

          {/* Tour Selection */}
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn loại tour
              </label>
              <CategoryTreeSelect
                value={selectedCategory}
                onChange={setSelectedCategory}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Chọn tour
              </label>
              <TourSearchSelect
                categorySlug={selectedCategory?.slug}
                value={selectedTour}
                onChange={setSelectedTour}
              />
            </div>
          </div>

          {/* People Section */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Số lượng người
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {baseRenderTypes.length > 0 ? (
                <>
                  {baseRenderTypes.map((type) => (
                    <div
                      key={type.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-blue-500 transition-colors"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {type.name}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={baseCounts[type.id] || 0}
                        onChange={(e) =>
                          handleBaseChange(type.id, e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {additionalMapById[type.id] > 0 && (
                        <p className="text-xs text-gray-500 mt-1">
                          Phụ thu: {formatVND(additionalMapById[type.id])}/người
                        </p>
                      )}
                    </div>
                  ))}
                  <div
                    className={`border-2 rounded-lg p-4 flex items-center gap-3 ${
                      seats <= 0 || totalPeople <= seats
                        ? "border-green-200 bg-green-50"
                        : "border-orange-200 bg-orange-50"
                    }`}
                  >
                    <Info
                      className={
                        seats <= 0 || totalPeople <= seats
                          ? "text-green-600"
                          : "text-orange-600"
                      }
                    />
                    <span className="text-sm font-medium">
                      {seats > 0
                        ? totalPeople <= seats
                          ? `Còn ${Math.max(0, seats - totalBase)} chỗ trống`
                          : `Vượt ${totalExceed} chỗ (có phụ thu)`
                        : "Đang cập nhật số chỗ"}
                    </span>
                  </div>
                </>
              ) : (
                <div className="col-span-2 text-center py-8 text-gray-500">
                  <p>Chưa có loại người để đặt cho tour này.</p>
                  <p className="text-sm">
                    Vui lòng liên hệ admin nếu có thắc mắc.
                  </p>
                </div>
              )}
            </div>

            {!hasAdditional && seats > 0 && totalPeople > seats && (
              <p className="text-red-600 text-sm mt-4">
                Tour này không cho vượt quá số chỗ.
              </p>
            )}

            {showExceedSection && (
              <div className="mt-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">
                  Số lượng vượt chỗ (có phụ thu)
                </h4>
                <div className="grid md:grid-cols-2 gap-4">
                  {surchargePersonTypes.map((type) => (
                    <div
                      key={type.id + "-exceed"}
                      className="border border-orange-200 rounded-lg p-4 bg-orange-50"
                    >
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {type.name}
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={exceedCounts[type.id] || 0}
                        onChange={(e) =>
                          handleExceedChange(type.id, e.target.value)
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                      {additionalMapById[type.id] > 0 && (
                        <p className="text-xs text-orange-700 mt-1 font-medium">
                          Phụ thu: {formatVND(additionalMapById[type.id])}/người
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Departure Date */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ngày khởi hành
            </label>
            <input
              type="date"
              min={minDate}
              value={departDate}
              onChange={(e) => setDepartDate(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Customer Info */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Thông tin khách hàng
            </h3>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Điện thoại
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tỉnh/thành phố
                </label>
                <ProvinceSelect
                  value={province}
                  onChange={handleProvinceChange}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phường/xã
                </label>
                <WardSelect
                  provinceCode={province?.code}
                  value={ward}
                  onChange={setWard}
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ghi chú
                </label>
                <textarea
                  rows={4}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Section */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Hình thức thanh toán
            </h3>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <label
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === "cash"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                  className="absolute top-4 right-4"
                />
                <div className="flex items-center gap-3 mb-2">
                  <Home className="text-xl text-red-600" />
                  <span className="cursor-pointer font-semibold text-gray-900">
                    Thanh toán tại công ty
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Nhà số 1, ngõ 30, làng Hương Ngải, xã Tây Phương, Hà Nội
                </p>
              </label>

              <label
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === "momo"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="momo"
                  checked={paymentMethod === "momo"}
                  onChange={() => setPaymentMethod("momo")}
                  className="absolute top-4 right-4"
                />
                <div className="flex items-center gap-3 mb-2">
                  <Wallet className="text-xl text-blue-600" />
                  <span className="font-semibold text-gray-900">
                    Thanh toán ví MoMo
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Thanh toán trực tuyến an toàn qua MoMo
                </p>
              </label>

              <label
                className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all ${
                  paymentMethod === "card"
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="absolute top-4 right-4"
                />
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="text-xl text-green-600" />
                  <span className="cursor-pointer font-semibold text-gray-900">
                    Thanh toán thẻ tín dụng
                  </span>
                </div>
                <p className="text-sm text-gray-600">
                  Thanh toán bằng thẻ tín dụng/ghi nợ
                </p>
              </label>

              <label className="relative border-2 rounded-lg p-4 opacity-50 cursor-not-allowed">
                <input
                  type="radio"
                  name="payment"
                  value="bank-transfer"
                  disabled
                  className="absolute top-4 right-4"
                />
                <div className="flex items-center gap-3 mb-2">
                  <CreditCard className="text-xl text-gray-400" />
                  <span className="font-semibold text-gray-500">
                    Chuyển khoản ngân hàng
                  </span>
                </div>
                <p className="text-sm text-gray-400">Tạm thời chưa mở</p>
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                disabled={
                  !canSubmit || paymentMethod !== "cash" || isSubmitting
                }
                onClick={() => openConfirm("cash")}
                className="flex-1 bg-red-600 text-white py-4 rounded-lg font-semibold hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting && paymentMethod === "cash"
                  ? "Đang xử lý..."
                  : "Xác nhận"}
              </button>

              <button
                type="button"
                disabled={
                  !canSubmit || paymentMethod !== "momo" || isSubmitting
                }
                onClick={() => openConfirm("momo")}
                className="cursor-pointer flex-1 bg-blue-600 text-white py-4 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting && paymentMethod === "momo"
                  ? "Đang chuyển đến MoMo..."
                  : "Thanh toán MoMo"}
              </button>

              <button
                type="button"
                disabled={
                  !canSubmit || paymentMethod !== "card" || isSubmitting
                }
                onClick={() => openConfirm("card")}
                className="flex-1 bg-green-600 text-white py-4 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting && paymentMethod === "card"
                  ? "Đang xử lý..."
                  : "Thanh toán thẻ"}
              </button>
            </div>
          </div>
        </div>

        {/* Tour Summary Sidebar */}
        <div className="lg:sticky lg:top-8 h-fit">
          {tourDetail ? (
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-xl font-bold text-blue-600 mb-6 text-center">
                Thông tin đặt tour
              </h3>

              {tourDetail.thumbnail && (
                <img
                  src={tourDetail.thumbnail}
                  alt={tourDetail.title}
                  className="w-full h-48 object-cover rounded-lg mb-4 shadow-sm"
                />
              )}

              <div className="space-y-3 text-sm">
                <div>
                  <span className="font-semibold text-blue-600">Tên: </span>
                  <span className="text-gray-700">{tourDetail.title}</span>
                </div>

                {tourDetail.travelTimeId && (
                  <div>
                    <span className="font-semibold text-blue-600">
                      Thời gian:{" "}
                    </span>
                    <span className="text-gray-700">
                      {tourDetail.travelTimeId.day} ngày{" "}
                      {tourDetail.travelTimeId.night - 1} đêm
                    </span>
                  </div>
                )}

                {tourDetail.vehicleId && tourDetail.vehicleId.length > 0 && (
                  <div>
                    <span className="font-semibold text-blue-600">
                      Phương tiện:{" "}
                    </span>
                    <span className="text-gray-700">
                      {tourDetail.vehicleId.map((v) => v.name).join(" | ")}
                    </span>
                  </div>
                )}

                {tourDetail.hotelId && (
                  <div>
                    <span className="font-semibold text-blue-600">
                      Lưu trú:{" "}
                    </span>
                    <span className="text-gray-700">
                      Khách sạn {tourDetail.hotelId.star} sao
                    </span>
                  </div>
                )}

                {tourDetail.frequency && (
                  <div>
                    <span className="font-semibold text-blue-600">
                      Khởi hành:{" "}
                    </span>
                    <span className="text-gray-700">
                      {tourDetail.frequency.title}
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t border-gray-200">
                  <span className="font-semibold text-blue-600">
                    Tổng tiền:{" "}
                  </span>
                  <span className="text-red-600 font-bold text-lg">
                    {formatVND(totalPrice)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center text-gray-500">
              Đang tải thông tin tour...
            </div>
          )}
        </div>
      </div>

      {/* Confirm Modal */}
      <ConfirmModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleConfirm}
        message={
          confirmAction === "momo"
            ? "Bạn xác nhận thanh toán qua MoMo cho đơn đặt tour này?"
            : confirmAction === "card"
            ? "Bạn xác nhận thanh toán bằng thẻ cho đơn đặt tour này?"
            : "Bạn đồng ý đặt tour và thanh toán tại công ty?"
        }
      />
    </div>
  );
}
