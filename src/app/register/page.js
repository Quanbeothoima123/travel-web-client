"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/contexts/ToastContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
const OTP_FLOW = "register";

export default function RegisterPage() {
  const [form, setForm] = useState({ fullName: "", email: "", password: "" });
  const [step, setStep] = useState("register");
  const [otp, setOtp] = useState("");
  const [userId, setUserId] = useState(null);
  const [regEmail, setRegEmail] = useState("");
  const [resendCountdown, setResendCountdown] = useState(0);

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

  // Submit đăng ký
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_BASE}/api/v1/user/register`, {
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
      const res = await fetch(`${API_BASE}/api/v1/user/auth`, {
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
      const res = await fetch(`${API_BASE}/api/v1/user/resendOtp`, {
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-cyan-600 to-blue-400 relative overflow-hidden">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-black/10"></div>

      {/* Auth Card */}
      <div className="relative bg-white/95 backdrop-blur-sm p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-md mx-4">
        {/* STEP 1: Register Form */}
        {step === "register" && (
          <>
            <h2 className="text-3xl font-bold text-center mb-8 text-cyan-700 cursor-pointer">
              Đăng ký
            </h2>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Họ và tên
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={form.fullName}
                  onChange={handleChange}
                  placeholder="Nhập họ tên"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="Nhập email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-2">
                  Mật khẩu
                </label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Nhập mật khẩu"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-3 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl cursor-pointer"
              >
                Đăng ký
              </button>

              <div className="flex justify-center mt-4">
                <Link
                  href="/re-auth"
                  className="cursor-pointer inline-block px-4 py-2 bg-gray-300 hover:bg-gray-400 text-red-600 font-bold text-sm rounded-lg transition-colors"
                >
                  Xác thực tài khoản
                </Link>
              </div>
            </form>

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
