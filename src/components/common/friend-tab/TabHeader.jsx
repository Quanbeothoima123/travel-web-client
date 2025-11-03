"use client";

import { Users, UserPlus, Send, Ban, UsersRound } from "lucide-react";

const TabHeader = ({ activeTab, onTabChange, counts }) => {
  const tabs = [
    {
      id: "friends",
      label: "Bạn bè",
      count: counts.friends,
      icon: <Users className="w-4 h-4" />,
    },
    {
      id: "suggestions",
      label: "Gợi ý kết bạn",
      count: null,
      icon: <UsersRound className="w-4 h-4" />,
    },
    {
      id: "received",
      label: "Lời mời đến",
      count: counts.received,
      icon: <UserPlus className="w-4 h-4" />,
    },
    {
      id: "sent",
      label: "Lời mời đã gửi",
      count: counts.sent,
      icon: <Send className="w-4 h-4" />,
    },
    {
      id: "blocked",
      label: "Đã chặn",
      count: counts.blocked,
      icon: <Ban className="w-4 h-4" />,
    },
  ];

  return (
    <div className="flex gap-2 bg-white rounded-xl p-2 mb-5 shadow-[0_2px_8px_rgba(0,0,0,0.08)] overflow-x-auto md:gap-2 md:p-2">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`cursor-pointer flex-1 min-w-[100px] md:min-w-[120px] px-3 py-2.5 md:px-4 md:py-3 bg-transparent border-none rounded-lg text-[13px] md:text-sm font-semibold transition-all duration-200 flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === tab.id
              ? "bg-primary text-white"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-800"
          }`}
        >
          <span className="flex items-center">{tab.icon}</span>
          <span className="inline-block">{tab.label}</span>
          {tab.count !== null && tab.count > 0 && (
            <span
              className={`inline-flex items-center justify-center min-w-[18px] md:min-w-5 h-[18px] md:h-5 px-1.5 rounded-[10px] text-[11px] md:text-xs font-bold ${
                activeTab === tab.id ? "bg-white/25" : "bg-white/30"
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
};

export default TabHeader;
