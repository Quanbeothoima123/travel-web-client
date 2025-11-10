// app/chat/page.jsx - Main Chat Layout (No conversation selected)
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Users, MessageCircle } from "lucide-react";
import ConversationList from "@/components/chat/ConversationList";
import CreateGroupModal from "@/components/chat/CreateGroupModal";

export default function ChatPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE}/api/v1/conversation/list`,
        {
          credentials: "include",
        }
      );
      const result = await response.json();
      if (result.success) {
        setConversations(result.data);
      }
    } catch (error) {
      console.error("Fetch conversations error:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-96 bg-white border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">Mọi</h1>
            <button
              onClick={() => setShowCreateGroup(true)}
              className="p-2 rounded-full hover:bg-gray-100 transition"
            >
              <Plus className="w-6 h-6 text-gray-700" />
            </button>
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
          <button className="flex-1 py-3 text-sm font-medium text-purple-600 border-b-2 border-purple-600">
            NHÓM CHAT
          </button>
          <button className="flex-1 py-3 text-sm font-medium text-gray-500">
            BẠN BÈ
          </button>
        </div>

        {/* Conversation List */}
        <ConversationList
          conversations={filteredConversations}
          loading={loading}
          onSelect={(id) => router.push(`/chat/${id}`)}
        />
      </div>

      {/* Empty State */}
      <div className="flex-1 flex items-center justify-center">
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

      {/* Create Group Modal */}
      {showCreateGroup && (
        <CreateGroupModal
          onClose={() => setShowCreateGroup(false)}
          onSuccess={(conversationId) => {
            setShowCreateGroup(false);
            fetchConversations();
            router.push(`/chat/${conversationId}`);
          }}
        />
      )}
    </div>
  );
}
