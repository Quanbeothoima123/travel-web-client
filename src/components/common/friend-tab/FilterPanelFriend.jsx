"use client";

import { useState } from "react";
import { Search, ChevronDown } from "lucide-react";
import ProvinceSelect from "@/components/common/ProvinceSelect";
import WardSelect from "@/components/common/WardSelect";

const FilterPanelFriend = ({ filters, onChange, onReset }) => {
  const [isOpen, setIsOpen] = useState(false);

  // State để lưu province và ward object đầy đủ
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedWard, setSelectedWard] = useState(null);

  const handleProvinceChange = (province) => {
    setSelectedProvince(province);
    setSelectedWard(null); // Reset ward khi đổi province

    // Gửi code lên parent
    onChange({
      ...filters,
      province: province?.code || "",
      ward: "", // Reset ward filter
    });
  };

  const handleWardChange = (ward) => {
    setSelectedWard(ward);

    // Gửi code lên parent
    onChange({
      ...filters,
      ward: ward?.code || "",
    });
  };

  const handleReset = () => {
    setSelectedProvince(null);
    setSelectedWard(null);
    onReset();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl mb-5 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3.5 flex items-center gap-2.5 bg-transparent border-none cursor-pointer transition-colors duration-200 hover:bg-gray-50"
      >
        <Search className="w-4 h-4 text-gray-600" />
        <span className="flex-1 text-left font-semibold text-gray-800 text-[15px]">
          Bộ lọc
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="px-4 py-4 border-t border-gray-200 flex flex-col gap-4 animate-slideDown">
          {/* Tìm theo tên */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-semibold text-gray-700 mb-0.5">
              Tên tài khoản
            </label>
            <input
              type="text"
              placeholder="Tìm theo tên tài khoản..."
              value={filters.userName}
              onChange={(e) =>
                onChange({ ...filters, userName: e.target.value })
              }
              className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm transition-all duration-200 box-border focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
            />
          </div>

          {/* Province và Ward */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700 mb-0.5">
                Tỉnh/Thành phố
              </label>
              <ProvinceSelect
                value={selectedProvince}
                onChange={handleProvinceChange}
                placeholder="Chọn tỉnh/thành phố"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700 mb-0.5">
                Phường/Xã
              </label>
              <WardSelect
                provinceCode={selectedProvince?.code}
                value={selectedWard}
                onChange={handleWardChange}
                placeholder="Chọn phường/xã"
              />
            </div>
          </div>

          {/* Năm sinh và Giới tính */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700 mb-0.5">
                Năm sinh
              </label>
              <input
                type="number"
                placeholder="VD: 1990"
                value={filters.birthYear}
                onChange={(e) =>
                  onChange({ ...filters, birthYear: e.target.value })
                }
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm transition-all duration-200 box-border focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
                min="1900"
                max={new Date().getFullYear()}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[13px] font-semibold text-gray-700 mb-0.5">
                Giới tính
              </label>
              <select
                value={filters.sex}
                onChange={(e) => onChange({ ...filters, sex: e.target.value })}
                className="w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-sm transition-all duration-200 box-border focus:outline-none focus:border-blue-500 focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1)]"
              >
                <option value="">Tất cả</option>
                <option value="male">Nam</option>
                <option value="female">Nữ</option>
                <option value="other">Khác</option>
              </select>
            </div>
          </div>

          {/* Reset button */}
          <button
            onClick={handleReset}
            className="w-full px-4 py-2.5 bg-transparent border border-gray-300 rounded-lg text-sm text-gray-600 cursor-pointer transition-all duration-200 font-medium mt-1 hover:bg-gray-50 hover:text-gray-800 hover:border-blue-500"
          >
            Đặt lại bộ lọc
          </button>
        </div>
      )}
    </div>
  );
};

export default FilterPanelFriend;
