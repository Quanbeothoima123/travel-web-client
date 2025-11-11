"use client";

import { useState, useEffect } from "react";
import FriendCard from "./FriendCard";
import RequestCard from "./RequestCard";
import BlockedCard from "./BlockedCard";
import SuggestedFriendCard from "./SuggestedFriendCard";
import { useToast } from "@/contexts/ToastContext";
const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const FriendsList = ({ activeTab, filters, onDataChange }) => {
  const { showToast } = useToast();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setPage(1);
    setData([]);
  }, [activeTab, filters]);

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, filters, page]);

  const loadData = async () => {
    setLoading(true);
    try {
      let endpoint = "";
      let queryParams = new URLSearchParams({
        page,
        limit: 20,
        ...filters,
      });

      switch (activeTab) {
        case "friends":
          endpoint = `/api/v1/friends/list?${queryParams}`;
          break;
        case "suggestions":
          endpoint = `/api/v1/friends/suggestions?${queryParams}`;
          break;
        case "received":
          endpoint = `/api/v1/friends/friend-requests/received?${queryParams}`;
          break;
        case "sent":
          endpoint = `/api/v1/friends/friend-requests/sent?${queryParams}`;
          break;
        case "blocked":
          endpoint = `/api/v1/friends/blocked?${queryParams}`;
          break;
        default:
          return;
      }

      const response = await fetch(`${API_BASE}${endpoint}`, {
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();

      if (page === 1) {
        setData(result.data.items);
      } else {
        setData((prev) => [...prev, ...result.data.items]);
      }

      setHasMore(result.data.nextPageExists);
    } catch (error) {
      console.error("❌ Load data error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (userId) => {
    console.log("👤 View profile:", userId);
    // Next.js sẽ tự động navigate với Link component
  };

  const handleUnfriend = async (friendId) => {
    if (!window.confirm("Bạn có chắc muốn hủy kết bạn?")) return;

    try {
      const response = await fetch(
        `${API_BASE}/api/v1/friends/un-friend${friendId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!response.ok) throw new Error("Unfriend failed");

      setData((prev) => prev.filter((item) => item._id !== friendId));
      onDataChange?.();
      showToast("Đã hủy kết bạn thành công!", "success");
    } catch (error) {
      console.error("❌ Unfriend error:", error);
      showToast("Không thể hủy kết bạn", "error");
    }
  };

  const handleAcceptRequest = async (fromUserId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/friends/friend-requests/accept`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ fromUserId }),
        }
      );

      if (!response.ok) throw new Error("Accept failed");

      setData((prev) => prev.filter((item) => item._id !== fromUserId));
      onDataChange?.();
      showToast("Đã chấp nhận lời mời kết bạn!", "success");
    } catch (error) {
      console.error("❌ Accept request error:", error);
      showToast("Không thể chấp nhận lời mời", "error");
    }
  };

  const handleRejectRequest = async (fromUserId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/friends/friend-requests/reject`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ fromUserId }),
        }
      );

      if (!response.ok) throw new Error("Reject failed");

      setData((prev) => prev.filter((item) => item._id !== fromUserId));
      onDataChange?.();
    } catch (error) {
      console.error("❌ Reject request error:", error);
      showToast("Không thể từ chối lời mời", "error");
    }
  };

  const handleCancelRequest = async (toUserId) => {
    try {
      const response = await fetch(
        `${API_BASE}/api/v1/friends/friend-requests/cancel`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ toUserId }),
        }
      );

      if (!response.ok) throw new Error("Cancel failed");

      setData((prev) => prev.filter((item) => item._id !== toUserId));
      onDataChange?.();
    } catch (error) {
      console.error("❌ Cancel request error:", error);
      showToast("Không thể hủy lời mời", "error");
    }
  };

  const handleUnblock = async (targetUserId) => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/friends/unblock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ targetUserId }),
      });

      if (!response.ok) throw new Error("Unblock failed");

      setData((prev) => prev.filter((item) => item._id !== targetUserId));
      onDataChange?.();
      showToast("Đã bỏ chặn thành công!", "success");
    } catch (error) {
      console.error("❌ Unblock error:", error);
      showToast("Không thể bỏ chặn", "error");
    }
  };

  const handleAddFriend = async (userId, message) => {
    try {
      const requestBody = {
        toUserId: userId,
        message: message || undefined,
      };

      const response = await fetch(
        `${API_BASE}/api/v1/friends/friend-requests/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Send request failed");
      }

      setData((prev) => prev.filter((item) => item._id !== userId));
      onDataChange?.();
      showToast("Đã gửi lời mời kết bạn!", "success");
    } catch (error) {
      console.error("❌ Add friend error:", error);
      showToast(error.message || "Không thể gửi lời mời kết bạn", "error");
    }
  };

  const renderCard = (item) => {
    switch (activeTab) {
      case "friends":
        return (
          <FriendCard
            key={item._id}
            friend={item}
            onUnfriend={handleUnfriend}
            onViewProfile={handleViewProfile}
          />
        );
      case "suggestions":
        return (
          <SuggestedFriendCard
            key={item._id}
            user={item}
            onAddFriend={handleAddFriend}
            onViewProfile={handleViewProfile}
          />
        );
      case "received":
        return (
          <RequestCard
            key={item._id}
            request={item}
            type="received"
            onAccept={handleAcceptRequest}
            onReject={handleRejectRequest}
            onViewProfile={handleViewProfile}
          />
        );
      case "sent":
        return (
          <RequestCard
            key={item._id}
            request={item}
            type="sent"
            onCancel={handleCancelRequest}
            onViewProfile={handleViewProfile}
          />
        );
      case "blocked":
        return (
          <BlockedCard
            key={item._id}
            blocked={item}
            onUnblock={handleUnblock}
            onViewProfile={handleViewProfile}
          />
        );
      default:
        return null;
    }
  };

  if (loading && page === 1) {
    return (
      <div className="text-center py-[60px] px-5 text-base text-gray-600">
        Đang tải...
      </div>
    );
  }

  if (!loading && data.length === 0) {
    const emptyMessages = {
      friends: "Bạn chưa có bạn bè nào",
      suggestions: "Không có gợi ý kết bạn",
      received: "Không có lời mời kết bạn nào",
      sent: "Bạn chưa gửi lời mời nào",
      blocked: "Bạn chưa chặn ai",
    };

    return (
      <div className="text-center py-20 px-5 bg-white rounded-xl shadow-sm">
        <div className="text-6xl mb-4">👥</div>
        <p className="text-gray-600 text-base m-0">
          {emptyMessages[activeTab] || "Không có dữ liệu"}
        </p>
      </div>
    );
  }

  return (
    <div className="mb-10">
      {/* Grid responsive với Tailwind */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-3">
        {data.map((item) => renderCard(item))}
      </div>

      {/* Load More Button */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {loading ? "Đang tải..." : "Tải thêm"}
          </button>
        </div>
      )}
    </div>
  );
};

export default FriendsList;
