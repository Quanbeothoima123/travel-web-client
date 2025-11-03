"use client";

import { useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const SetupModal = ({ onComplete }) => {
  const [formData, setFormData] = useState({
    userName: "",
    customName: "",
    isAnonymous: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/api/v1/user/profile/setup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Có lỗi xảy ra");
        setLoading(false);
        return;
      }

      onComplete(result);
    } catch (err) {
      setError("Không thể kết nối server");
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-[9999] animate-fadeIn">
      <div className="bg-white rounded-2xl p-6 sm:p-8 max-w-[480px] w-[90%] m-4 sm:m-0 shadow-[0_20px_60px_rgba(0,0,0,0.3)] animate-slideUp">
        <div className="text-center mb-8">
          <div className="text-4xl sm:text-5xl mb-3">🎉</div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
            Thiết lập tài khoản
          </h2>
          <p className="text-gray-600 text-sm">
            Vui lòng hoàn thiện thông tin để sử dụng tính năng Bạn bè
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Username */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="userName"
              className="font-semibold text-gray-800 text-sm"
            >
              Tên tài khoản <span className="text-red-500">*</span>
            </label>
            <input
              id="userName"
              type="text"
              value={formData.userName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  userName: e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, ""),
                }))
              }
              placeholder="vd: john_doe"
              minLength={3}
              maxLength={20}
              required
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] transition-all duration-200 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
            />
            <small className="text-gray-500 text-xs">
              Chỉ chứa chữ thường, số và dấu gạch dưới
            </small>
          </div>

          {/* Custom Name */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="customName"
              className="font-semibold text-gray-800 text-sm"
            >
              Tên hiển thị (không bắt buộc)
            </label>
            <input
              id="customName"
              type="text"
              value={formData.customName}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  customName: e.target.value,
                }))
              }
              placeholder="Tên bạn muốn người khác thấy"
              maxLength={50}
              className="px-4 py-3 border-2 border-gray-200 rounded-lg text-[15px] transition-all duration-200 focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
            />
          </div>

          {/* Anonymous Checkbox */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isAnonymous}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    isAnonymous: e.target.checked,
                  }))
                }
                className="mt-0.5 w-[18px] h-[18px] cursor-pointer"
              />
              <div>
                <span className="font-semibold text-gray-800 block mb-1">
                  Chế độ ẩn danh
                </span>
                <p className="text-gray-500 text-xs">
                  Nếu bật, bạn sẽ không xuất hiện trong tìm kiếm công khai
                </p>
              </div>
            </label>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              ⚠️ {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !formData.userName}
            className="py-3.5 bg-blue-500 text-white border-none rounded-lg text-base font-semibold cursor-pointer transition-all duration-200 hover:bg-blue-600 hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)] disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
          >
            {loading ? "Đang lưu..." : "Hoàn tất"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SetupModal;
