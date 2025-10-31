"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:5000";

export default function WardSelect({
  provinceCode,
  value,
  onChange,
  placeholder = "Chọn phường/xã…",
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [wards, setWards] = useState([]);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (!ref.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && open) setOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [open]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!provinceCode) {
        setWards([]);
        return;
      }
      setLoading(true);
      try {
        const res = await fetch(`${API_BASE}/api/v1/wards/${provinceCode}`, {
          credentials: "include",
        });
        const data = await res.json();
        if (mounted) setWards(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [provinceCode]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle) return wards;
    return wards.filter((w) =>
      w.name_with_type?.toLowerCase().includes(needle)
    );
  }, [wards, q]);

  const pick = (w) => {
    onChange?.(w);
    setOpen(false);
    setQ("");
  };

  const disabled = !provinceCode;

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
      <div
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`
          flex items-center justify-between gap-2 
          border rounded-lg px-3 py-2.5 
          cursor-pointer transition-all duration-200
          ${disabled ? "pointer-events-none" : ""}
        `}
        style={{
          borderColor: open ? "var(--color-primary)" : "var(--color-border)",
          backgroundColor: "var(--color-bg-card)",
          boxShadow: open
            ? "0 0 0 3px rgba(0, 0, 128, 0.12)"
            : "var(--shadow-sm)",
        }}
      >
        <span
          className={`flex-1 whitespace-nowrap overflow-hidden text-ellipsis ${
            value ? "font-medium" : ""
          }`}
          style={{
            color: value ? "var(--color-text)" : "var(--color-text-muted)",
          }}
        >
          {value ? value.name_with_type : placeholder}
        </span>
        <span
          className={`text-sm transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
          style={{ color: "var(--color-text-secondary)" }}
        >
          ▾
        </span>
      </div>

      {open && !disabled && (
        <div
          className="absolute top-full left-0 right-0 mt-1.5 z-50 rounded-lg border overflow-hidden flex flex-col max-h-[360px] animate-fadeIn"
          style={{
            backgroundColor: "var(--color-bg-card)",
            borderColor: "var(--color-border)",
            boxShadow: "var(--shadow-md)",
          }}
        >
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
              placeholder="Tìm phường/xã…"
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
                Không có phường/xã phù hợp
              </div>
            ) : (
              <ul className="m-0 p-0 list-none">
                {filtered.map((w) => (
                  <li key={w.code}>
                    <button
                      type="button"
                      onClick={() => pick(w)}
                      title={w.name_with_type}
                      className={`
                        w-full text-left px-3 py-2.5 text-sm
                        whitespace-nowrap overflow-hidden text-ellipsis
                        border-none bg-transparent cursor-pointer
                        transition-all duration-200
                        ${value?.code === w.code ? "font-semibold" : ""}
                      `}
                      style={{
                        color:
                          value?.code === w.code
                            ? "var(--color-primary)"
                            : "var(--color-text)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor =
                          "var(--color-card-bg)";
                        if (value?.code !== w.code) {
                          e.currentTarget.style.color = "var(--color-primary)";
                        }
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = "transparent";
                        if (value?.code !== w.code) {
                          e.currentTarget.style.color = "var(--color-text)";
                        }
                      }}
                    >
                      {w.name_with_type}
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
