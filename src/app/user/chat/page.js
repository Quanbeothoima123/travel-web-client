// app/chat/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, MessageCircle, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import ConversationList from "@/components/chat/ConversationList";
import CreateGroupModal from "@/components/chat/CreateGroupModal";

export default function ChatPage() {
  const router = useRouter();
  const { userId, fetchWithAuth } = useAuth();
  const { showToast } = useToast();

  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("friends"); // ← "friends" hoặc "groups"

  useEffect(() => {
    if (userId) {
      fetchConversations();
    }
  }, [userId]);

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
    <div className="flex h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-50 w-96 bg-white border-r border-gray-200 flex flex-col transform transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
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
                onClick={() => setSidebarOpen(false)}
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
          activeTab={activeTab}
          onSelect={(id) => {
            router.push(`/user/chat/${id}`);
            setSidebarOpen(false);
          }}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex items-center">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
          <h1 className="ml-3 text-lg font-semibold text-gray-900">Chat</h1>
        </div>

        {/* Empty State */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <MessageCircle className="w-24 h-24 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-700 mb-2">
              Chọn một cuộc trò chuyện
            </h2>
            <p className="text-gray-500">
              Chọn từ danh sách bên trái để bắt đầu chat
            </p>
          </div>
        </div>
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
    </div>
  );
}
