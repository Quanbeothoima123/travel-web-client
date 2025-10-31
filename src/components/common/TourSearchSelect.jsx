"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function TourSearchSelect({
  categorySlug, // slug category đã chọn
  value, // { slug, title } | null
  onChange, // (tour) => void
  placeholder = "Chọn tour…",
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [tours, setTours] = useState([]);
  const ref = useRef(null);

  // Đóng khi click ngoài
  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  // Đóng khi nhấn ESC
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  // Fetch khi categorySlug đổi
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!categorySlug) {
        setTours([]);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(
          `${API_BASE}/api/v1/tours/tour-list-by-category/${categorySlug}`,
          {
            credentials: "include",
          }
        );
        const data = await res.json();
        if (mounted) setTours(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [categorySlug]);

  // Filter tours theo search query
  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return tours;
    return tours.filter((t) => t.title?.toLowerCase().includes(needle));
  }, [tours, q]);

  const pick = (t) => {
    onChange?.(t);
    setOpen(false);
    setQ(""); // Reset search
  };

  const disabled = !categorySlug;

  return (
    <div
      ref={ref}
      className={`relative w-full text-sm ${
        disabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
      style={{
        fontFamily: "var(--font-family-sans)",
        color: "var(--color-text)",
      }}
    >
      {/* Control (Select Box) */}
      <div
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`
          flex items-center justify-between gap-2 
          border rounded-lg px-3 py-2.5 
          cursor-pointer transition-all duration-200
          ${disabled ? "pointer-events-none" : ""}
          ${open ? "border-primary" : ""}
        `}
        style={{
          borderColor: open ? "var(--color-primary)" : "var(--color-border)",
          backgroundColor: "var(--color-bg-card)",
          boxShadow: open
            ? "0 0 0 3px rgba(0, 0, 128, 0.12)"
            : "var(--shadow-sm)",
        }}
      >
        {/* Placeholder/Value */}
        <span
          className={`flex-1 whitespace-nowrap overflow-hidden text-ellipsis ${
            value ? "font-medium" : ""
          }`}
          style={{
            color: value ? "var(--color-text)" : "var(--color-text-muted)",
          }}
        >
          {value ? value.title : placeholder}
        </span>

        {/* Caret */}
        <span
          className={`text-sm transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          style={{ color: "var(--color-text-secondary)" }}
        >
          ▾
        </span>
      </div>

      {/* Menu (Dropdown) */}
      {open && !disabled && (
        <div
          className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-lg border overflow-hidden flex flex-col max-h-[360px] animate-fadeIn"
          style={{
            backgroundColor: "var(--color-bg-card)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          {/* Search Bar */}
          <div
            className="p-2 border-b"
            style={{
              backgroundColor: "var(--color-bg-card)",
              borderColor: "var(--color-border)",
            }}
          >
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm tour…"
              className="w-full border rounded px-2.5 py-2 text-sm outline-none transition-all duration-200"
              style={{
                borderColor: "var(--color-border)",
                backgroundColor: "var(--color-bg)",
                color: "var(--color-text)",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "var(--color-primary)";
                e.currentTarget.style.boxShadow =
                  "0 0 0 3px rgba(0, 0, 128, 0.08)";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            />
          </div>

          {/* List */}
          <div className="overflow-auto flex-1 py-1">
            {loading ? (
              <div
                className="text-center py-3.5 text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                Đang tải…
              </div>
            ) : filtered.length === 0 ? (
              <div
                className="text-center py-3.5 text-sm"
                style={{ color: "var(--color-text-muted)" }}
              >
                Không có tour phù hợp
              </div>
            ) : (
              <ul className="m-0 p-0 list-none">
                {filtered.map((t) => (
                  <li key={t.slug}>
                    <button
                      type="button"
                      onClick={() => pick(t)}
                      title={t.title}
                      className={`
                        w-full text-left px-3 py-2.5 text-sm
                        whitespace-nowrap overflow-hidden text-ellipsis
                        border-none bg-transparent cursor-pointer
                        transition-all duration-200
                        ${value?.slug === t.slug ? "font-semibold" : ""}
                      `}
                      style={{
                        color:
                          value?.slug === t.slug
                            ? "var(--color-primary)"
                            : "var(--color-text)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--color-card-bg)";
                        if (value?.slug !== t.slug) {
                          e.currentTarget.style.color = "var(--color-primary)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        if (value?.slug !== t.slug) {
                          e.currentTarget.style.color = "var(--color-text)";
                        }
                      }}
                    >
                      {t.title}
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
