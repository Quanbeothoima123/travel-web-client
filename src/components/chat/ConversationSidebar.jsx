// components/chat/ConversationSidebar.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Plus, Search, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import ConversationList from "./ConversationList";
import CreateGroupModal from "./CreateGroupModal";

export default function ConversationSidebar({ isOpen, onClose }) {
  const router = useRouter();
  const pathname = usePathname();
  const { fetchWithAuth } = useAuth();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("friends"); // ← "friends" hoặc "groups"

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetchWithAuth(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/conversation`
      );
      const result = await response.json();
      if (result.success) {
        setConversations(result.data);
      }
    } catch (error) {
      console.error("Fetch conversations error:", error);
      showToast("Không thể tải danh sách cuộc trò chuyện", "error");
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Đếm số lượng cho mỗi tab
  const friendsCount = conversations.filter((c) => c.type === "private").length;
  const groupsCount = conversations.filter((c) => c.type === "group").length;

  return (
    <>
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-96 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Tin nhắn</h1>
            <div className="flex items-center space-x-2">
              {activeTab === "groups" && (
                <button
                  onClick={() => setShowCreateGroup(true)}
                  className="p-2 rounded-full hover:bg-gray-100 transition"
                  title="Tạo nhóm mới"
                >
                  <Plus className="w-6 h-6 text-gray-700" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-gray-100 transition lg:hidden"
              >
                <X className="w-6 h-6 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Tìm kiếm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("friends")}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "friends"
                ? "text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            BẠN BÈ
            {friendsCount > 0 && (
              <span className="ml-1 text-xs">({friendsCount})</span>
            )}
            {activeTab === "friends" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("groups")}
            className={`flex-1 py-3 text-sm font-medium transition-colors relative ${
              activeTab === "groups"
                ? "text-purple-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            NHÓM CHAT
            {groupsCount > 0 && (
              <span className="ml-1 text-xs">({groupsCount})</span>
            )}
            {activeTab === "groups" && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-purple-600" />
            )}
          </button>
        </div>

        {/* Conversation List */}
        <ConversationList
          conversations={filteredConversations}
          loading={loading}
          currentPath={pathname}
          activeTab={activeTab}
          onSelect={(id) => {
            router.push(`/user/chat/${id}`);
            onClose();
          }}
        />
      </div>

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onSuccess={(conversationId) => {
            setShowCreateGroup(false);
            fetchConversations();
            router.push(`/user/chat/${conversationId}`);
          }}
        />
      )}
    </>
  );
}
