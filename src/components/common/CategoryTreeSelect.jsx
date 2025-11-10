// components/common/CategoryTreeSelect.jsx
import React, { useState, useEffect, useRef } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE || "https://your-api-domain.com";

export default function CategoryTreeSelect({
  value,
  onChange,
  fetchUrl = `${API_BASE}/api/v1/tour-category/get-all-category?tree=true`,
  placeholder = "Chọn loại tour...",
  noDataText = "Không có danh mục",
}) {
  const [open, setOpen] = useState(false);
  const [tree, setTree] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const wrapRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const res = await fetch(fetchUrl, {
          credentials: "include",
        });
        const data = await res.json();
        if (mounted) {
          setTree(Array.isArray(data) ? data : []);
        }
      } catch (e) {
        console.error("Error fetching categories:", e);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCategories();
    return () => {
      mounted = false;
    };
  }, [fetchUrl]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filterTree = (nodes, query) => {
    if (!query.trim()) return nodes;
    const needle = query.trim().toLowerCase();

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
    return filterRec(nodes);
  };

  const filteredTree = filterTree(tree, searchQuery);

  const handleSelect = (category) => {
    if (onChange) onChange(category);
    setOpen(false);
    setSearchQuery("");
  };

  const findTitleById = (nodes, id) => {
    for (const n of nodes) {
      if (n._id === id) return n.title;
      if (n.children) {
        const found = findTitleById(n.children, id);
        if (found) return found;
      }
    }
    return "";
  };

  const displayValue = value
    ? value.title || findTitleById(tree, value._id) || placeholder
    : placeholder;

  return (
    <div ref={wrapRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`w-full flex items-center justify-between px-4 py-3 border rounded-lg bg-(--color-bg) transition-all ${
          open
            ? "border-primary ring-2 ring-primary/20"
            : "border-border hover:border-primary"
        }`}
      >
        <span className={value ? "text-text" : "text-text-muted"}>
          {displayValue}
        </span>
        <ChevronDown
          className={`w-5 h-5 transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-border rounded-lg shadow-lg z-50 overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm danh mục..."
              className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              onClick={(e) => e.stopPropagation()}
            />
          </div>

          <div className="max-h-[300px] overflow-y-auto py-2">
            {loading ? (
              <div className="p-4 text-center text-text-muted">Đang tải...</div>
            ) : filteredTree.length === 0 ? (
              <div className="p-4 text-center text-text-muted">
                {noDataText}
              </div>
            ) : (
              <TreeList nodes={filteredTree} onSelect={handleSelect} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function TreeList({ nodes, onSelect, depth = 0 }) {
  return (
    <div>
      {nodes.map((node) => (
        <TreeNode
          key={node._id}
          node={node}
          onSelect={onSelect}
          depth={depth}
        />
      ))}
    </div>
  );
}

function TreeNode({ node, onSelect, depth }) {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = Array.isArray(node.children) && node.children.length > 0;

  return (
    <div>
      <div
        className="flex items-center gap-2 px-3 py-2 hover:bg-primary hover:text-white transition-colors cursor-pointer group"
        style={{ paddingLeft: `${12 + depth * 16}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            className="flex items-center justify-center w-5 h-5 shrink-0"
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform ${
                expanded ? "rotate-90" : ""
              }`}
            />
          </button>
        ) : (
          <span className="w-5 h-5 shrink-0" />
        )}

        <button
          type="button"
          onClick={() => onSelect(node)}
          className="flex-1 text-left text-sm"
        >
          {node.title}
        </button>
      </div>

      {hasChildren && expanded && (
        <TreeList nodes={node.children} onSelect={onSelect} depth={depth + 1} />
      )}
    </div>
  );
}
