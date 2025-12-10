"use client";
import { createContext, useContext, useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useAuth } from "./AuthContext";

const SocketContext = createContext(null);

export function SocketProvider({ children }) {
  const { user, userId } = useAuth(); // 🔥 Lấy cả user và userId
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);

  useEffect(() => {
    // 🔥 Cần có user._id (không chỉ userId)
    if (!user || !user.userId) {
      console.log("⚠️ No user, skipping socket connection");
      return;
    }

    console.log("🔌 Initializing socket for user:", user.userId);

    const newSocket = io(process.env.NEXT_PUBLIC_API_BASE, {
      auth: {
        userId: user.userId, // 🔥 user.userId từ AuthContext
        userType: "user", // 🔥 Thêm userType
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"],
    });

    socketRef.current = newSocket;

    newSocket.on("connect", () => {
      console.log("✅ Socket connected:", newSocket.id);
      setSocket(newSocket);
      setIsConnected(true);

      // ✅ Tự động join user room
      newSocket.emit("join-user-room", user.userId);

      // ✅ Emit user online status
      newSocket.emit("user-online");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("❌ Socket disconnected:", reason);
      setSocket(null);
      setIsConnected(false);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Socket connection error:", error);
      setIsConnected(false);
    });

    newSocket.on("error", (error) => {
      console.error("❌ Socket error:", error);
    });

    // ✅ Cleanup
    return () => {
      if (socketRef.current) {
        console.log("🔌 Disconnecting socket...");
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
    };
  }, [user]); // 🔥 Dependency là user, không phải userId

  // ✅ Handle page visibility (tab switching)
  useEffect(() => {
    if (!socket || !isConnected) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        socket.emit("user-online");
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [socket, isConnected]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
}
