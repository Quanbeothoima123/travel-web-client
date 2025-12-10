"use client";

import { useState, useEffect } from "react";
import SetupModal from "@/components/common/SetupModal";
import TabHeader from "@/components/common/friend-tab/TabHeader";
import FriendsList from "@/components/common/friend-tab/list/FriendsList";
import FilterPanelFriend from "@/components/common/friend-tab/FilterPanelFriend";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE;

const FriendsPage = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [needsSetup, setNeedsSetup] = useState(false);
  const [activeTab, setActiveTab] = useState("friends");
  const [filters, setFilters] = useState({
    userName: "",
    province: "",
    ward: "",
    birthYear: "",
    sex: "",
  });

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/v1/users/profile`, {
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const userData = await response.json();
      setUser(userData);

      // Kiểm tra có userName chưa
      if (!userData.userName) {
        setNeedsSetup(true);
      }
    } catch (error) {
      console.error("Load user profile error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSetupComplete = () => {
    setNeedsSetup(false);
    loadUserProfile();
  };

  const handleResetFilters = () => {
    setFilters({
      userName: "",
      province: "",
      ward: "",
      birthYear: "",
      sex: "",
    });
  };

  if (loading) {
    return (
      <div className="max-w-[1200px] mx-auto px-5 py-5 md:px-4 md:py-4 sm:px-3 sm:py-3">
        <div className="text-center py-[60px] px-5 text-base text-gray-600">
          Đang tải...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto px-5 py-5 lg:px-4 lg:py-4 md:px-3 md:py-3 sm:px-2 sm:py-2">
      {needsSetup && <SetupModal onComplete={handleSetupComplete} />}

      {!needsSetup && user && (
        <>
          <div className="mb-6 md:mb-4">
            <h1 className="text-[28px] lg:text-2xl md:text-xl sm:text-lg font-bold text-gray-800 m-0">
              Bạn bè
            </h1>
          </div>

          <TabHeader
            activeTab={activeTab}
            onTabChange={setActiveTab}
            counts={{
              friends: user.friends?.length || 0,
              received: user.friendRequestsReceived?.length || 0,
              sent: user.friendRequestsSent?.length || 0,
              blocked: user.blockedUsers?.length || 0,
            }}
          />

          <FilterPanelFriend
            filters={filters}
            onChange={setFilters}
            onReset={handleResetFilters}
          />

          <FriendsList
            user={user}
            activeTab={activeTab}
            filters={filters}
            onDataChange={loadUserProfile}
          />
        </>
      )}
    </div>
  );
};

export default FriendsPage;
