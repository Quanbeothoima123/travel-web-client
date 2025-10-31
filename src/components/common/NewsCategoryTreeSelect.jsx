"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export default function NewsCategoryTreeSelect({
  value,
  onChange,
  fetchUrl = `${API_BASE}/api/v1/news-category/getAll?tree=true`,
  placeholder = "Chọn danh mục tour",
  noDataText = "Không có danh mục",
}) {
  const [open, setOpen] = useState(false);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const wrapRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(fetchUrl, { credentials: "include" });
        const data = await res.json();
        if (mounted) setTree(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => (mounted = false);
  }, [fetchUrl]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const filteredTree = useMemo(() => {
    if (!q.trim()) return tree;
    const needle = q.trim().toLowerCase();

    const filterRec = (nodes) => {
      const out = [];
      for (const n of nodes) {
        const match = n.title?.toLowerCase().includes(needle);
        const kids = Array.isArray(n.children) ? filterRec(n.children) : [];
        if (match || kids.length) {
          out.push({ ...n, children: kids });
        }
      }
      return out;
    };
    return filterRec(tree);
  }, [tree, q]);

  const handlePick = (node) => {
    onChange?.(node);
    setOpen(false);
  };

  function findTitleById(nodes, id) {
    for (const n of nodes) {
      if (n._id === id) return n.title;
      if (n.children) {
        const found = findTitleById(n.children, id);
        if (found) return found;
      }
    }
    return "";
  }

  return (
    <div className="relative w-full text-sm text-[--color-text]" ref={wrapRef}>
      {/* Control */}
      <div
        className={`flex items-center justify-between gap-2 border rounded-lg py-2.5 px-3 bg-[--color-bg-card] cursor-pointer transition-all duration-200 shadow-sm ${
          open
            ? "border-primary shadow-[0_0_0_3px_rgba(0,0,128,0.12)]"
            : "border-[--color-border] hover:border-[--color-border-light]"
        }`}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className={`whitespace-nowrap overflow-hidden text-ellipsis flex-1 min-w-0 ${
            value
              ? "text-[--color-text] font-medium"
              : "text-[--color-text-muted]"
          }`}
        >
          {value
            ? value.title || findTitleById(tree, value._id) || placeholder
            : placeholder}
        </span>
        <span
          className={`ml-2.5 text-[--color-text-secondary] text-[0.95em] leading-none pointer-events-none transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </div>

      {/* Menu Dropdown */}
      {open && (
        <div className="bg-white absolute top-[calc(100%+6px)] left-0 right-0 z-60 bg-[--color-bg-card] border border-[--color-border] rounded-lg shadow-md max-h-[360px] overflow-hidden flex flex-col transition-all duration-300 opacity-100 max-md:max-h-[250px]">
          {/* Search */}
          <div className="p-2 border-b border-[--color-border-light] bg-[--color-bg-card]">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm danh mục…"
              className="w-full border border-[--color-border] rounded py-2 px-2.5 text-sm bg-[--color-bg] text-[--color-text] outline-none transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(0,0,128,0.08)]"
            />
          </div>

          {/* List */}
          <div className="overflow-auto flex-1 py-1">
            {loading ? (
              <div className="py-3.5 text-[--color-text-muted] text-center text-sm">
                Đang tải…
              </div>
            ) : filteredTree.length === 0 ? (
              <div className="py-3.5 text-[--color-text-muted] text-center text-sm">
                {noDataText}
              </div>
            ) : (
              <TreeList nodes={filteredTree} onPick={handlePick} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== TreeList Component ====================
function TreeList({ nodes, onPick, depth = 0 }) {
  return (
    <ul className="list-none m-0 p-0">
      {nodes.map((n) => (
        <TreeNode key={n._id} node={n} onPick={onPick} depth={depth} />
      ))}
    </ul>
  );
}

// ==================== TreeNode Component ====================
function TreeNode({ node, onPick, depth }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  return (
    <li className="m-0">
      <div
        className="flex items-center rounded transition-all duration-200 cursor-pointer text-[--color-text] min-h-10 box-border hover:bg-primary hover:text-white max-md:min-h-9"
        style={{
          paddingLeft: `calc(12px + (${depth} * 16px))`,
          paddingRight: "12px",
        }}
      >
        {/* Toggle button */}
        {hasChildren ? (
          <button
            type="button"
            className="inline-flex items-center justify-center w-5 h-5 shrink-0 mr-1.5 rounded border border-[--color-border] bg-[--color-bg-card] cursor-pointer p-0 relative transition-all duration-150 hover:bg-[--color-bg-secondary] hover:border-[--color-border-light] focus:outline-none focus:shadow-[0_0_0_3px_rgba(0,0,128,0.08)]"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            aria-label="toggle"
          >
            <span
              className={`absolute w-1.5 h-1.5 top-1/2 left-1/2 transition-all duration-150 ${
                expanded
                  ? "-translate-x-1/2 -translate-y-1/2 rotate-45 border-r-2 border-b-2 border-primary"
                  : "-translate-x-1/2 -translate-y-1/2 -rotate-45 border-r-2 border-b-2 border-[--color-text-secondary]"
              }`}
            />
          </button>
        ) : (
          <span className="w-[18px] h-[18px] shrink-0 mr-1.5 rounded bg-transparent" />
        )}

        {/* Label */}
        <button
          type="button"
          className="block flex-1 w-full text-left appearance-none border-none bg-transparent cursor-pointer m-0 rounded whitespace-nowrap overflow-hidden text-ellipsis text-sm no-underline hover:font-medium"
          onClick={() => onPick(node)}
          title={node.title}
        >
          {node.title}
        </button>
      </div>

      {/* Children */}
      {hasChildren && expanded && (
        <TreeList nodes={node.children} onPick={onPick} depth={depth + 1} />
      )}
    </li>
  );
}
