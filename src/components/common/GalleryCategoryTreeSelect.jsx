"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

export default function GalleryCategoryTreeSelect({
  value,
  onChange,
  fetchUrl = `${API_BASE}/api/v1/gallery-category/getAll?tree=true`,
  placeholder = "Chọn danh mục gallery",
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
        const res = await fetch(fetchUrl);
        const data = await res.json();

        // Handle different response formats
        let categories = [];
        if (Array.isArray(data)) {
          categories = data;
        } else if (data.data && Array.isArray(data.data)) {
          categories = data.data;
        } else if (data.categories && Array.isArray(data.categories)) {
          categories = data.categories;
        }

        if (mounted) setTree(categories);
      } catch (e) {
        console.error("Error fetching gallery categories:", e);
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
    <div className="relative w-full text-sm" ref={wrapRef}>
      {/* Control */}
      <div
        className={`flex items-center justify-between gap-2 border rounded-lg px-3 py-2.5 bg-white cursor-pointer transition-all duration-200 shadow-sm ${
          open
            ? "border-primary shadow-[0_0_0_3px_rgba(76,132,216,0.12)]"
            : "border-[--color-border] hover:border-gray-300"
        }`}
        onClick={() => setOpen((o) => !o)}
      >
        <span
          className={`flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis ${
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
          className={`ml-2.5 text-[--color-text-secondary] text-sm transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        >
          ▾
        </span>
      </div>

      {/* Menu */}
      {open && (
        <div className="absolute top-[calc(100%+6px)] left-0 right-0 z-60 bg-white border border-[--color-border] rounded-lg shadow-lg max-h-[360px] overflow-hidden flex flex-col transition-all duration-300 opacity-100">
          {/* Search */}
          <div className="p-2 border-b border-gray-200 bg-white">
            <input
              type="text"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm danh mục…"
              className="w-full border border-[--color-border] rounded px-2.5 py-2 outline-none text-sm bg-[--color-bg] text-[--color-text] transition-all duration-200 focus:border-primary focus:shadow-[0_0_0_3px_rgba(76,132,216,0.08)]"
            />
          </div>

          {/* List */}
          <div className="overflow-auto flex-1 py-1">
            {loading ? (
              <div className="py-3.5 px-4 text-[--color-text-muted] text-center text-sm">
                Đang tải…
              </div>
            ) : filteredTree.length === 0 ? (
              <div className="py-3.5 px-4 text-[--color-text-muted] text-center text-sm">
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

function TreeList({ nodes, onPick, depth = 0 }) {
  return (
    <ul className="list-none m-0 p-0">
      {nodes.map((n) => (
        <TreeNode key={n._id} node={n} onPick={onPick} depth={depth} />
      ))}
    </ul>
  );
}

function TreeNode({ node, onPick, depth }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  return (
    <li className="m-0">
      <div
        className="flex items-center min-h-10 rounded transition-all duration-200 cursor-pointer text-[--color-text] hover:bg-primary hover:text-white"
        style={{
          paddingLeft: `calc(12px + (${depth} * 16px))`,
          paddingRight: "12px",
        }}
      >
        {hasChildren ? (
          <button
            type="button"
            className="inline-flex items-center justify-center w-5 h-5 shrink-0 mr-1.5 rounded border border-[--color-border] bg-white cursor-pointer p-0 relative transition-all duration-150 hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:shadow-[0_0_0_3px_rgba(76,132,216,0.08)]"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded((v) => !v);
            }}
            aria-label="toggle"
          >
            <span
              className={`absolute w-1.5 h-1.5 border-r-2 border-b-2 border-[--color-text-secondary] transition-all duration-150 ${
                expanded ? "rotate-45 border-primary" : "-rotate-45"
              }`}
              style={{
                top: "50%",
                left: "50%",
                transform: expanded
                  ? "translate(-50%, -50%) rotate(45deg)"
                  : "translate(-50%, -50%) rotate(-45deg)",
              }}
            />
          </button>
        ) : (
          <span className="w-[18px] h-[18px] shrink-0 mr-1.5 rounded bg-transparent" />
        )}

        <button
          type="button"
          className="block flex-1 w-full text-left appearance-none border-none bg-transparent cursor-pointer m-0 rounded whitespace-nowrap overflow-hidden text-ellipsis text-sm"
          onClick={() => onPick(node)}
          title={node.title}
        >
          {node.title}
        </button>
      </div>

      {hasChildren && expanded && (
        <TreeList nodes={node.children} onPick={onPick} depth={depth + 1} />
      )}
    </li>
  );
}
