"use client";

import React, { createContext, useState, useEffect, useContext } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;
const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  //  Làm mới access token (cả authToken và userRefreshToken đều từ cookie)
  const refreshAccessToken = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/refresh-token`, {
        method: "POST",
        credentials: "include", // ← Cookie tự động gửi
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("Failed to refresh token");
      }

      const data = await res.json();

      //  Server đã set cookie authToken mới, chỉ cần update user info
      setUser(data.user);

      return data.user;
    } catch (error) {
      console.error("Refresh token error:", error);
      setUser(null);
      return null;
    }
  };

  //  Fetch với tự động refresh token
  const fetchWithAuth = async (url, options = {}) => {
    let res = await fetch(url, {
      ...options,
      credentials: "include", // ← Luôn gửi cookie authToken
      headers: {
        ...options.headers,
        "Content-Type": "application/json",
      },
    });

    //  Nếu 401, refresh và retry
    if (res.status === 401) {
      const userData = await refreshAccessToken();
      if (userData) {
        res = await fetch(url, {
          ...options,
          credentials: "include",
          headers: {
            ...options.headers,
            "Content-Type": "application/json",
          },
        });
      }
    }

    return res;
  };

  //  Kiểm tra trạng thái đăng nhập (gọi khi load app)
  const checkAuthStatus = async () => {
    try {
      // Thử gọi API refresh để lấy thông tin user
      // Nếu có userRefreshToken cookie hợp lệ thì sẽ thành công
      const userData = await refreshAccessToken();

      if (!userData) {
        setUser(null);
      }
    } catch (error) {
      console.error("Check auth status error:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  //  Đăng nhập
  const login = async ({ email, password }) => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: "POST",
        credentials: "include", // ← Cho phép nhận cookie từ server
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (data.code !== 200) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      //  Set user info (cả authToken và userRefreshToken đã được lưu vào cookie)
      setUser(data.user);

      return { success: true, data };
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  //  Đăng xuất
  const logout = async () => {
    try {
      await fetch(`${API_BASE}/api/v1/auth/logout`, {
        method: "POST",
        credentials: "include", // ← Gửi cookie để server xóa
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      setUser(null);
    }
  };

  //  Cập nhật thông tin user local (sau khi update profile)
  const updateUser = (updatedData) => {
    setUser((prev) => ({
      ...prev,
      ...updatedData,
    }));
  };

  return (
    <AuthContext.Provider
      value={{
        user, // ⭐ Full user info từ JWT
        userId: user?.userId, // ⭐ Cho phép lấy userId trực tiếp
        loading,
        login,
        logout,
        updateUser,
        refreshAuth: checkAuthStatus,
        fetchWithAuth, // ⭐ Export để dùng ở các component khác
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
