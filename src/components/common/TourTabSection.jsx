"use client";

import React, { useState } from "react";
import TourCard from "./TourCard";

const TourTabSection = ({ domesticTours, aboardTours }) => {
  const [activeTab, setActiveTab] = useState("domestic");

  const displayTours = activeTab === "domestic" ? domesticTours : aboardTours;

  return (
    <>
      {/* Button group */}
      <div className="flex justify-center gap-5 mb-8">
        <button
          onClick={() => setActiveTab("domestic")}
          className={`relative px-5 py-2.5 text-base font-medium border-none bg-gray-50 cursor-pointer rounded-lg transition-all duration-300 ${
            activeTab === "domestic"
              ? "text-gray-800 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[#000080]"
              : "text-gray-500 hover:text-gray-800 hover:after:content-[''] hover:after:absolute hover:after:-bottom-1 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-[#000080]"
          }`}
        >
          Tour Trong Nước
        </button>
        <button
          onClick={() => setActiveTab("aboard")}
          className={`relative px-5 py-2.5 text-base font-medium border-none bg-gray-50 cursor-pointer rounded-lg transition-all duration-300 ${
            activeTab === "aboard"
              ? "text-gray-800 after:content-[''] after:absolute after:-bottom-1 after:left-0 after:w-full after:h-0.5 after:bg-[#000080]"
              : "text-gray-500 hover:text-gray-800 hover:after:content-[''] hover:after:absolute hover:after:-bottom-1 hover:after:left-0 hover:after:w-full hover:after:h-0.5 hover:after:bg-[#000080]"
          }`}
        >
          Tour Nước Ngoài
        </button>
      </div>

      {/* Tour list */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-6 p-5 max-w-[1200px] mx-auto">
        {displayTours.slice(0, 9).map((tour) => (
          <TourCard key={tour._id} tour={tour} />
        ))}
      </div>
    </>
  );
};

export default TourTabSection;
