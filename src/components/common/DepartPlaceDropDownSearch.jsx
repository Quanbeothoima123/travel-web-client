"use client";

import React, { useEffect, useState, useRef } from "react";
import { ChevronDown, X, Loader2 } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export default function DepartPlaceDropDownSearch({
  handleChangeValue,
  apiUrl = "/api/v1/depart-place/getAll",
  placeholder = "-- Chọn điểm khởi hành --",
  defaultValue = null,
}) {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  useEffect(() => {
    const fetchDepartPlaces = async () => {
      setLoading(true);
      try {
        const res = await fetch(API_BASE + apiUrl);
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped = data.map((item) => ({
            value: item._id,
            label: item.name,
            description: item.description,
            googleDirection: item.googleDirection,
          }));
          setOptions(mapped);
        }
      } catch (err) {
        console.error("Error fetching depart places:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDepartPlaces();
  }, [apiUrl]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    setSearchTerm("");
    if (handleChangeValue) {
      handleChangeValue(option ? option.value : null);
    }
  };

  const handleClear = (e) => {
    e.stopPropagation();
    setSelected(null);
    setSearchTerm("");
    if (handleChangeValue) {
      handleChangeValue(null);
    }
  };

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="mb-4">
      <label className="block font-semibold mb-2 text-gray-800 dark:text-gray-200">
        Điểm khởi hành
      </label>

      <div className="relative" ref={dropdownRef}>
        {/* Select Button */}
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full min-h-[42px] px-3 py-2 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm transition-all duration-200 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/25 focus:border-blue-500 flex items-center justify-between"
        >
          <span
            className={
              selected
                ? "text-gray-900 dark:text-gray-100"
                : "text-gray-400 dark:text-gray-500 text-sm"
            }
          >
            {selected ? selected.label : placeholder}
          </span>

          <div className="flex items-center gap-2">
            {loading && (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            )}
            {selected && !loading && (
              <X
                className="w-4 h-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                onClick={handleClear}
              />
            )}
            <ChevronDown
              className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </div>
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
            {/* Search Input */}
            <div className="p-2 border-b border-gray-200 dark:border-gray-700">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/25"
                onClick={(e) => e.stopPropagation()}
              />
            </div>

            {/* Options List */}
            <div className="overflow-y-auto max-h-48">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option) => (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={`px-3 py-2 cursor-pointer transition-colors duration-150 ${
                      selected?.value === option.value
                        ? "bg-blue-500 text-white"
                        : "text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-500 dark:hover:text-blue-400"
                    }`}
                  >
                    <div className="text-sm font-medium">{option.label}</div>
                    {option.description && (
                      <div
                        className={`text-xs mt-0.5 ${
                          selected?.value === option.value
                            ? "text-blue-100"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {option.description}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
                  Không tìm thấy kết quả
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
