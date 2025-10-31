// src/components/booking/ProvinceSelect.jsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export default function ProvinceSelect({
  value,
  onChange,
  placeholder = "Chọn tỉnh/thành phố…",
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [provinces, setProvinces] = useState([]);
  const ref = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Fetch provinces
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/v1/province/getAll`, {
          credentials: "include",
        });
        const data = await res.json();
        if (mounted) setProvinces(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Filter provinces based on search query
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return provinces;
    return provinces.filter((p) =>
      p.name_with_type?.toLowerCase().includes(needle)
    );
  }, [provinces, q]);

  const pick = (p) => {
    onChange?.(p);
    setOpen(false);
  };

  return (
    <div className="relative w-full" ref={ref}>
      {/* Control (Select Box) */}
      <div
        className={`
          flex items-center justify-between gap-2
          border rounded-lg px-3 py-2.5
          bg-white cursor-pointer
          transition-all duration-200
          shadow-sm
          ${
            open
              ? "border-primary ring-4 ring-primary/10"
              : "border-gray-200 hover:border-gray-300"
          }
        `}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className={`
          flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis text-sm
          ${value ? "text-gray-900 font-medium" : "text-gray-400"}
        `}
        >
          {value ? value.name_with_type : placeholder}
        </span>
        <span
          className={`
          text-gray-400 text-sm transition-transform duration-200
          ${open ? "rotate-180" : ""}
        `}
        >
          ▾
        </span>
      </div>

      {/* Dropdown Menu */}
      {open && (
        <div
          className="
          absolute top-[calc(100%+6px)] left-0 right-0 z-50
          bg-white border border-gray-200 rounded-lg
          shadow-lg
          max-h-[360px] overflow-hidden
          flex flex-col
          animate-fadeIn
        "
        >
          {/* Search Bar */}
          <div className="p-2 border-b border-gray-100 bg-white">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm tỉnh/thành…"
              className="
                w-full border border-gray-200 rounded-md
                px-3 py-2 text-sm
                bg-gray-50 text-gray-900
                outline-none
                transition-all duration-200
                focus:border-primary focus:ring-4 focus:ring-primary/10
              "
            />
          </div>

          {/* List */}
          <div className="overflow-auto flex-1 py-1">
            {loading ? (
              <div className="px-4 py-3 text-center text-sm text-gray-400">
                Đang tải…
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-3 text-center text-sm text-gray-400">
                Không có tỉnh/thành phù hợp
              </div>
            ) : (
              <ul className="list-none m-0 p-0">
                {filtered.map((p) => (
                  <li key={p.code}>
                    <button
                      type="button"
                      className="
                        w-full text-left px-4 py-2.5
                        text-sm text-gray-700
                        transition-all duration-200
                        hover:bg-primary hover:text-white hover:font-medium
                        focus:outline-none focus:bg-primary focus:text-white
                        whitespace-nowrap overflow-hidden text-ellipsis
                      "
                      onClick={() => pick(p)}
                      title={p.name_with_type}
                    >
                      {p.name_with_type}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
