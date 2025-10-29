"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, ChevronDown, User, LogOut } from "lucide-react";

const SidebarItem = ({ item, depth = 0, parentBasePath = "", pathname }) => {
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  // Xây dựng link đúng
  let linkTo = "/";
  if (depth === 0) {
    // Cấp 1: dùng basePath từ menuItems
    if (parentBasePath && item.slug) linkTo = `/${parentBasePath}/${item.slug}`;
    else if (parentBasePath && !item.slug) linkTo = `/${parentBasePath}`;
  } else {
    // Cấp 2+: dùng parentBasePath + slug của item
    if (parentBasePath && item.slug) linkTo = `/${parentBasePath}/${item.slug}`;
  }

  const isActive = pathname === linkTo || pathname.startsWith(linkTo + "/");
  const [isOpen, setIsOpen] = useState(false);

  // Padding tăng dần theo depth
  const paddingLeft = `${(depth + 1) * 0.75}rem`;

  return (
    <li className="mb-1">
      <div className="flex items-center gap-1">
        <Link
          href={linkTo}
          className={`flex-1 block px-4 py-2.5 rounded-lg border text-sm transition-all duration-200 font-medium ${
            isActive
              ? "bg-[#000080] text-white border-[#000080]"
              : "text-gray-700 border-transparent hover:bg-gray-50 hover:text-[#000080] hover:border-gray-200"
          }`}
          style={{ paddingLeft }}
        >
          {item.title}
        </Link>
        {hasChildren && (
          <button
            type="button"
            className="p-2 text-gray-500 hover:text-[#000080] hover:bg-gray-50 rounded transition-all duration-150"
            aria-expanded={isOpen}
            onClick={(e) => {
              e.stopPropagation();
              setIsOpen((prev) => !prev);
            }}
          >
            {isOpen ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* QUAN TRỌNG: Hiển thị children đệ quy */}
      {hasChildren && isOpen && (
        <ul className="mt-1 space-y-1 animate-fadeIn">
          {item.children.map((child) => (
            <SidebarItem
              key={child._id}
              item={child}
              depth={depth + 1}
              parentBasePath={parentBasePath}
              pathname={pathname}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const Sidebar = ({ menuItems = [], isOpen, onToggle, user, handleLogout }) => {
  const pathname = usePathname();

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-999 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 w-80 max-w-[86vw] h-screen bg-white border-r border-gray-200 shadow-xl z-1000 transition-transform duration-300 lg:hidden flex flex-col ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-gray-800">Menu</h2>
          <button
            className="text-gray-700 text-2xl p-1 hover:text-[#000080] hover:rotate-90 hover:bg-gray-50 rounded-lg border border-transparent hover:border-gray-200 transition-all duration-200"
            aria-label="Close sidebar"
            onClick={onToggle}
          >
            &times;
          </button>
        </div>

        {/* Menu Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto p-4" aria-label="Primary">
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <SidebarItem
                key={item._id}
                item={item}
                depth={0}
                parentBasePath={item.basePath || ""}
                pathname={pathname}
              />
            ))}
          </ul>
        </nav>

        {/* User Section - Fixed at bottom */}
        {user && (
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-[#000080] rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {user.fullName || user.name}
                </p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Đăng xuất</span>
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;
