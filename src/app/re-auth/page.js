"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export default function ReAuthPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");

  const handleReAuth = async () => {
    if (!email) return showToast("Vui lòng nhập email", "error");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/reAuth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        setUserId(data.userId);
        setStep(2);
        showToast(data.message, "success");
      } else {
        showToast(data.message || "Lỗi khi reAuth", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Lỗi server", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!userId || !email) return;

    try {
      const res = await fetch(`${API_BASE}/api/v1/user/resendOtp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, email, type: "register" }),
      });
      const data = await res.json();

      if (res.ok) {
        showToast(data.message + " - Tự động quay về trang chủ", "success");
        setTimeout(() => router.push("/"), 2000);
      } else {
        showToast(data.message || "Không thể gửi lại OTP", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Lỗi server", "error");
    }
  };

  const handleReInfo = async () => {
    if (!fullName || !password) {
      return showToast("Vui lòng nhập đầy đủ thông tin", "error");
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/reInfo`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, fullName, password }),
      });

      const data = await res.json();

      if (res.ok) {
        showToast(data.message, "success");
        setTimeout(() => router.push("/login"), 2000);
      } else {
        showToast(data.message || "Lỗi khi cập nhật thông tin", "error");
      }
    } catch (error) {
      console.error(error);
      showToast("Lỗi server", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-600 to-blue-400 relative overflow-hidden">
      <div className="absolute inset-0 bg-black/10"></div>

      <div className="relative bg-white/95 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md mx-4 animate-fadeIn">
        {step === 1 && (
          <>
            <h2 className="text-3xl font-bold text-center mb-8 text-cyan-700">
              Xác thực lại thông tin
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                />
              </div>

              <button
                onClick={handleReAuth}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? "Đang xử lý..." : "Gửi mã OTP"}
              </button>
            </div>

            <div className="mt-6 text-center">
              <Link
                href="/login"
                className="text-cyan-600 font-semibold hover:text-cyan-700 hover:underline"
              >
                ← Quay lại đăng nhập
              </Link>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-3xl font-bold text-center mb-8 text-cyan-700">
              Nhập mã OTP
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Mã OTP
                </label>
                <input
                  type="text"
                  placeholder="Nhập mã OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition text-center text-lg tracking-widest"
                />
              </div>

              <button
                onClick={() => {
                  setStep(3);
                  showToast("Vui lòng nhập thông tin tài khoản", "success");
                }}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Xác nhận OTP
              </button>

              <button
                onClick={handleResendOtp}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-lg transition-all duration-300"
              >
                Gửi lại mã OTP
              </button>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-3xl font-bold text-center mb-8 text-cyan-700">
              Hoàn tất thông tin
            </h2>

            <div className="space-y-5">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Họ và tên
                </label>
                <input
                  type="text"
                  placeholder="Nhập họ và tên"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                />
              </div>

              <button
                onClick={handleReInfo}
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-3 rounded-lg transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? "Đang xử lý..." : "Xác nhận thông tin"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
