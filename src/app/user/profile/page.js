"use client";

import { useEffect, useState } from "react";
import { User, Calendar, Phone, MapPin, Users } from "lucide-react";
import ProvinceSelect from "@/components/common/ProvinceSelect";
import WardSelect from "@/components/common/WardSelect";
import ImageUploader from "@/components/common/ImageUploader";
import LoadingModal from "@/components/common/LoadingModal";
import { useAuth } from "@/contexts/AuthContext"; // ← Import useAuth
import { useToast } from "@/contexts/ToastContext";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export default function UserProfilePage() {
  const { updateUser: updateAuthUser } = useAuth(); // ← Lấy updateUser từ context
  const { showToast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refetchUserData();
  }, []);

  const refetchUserData = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/users/profile`, {
        credentials: "include",
      });
      const data = res.ok ? await res.json() : null;
      setUser(data || null);
    } catch (error) {
      console.error("Không thể tải thông tin người dùng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    setSaving(true);

    try {
      const res = await fetch(`${API_BASE}/api/v1/users/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      const data = await res.json();

      if (!res.ok) {
        showToast(data?.message || "Cập nhật thất bại", "error");
        return;
      }

      if (data && (data._id || data.id || data.email)) {
        setUser(data);
        // ← Cập nhật vào AuthContext để layout tự động update
        updateAuthUser(data);
      } else {
        await refetchUserData();
      }

      showToast("Cập nhật thành công!", "success");
    } catch (err) {
      showToast(err.message || "Có lỗi xảy ra", "success");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600 dark:text-gray-400">Đang tải...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Upload Loading Modal */}
      <LoadingModal
        open={uploadLoading}
        message="Đang tải ảnh lên..."
        icon="Upload"
      />

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 md:p-8">
        <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800 dark:text-white">
          Thông tin cá nhân
        </h2>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col lg:flex-row gap-8"
        >
          {/* Avatar Section - Left Side */}
          <div className="flex flex-col items-center lg:w-48 gap-4">
            <div className="w-full">
              <ImageUploader
                onUpload={(url) => {
                  setUser({ ...user, avatar: url });
                  // ← Cập nhật avatar ngay vào AuthContext khi upload xong
                  updateAuthUser({ avatar: url });
                }}
                onUploadStart={() => setUploadLoading(true)}
                onUploadEnd={() => setUploadLoading(false)}
                multiple={false}
                showPreview={false}
                className="mb-4"
              />
            </div>

            <img
              src={user?.avatar || "/default-avatar.png"}
              alt="avatar"
              className="w-32 h-32 rounded-full object-cover border-4 border-gray-200 dark:border-gray-700 shadow-lg"
            />
          </div>

          {/* Form Fields - Right Side */}
          <div className="flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Họ & Tên */}
              <div className="flex flex-col">
                <label className="mb-2 font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <User
                    size={18}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  Họ & Tên
                </label>
                <input
                  type="text"
                  value={user?.fullName || ""}
                  onChange={(e) =>
                    setUser({ ...user, fullName: e.target.value })
                  }
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  placeholder="Nhập họ và tên"
                />
              </div>

              {/* Ngày sinh */}
              <div className="flex flex-col">
                <label className="mb-2 font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Calendar
                    size={18}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  Ngày sinh
                </label>
                <input
                  type="date"
                  value={user?.birthDay?.slice(0, 10) || ""}
                  onChange={(e) =>
                    setUser({ ...user, birthDay: e.target.value })
                  }
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                />
              </div>

              {/* Giới tính */}
              <div className="flex flex-col">
                <label className="mb-2 font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Users
                    size={18}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  Giới tính
                </label>
                <select
                  value={user?.sex || ""}
                  onChange={(e) => setUser({ ...user, sex: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="male">Nam</option>
                  <option value="female">Nữ</option>
                  <option value="other">Khác</option>
                </select>
              </div>

              {/* Số điện thoại */}
              <div className="flex flex-col">
                <label className="mb-2 font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Phone
                    size={18}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  Số điện thoại
                </label>
                <input
                  type="text"
                  value={user?.phone || ""}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  placeholder="Nhập số điện thoại"
                />
              </div>

              {/* Địa chỉ */}
              <div className="flex flex-col md:col-span-2">
                <label className="mb-2 font-medium flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <MapPin
                    size={18}
                    className="text-blue-600 dark:text-blue-400"
                  />
                  Địa chỉ
                </label>
                <input
                  type="text"
                  value={user?.address || ""}
                  onChange={(e) =>
                    setUser({ ...user, address: e.target.value })
                  }
                  className="px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition-all"
                  placeholder="Nhập địa chỉ chi tiết"
                />
              </div>

              {/* Tỉnh/Thành phố */}
              <div className="flex flex-col">
                <label className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Tỉnh/Thành phố
                </label>
                <ProvinceSelect
                  value={user?.province}
                  onChange={(p) =>
                    setUser((prev) => ({ ...prev, province: p, ward: null }))
                  }
                />
              </div>

              {/* Phường/Xã */}
              <div className="flex flex-col">
                <label className="mb-2 font-medium text-gray-700 dark:text-gray-300">
                  Phường/Xã
                </label>
                <WardSelect
                  provinceCode={user?.province?.code}
                  value={user?.ward}
                  onChange={(w) => setUser((prev) => ({ ...prev, ward: w }))}
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
              >
                {saving ? "Đang lưu..." : "Cập nhật"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
