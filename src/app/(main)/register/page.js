"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
const OTP_FLOW = "register";

export default function RegisterPage() {
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    birthDay: "",
    sex: "",
    address: "",
  });
  const [step, setStep] = useState("register");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(null);
  const [regEmail, setRegEmail] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);
  const [isScanning, setIsScanning] = useState(false);
  const [showCccdUpload, setShowCccdUpload] = useState(false);

  const fileInputRef = useRef(null);
  const { showToast } = useToast();
  const router = useRouter();

  // Countdown timer
  useEffect(() => {
    if (resendCountdown <= 0) return;
    const timer = setInterval(() => {
      setResendCountdown((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCountdown]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Xử lý upload và OCR CCCD
  const handleCccdUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng file
    if (!file.type.startsWith("image/")) {
      showToast("Vui lòng chọn file ảnh", "error");
      return;
    }

    setIsScanning(true);
    const formData = new FormData();
    formData.append("cccdImage", file);

    try {
      const res = await fetch(`${API_BASE}/api/v1/cccd/extract-cccd`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.code === 200) {
        // Tự động điền thông tin vào form
        setForm((prev) => ({
          ...prev,
          fullName: data.data.fullName || prev.fullName,
          birthDay: data.data.birthDay || prev.birthDay,
          sex: data.data.sex || prev.sex,
          address: data.data.address || prev.address,
        }));
        showToast("Đã quét thông tin CCCD thành công!", "success");
        setShowCccdUpload(false);
      } else {
        showToast(data.message || "Không thể đọc thông tin CCCD", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Lỗi khi xử lý ảnh CCCD", "error");
    } finally {
      setIsScanning(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Submit đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate client-side
    if (form.fullName.trim().length < 2) {
      showToast("Họ tên phải có ít nhất 2 ký tự", "error");
      return;
    }
    if (form.password.length < 6) {
      showToast("Mật khẩu phải có ít nhất 6 ký tự", "error");
      return;
    }
    if (!form.birthDay) {
      showToast("Vui lòng nhập ngày sinh", "error");
      return;
    }
    if (!form.sex) {
      showToast("Vui lòng chọn giới tính", "error");
      return;
    }
    if (form.address.trim().length < 5) {
      showToast("Địa chỉ phải có ít nhất 5 ký tự", "error");
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (res.ok && data.code === 200) {
        setUserId(data.userId);
        setRegEmail(data.email || form.email);
        setStep("otp");
        setResendCountdown(60);
        showToast(
          data.message || "Vui lòng nhập mã OTP để xác thực",
          "success"
        );
      } else {
        showToast(data.message || "Đăng ký thất bại", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Lỗi server", "error");
    }
  };

  // Xác thực OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp, type: OTP_FLOW }),
      });
      const data = await res.json();

      if (res.ok && data.code === 200) {
        showToast("Xác thực thành công, sẽ chuyển về trang chủ...", "success");
        setTimeout(() => router.push("/"), 3000);
      } else {
        showToast(data.message || "Xác thực thất bại", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Lỗi server", "error");
    }
  };

  // Gửi lại OTP
  const handleResendOtp = async () => {
    try {
      const payload = { userId, email: regEmail, type: OTP_FLOW };
      const res = await fetch(`${API_BASE}/api/v1/auth/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (res.ok && data.code === 200) {
        showToast("Đã gửi lại OTP, vui lòng kiểm tra email", "success");
        setResendCountdown(60);
      } else {
        showToast(data.message || "Không thể gửi lại OTP", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Lỗi server", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-600 to-blue-400 relative overflow-hidden py-8">
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="relative bg-white/95 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-2xl mx-4 max-h-[95vh] overflow-y-auto">
        {/* STEP 1: Register Form */}
        {step === "register" && (
          <>
            <h2 className="text-3xl font-bold text-center mb-6 text-cyan-700">
              Đăng ký tài khoản
            </h2>

            {/* Nút quét CCCD */}
            <div className="mb-6 text-center">
              <button
                type="button"
                onClick={() => setShowCccdUpload(!showCccdUpload)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                {showCccdUpload ? "Ẩn quét CCCD" : "Quét nhanh bằng CCCD"}
              </button>
            </div>

            {/* Upload CCCD */}
            {showCccdUpload && (
              <div className="mb-6 p-4 bg-purple-50 rounded-lg border-2 border-dashed border-purple-300">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleCccdUpload}
                  disabled={isScanning}
                  className="hidden"
                  id="cccd-upload"
                />
                <label
                  htmlFor="cccd-upload"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  {isScanning ? (
                    <div className="flex items-center gap-2 text-purple-600">
                      <svg
                        className="animate-spin h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="font-semibold">Đang quét CCCD...</span>
                    </div>
                  ) : (
                    <>
                      <svg
                        className="w-12 h-12 text-purple-400 mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                        />
                      </svg>
                      <p className="text-sm font-semibold text-purple-600 mb-1">
                        Nhấn để tải ảnh CCCD
                      </p>
                      <p className="text-xs text-gray-500">
                        Hỗ trợ JPG, PNG (tối đa 5MB)
                      </p>
                    </>
                  )}
                </label>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Họ tên */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ tên đầy đủ"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                />
              </div>

              {/* Email & Password - 2 cột */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="email@example.com"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Tối thiểu 6 ký tự"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  />
                </div>
              </div>

              {/* Ngày sinh & Giới tính - 2 cột */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Ngày sinh <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="birthDay"
                    value={form.birthDay}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-2">
                    Giới tính <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="sex"
                    value={form.sex}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition bg-white"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              {/* Địa chỉ */}
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Địa chỉ <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Nhập địa chỉ thường trú"
                  required
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition resize-none"
                />
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Đăng ký
              </button>

              {/* Xác thực tài khoản */}
              <div className="flex justify-center mt-4">
                <Link
                  href="/re-auth"
                  className="inline-block px-4 py-2 bg-gray-300 hover:bg-gray-400 text-red-600 font-bold text-sm rounded-lg transition-colors"
                >
                  Xác thực tài khoản
                </Link>
              </div>
            </form>

            {/* Link đăng nhập */}
            <div className="mt-6 text-center">
              <p className="text-gray-600">
                Đã có tài khoản?{" "}
                <Link
                  href="/login"
                  className="text-cyan-600 font-semibold hover:text-cyan-700 hover:underline"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>
          </>
        )}

        {/* STEP 2: OTP Verification */}
        {step === "otp" && (
          <>
            <h2 className="text-3xl font-bold text-center mb-6 text-cyan-700">
              Xác thực OTP
            </h2>

            <p className="text-center text-sm text-gray-600 mb-6 opacity-90">
              Mã OTP đã gửi đến <span className="font-bold">{regEmail}</span>,
              có hiệu lực trong 5 phút.
            </p>

            <form onSubmit={handleVerifyOtp} className="space-y-5">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Nhập mã OTP
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Nhập mã OTP"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-center text-lg tracking-widest"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Xác thực OTP
              </button>
            </form>

            <button
              type="button"
              onClick={handleResendOtp}
              disabled={resendCountdown > 0}
              className="w-full mt-3 bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 rounded-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
              title={
                resendCountdown > 0 ? `Vui lòng đợi ${resendCountdown}s` : ""
              }
            >
              {resendCountdown > 0
                ? `Gửi lại OTP (${resendCountdown}s)`
                : "Gửi lại OTP"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
