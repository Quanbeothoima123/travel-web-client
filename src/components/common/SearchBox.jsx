// components/common/SearchBox.jsx
import React, { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "https://localhost:5000";

export default function SearchBox({ initialValue = "", onSearch }) {
  const [input, setInput] = useState(initialValue);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef(null);

  useEffect(() => {
    setInput(initialValue);
  }, [initialValue]);

  useEffect(() => {
    if (!input || input.length < 2) {
      setResults([]);
      return;
    }

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/api/v1/tours/search-combined?query=${input}`
        );
        const data = await res.json();
        setResults(data.data || []);
        setShowDropdown(true);
      } catch (err) {
        console.error("Error searching tours:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [input]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    if (onSearch) onSearch(value);
  };

  const handleResultClick = () => {
    setShowDropdown(false);
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--color-text-muted)] pointer-events-none" />
        <input
          type="text"
          className="w-full pl-10 pr-4 py-3 border border-[var(--color-border)] rounded-lg bg-[var(--color-bg)] text-[var(--color-text)] placeholder:text-[var(--color-text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-2 focus:ring-[var(--color-primary)]/20 transition-all"
          placeholder="Tìm tour..."
          value={input}
          onChange={handleInputChange}
          onFocus={() => results.length > 0 && setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
        />
      </div>

      {showDropdown && (results.length > 0 || loading) && (
        <ul className="absolute top-full left-0 right-0 mt-2 bg-white border border-[var(--color-border)] rounded-lg shadow-lg max-h-[260px] overflow-y-auto z-50">
          {loading
            ? Array.from({ length: 4 }).map((_, idx) => (
                <li
                  key={idx}
                  className="flex items-center p-3 gap-3 animate-pulse"
                >
                  <div className="w-10 h-10 bg-gray-200 rounded"></div>
                  <div className="flex-1 h-4 bg-gray-200 rounded"></div>
                </li>
              ))
            : results.map((tour) => (
                <li
                  key={tour.slug}
                  className="hover:bg-[var(--color-card-bg)] transition-colors"
                >
                  <a
                    href={`/tour/${tour.slug}`}
                    className="flex items-center p-3 gap-3"
                    onClick={handleResultClick}
                  >
                    <img
                      src={tour.thumbnail}
                      alt={tour.title}
                      className="w-10 h-10 rounded object-cover flex-shrink-0"
                    />
                    <span className="text-sm font-medium text-[var(--color-text)] line-clamp-2">
                      {tour.title}
                    </span>
                  </a>
                </li>
              ))}
        </ul>
      )}
    </div>
  );
}
