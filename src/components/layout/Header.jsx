"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  User,
  ChevronDown,
  ChevronRight,
  UserPen,
  LogOut,
  Menu,
} from "lucide-react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const MenuItem = ({ item, depth = 0, basePath, pathname }) => {
  const [isHovered, setIsHovered] = useState(false);
  const hasChildren = Array.isArray(item.children) && item.children.length > 0;

  let linkTo = "/";
  if (basePath && item.slug) linkTo = `/${basePath}/${item.slug}`;
  else if (basePath && !item.slug) linkTo = `/${basePath}`;

  const isActive =
    depth === 0 &&
    (pathname === linkTo || pathname.startsWith(`/${basePath}/`));

  return (
    <li
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link
        href={linkTo}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium border-2 transition-all duration-200 ${
          isActive
            ? "bg-primary text-white border-primary"
            : "text-gray-700 border-transparent hover:bg-white hover:text-primary hover:border-gray-200"
        }`}
      >
        {item.title}
        {hasChildren &&
          (depth === 0 ? (
            <ChevronDown className="w-4 h-4 text-primary" />
          ) : (
            <ChevronRight className="w-4 h-4 text-primary" />
          ))}
      </Link>

      {/* SUBMENU - Hiện khi hover */}
      {hasChildren && (
        <ul
          className={`absolute bg-white border-2 border-gray-200 rounded-lg shadow-lg p-2 min-w-60 z-50 transition-all duration-200 ${
            depth === 0 ? "top-full left-0 mt-1" : "left-full top-0 ml-1"
          } ${isHovered ? "opacity-100 visible" : "opacity-0 invisible"}`}
        >
          {item.children.map((child) => (
            <MenuItem
              key={child._id}
              item={child}
              depth={depth + 1}
              basePath={basePath}
              pathname={pathname}
            />
          ))}
        </ul>
      )}
    </li>
  );
};

const Header = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [menuData, setMenuData] = useState([]);
  const { user, loading, logout } = useAuth();
  const pathname = usePathname();

  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const fetchMenus = async () => {
      try {
        const endpoints = {
          home: { url: `${API_BASE}/api/v1/homePage`, basePath: "" },
          tour: {
            url: `${API_BASE}/api/v1/tour-category/get-all-category?tree=true`,
            basePath: "search/tours",
          },
          service: { url: `${API_BASE}/api/v1/service`, basePath: "service" },
          news: { url: `${API_BASE}/api/v1/news`, basePath: "news" },
          library: { url: `${API_BASE}/api/v1/library`, basePath: "gallery" },
          contact: { url: `${API_BASE}/api/v1/contact`, basePath: "contact" },
          about: { url: `${API_BASE}/api/v1/info`, basePath: "info" },
        };

        const responses = await Promise.all(
          Object.values(endpoints).map((ep) => fetch(ep.url))
        );
        const data = await Promise.all(responses.map((res) => res.json()));

        const merged = data.map((d, i) => ({
          ...d[0],
          basePath: Object.values(endpoints)[i].basePath,
        }));

        setMenuData(merged);
      } catch (e) {
        console.error("Error fetching menus:", e);
      }
    };
    fetchMenus();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen((s) => !s);

  useEffect(() => {
    const onDocClick = (e) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(e.target)) setIsUserMenuOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const handleToggleUserMenu = () => setIsUserMenuOpen((s) => !s);
  const handleLogout = async () => {
    await logout();
    setIsUserMenuOpen(false);
  };

  return (
    <header className="bg-white shadow-sm fixed top-0 left-0 right-0 w-full z-1001">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-2 py-3">
          {/* Logo */}
          <div className="shrink-0">
            <Link href="/">
              <Image
                src="/logo.png"
                alt="Logo"
                width={48}
                height={48}
                className="h-12 w-auto rounded-lg"
              />
            </Link>
          </div>

          {/* Hamburger (mobile) */}
          <button
            className="lg:hidden inline-flex p-2 text-gray-700 cursor-pointer hover:text-primary hover:bg-gray-100 rounded-lg transition-all duration-150"
            onClick={toggleSidebar}
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>

          {/* Menu desktop */}
          <nav className="hidden lg:block flex-1">
            <ul className="flex gap-1 items-center">
              {menuData.map((item) => (
                <MenuItem
                  key={item._id}
                  item={item}
                  basePath={item.basePath}
                  pathname={pathname}
                  depth={0}
                />
              ))}
            </ul>
          </nav>

          {/* Auth */}
          <div className="ml-auto flex items-center gap-3">
            {loading ? null : !user ? (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-200"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm font-medium text-primary border border-primary rounded-lg hover:bg-primary hover:text-white transition-all duration-200"
                >
                  Đăng ký
                </Link>
              </>
            ) : (
              <div ref={userMenuRef} className="relative">
                <button
                  className="flex items-center gap-2 px-3 py-2 bg-white border-2 border-gray-200 rounded-lg hover:shadow-sm transition-all duration-150"
                  type="button"
                  onClick={handleToggleUserMenu}
                >
                  <User className="w-5 h-5 text-primary" />
                  <span className="text-sm font-medium text-gray-700">
                    {user.fullName || user.name}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                <div
                  className={`absolute top-full right-0 mt-2 bg-white border-2 border-gray-200 rounded-lg shadow-lg min-w-[220px] p-1 z-50 transition-all duration-200 ${
                    isUserMenuOpen
                      ? "opacity-100 translate-y-0 pointer-events-auto"
                      : "opacity-0 translate-y-2 pointer-events-none"
                  }`}
                >
                  <Link
                    href="/user/profile"
                    className="flex items-center gap-2 px-4 py-3 text-gray-700 rounded-lg hover:bg-gray-50 hover:text-primary transition-all duration-150"
                    onClick={() => setIsUserMenuOpen(false)}
                  >
                    <UserPen className="w-4 h-4" />
                    <span>Thông tin cá nhân</span>
                  </Link>
                  <Link
                    href="/"
                    className="flex items-center gap-2 px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-all duration-150"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Đăng xuất</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar mobile */}
      <Sidebar
        menuItems={menuData}
        isOpen={isSidebarOpen}
        onToggle={toggleSidebar}
        user={user}
        handleLogout={handleLogout}
      />
    </header>
  );
};

export default Header;
