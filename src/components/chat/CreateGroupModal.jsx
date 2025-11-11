// ========================================
// components/chat/CreateGroupModal.jsx
// ========================================
"use client";

import { useState, useEffect } from "react";
import { X, Search, UserPlus, Camera } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

export default function CreateGroupModal({ onClose, onSuccess }) {
  const { fetchWithAuth } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [friends, setFriends] = useState([]);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [groupName, setGroupName] = useState("");
  const [groupAvatar, setGroupAvatar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    fetchFriends();
  }, []);

  const fetchFriends = async (pageNum = 1) => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/friends/list?page=${pageNum}&limit=50`
      );
      const result = await response.json();
      if (result.success) {
        if (pageNum === 1) {
          setFriends(result.data.items);
        } else {
          setFriends((prev) => [...prev, ...result.data.items]);
        }
        setHasMore(result.data.nextPageExists);
        setPage(pageNum);
      }
    } catch (error) {
      console.error("Fetch friends error:", error);
      showToast("Không thể tải danh sách bạn bè", "error");
    }
  };

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 50 && hasMore && !loading) {
      setLoading(true);
      fetchFriends(page + 1).finally(() => setLoading(false));
    }
  };

  const toggleFriend = (friendId) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim() || selectedFriends.length === 0) {
      showToast("Vui lòng nhập tên nhóm và chọn thành viên", "warning");
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/group-chat/create`,
        {
          method: "POST",
          body: JSON.stringify({
            name: groupName,
            memberIds: selectedFriends,
            avatar: groupAvatar,
          }),
        }
      );
      const result = await response.json();
      if (result.success) {
        showToast("Tạo nhóm thành công!", "success");
        onSuccess(result.data._id);
      } else {
        showToast(result.error || "Không thể tạo nhóm", "error");
      }
    } catch (error) {
      console.error("Create group error:", error);
      showToast("Đã xảy ra lỗi", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredFriends = friends.filter(
    (friend) =>
      friend.userName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      friend.customName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 1 ? "Chọn bạn bè" : "Thông tin nhóm"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {step === 1 ? (
          <>
            {/* Search */}
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Tìm kiếm bạn bè"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              {selectedFriends.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Đã chọn: {selectedFriends.length} người
                </p>
              )}
            </div>

            {/* Friends List */}
            <div className="flex-1 overflow-y-auto p-4" onScroll={handleScroll}>
              {filteredFriends.map((friend) => (
                <button
                  key={friend._id}
                  onClick={() => toggleFriend(friend._id)}
                  className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition"
                >
                  <img
                    src={friend.avatar || "/default-avatar.png"}
                    alt=""
                    className="w-12 h-12 rounded-full"
                  />
                  <div className="flex-1 text-left">
                    <p className="font-semibold text-gray-900">
                      {friend.customName || friend.userName}
                    </p>
                  </div>
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      selectedFriends.includes(friend._id)
                        ? "bg-purple-600 border-purple-600"
                        : "border-gray-300"
                    }`}
                  >
                    {selectedFriends.includes(friend._id) && (
                      <UserPlus className="w-4 h-4 text-white" />
                    )}
                  </div>
                </button>
              ))}
              {loading && (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600 mx-auto"></div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200">
              <button
                onClick={() => setStep(2)}
                disabled={selectedFriends.length === 0}
                className="w-full py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiếp tục
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Group Info */}
            <div className="flex-1 overflow-y-auto p-6">
              {/* Avatar Upload */}
              <div className="flex justify-center mb-6">
                <label className="relative cursor-pointer group">
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center overflow-hidden">
                    {groupAvatar ? (
                      <img
                        src={groupAvatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Camera className="w-8 h-8 text-white" />
                    )}
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                    <Camera className="w-6 h-6 text-white" />
                  </div>
                  <input type="file" className="hidden" accept="image/*" />
                </label>
              </div>

              {/* Group Name */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên nhóm *
                </label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  placeholder="Nhập tên nhóm"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Selected Members */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Thành viên ({selectedFriends.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {selectedFriends.map((friendId) => {
                    const friend = friends.find((f) => f._id === friendId);
                    return (
                      <div
                        key={friendId}
                        className="flex items-center space-x-2 bg-gray-100 rounded-full px-3 py-1"
                      >
                        <img
                          src={friend?.avatar || "/default-avatar.png"}
                          alt=""
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-sm">
                          {friend?.customName || friend?.userName}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-gray-200 flex space-x-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Quay lại
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={!groupName.trim() || loading}
                className="flex-1 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Đang tạo..." : "Tạo nhóm"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
