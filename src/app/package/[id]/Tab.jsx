"use client";
import { useState } from "react";
import GeneralTab from "./tabs/general";
import ItinearyTab from "./tabs/itineary";
import TermsConditionTab from "./tabs/termsCondition";
import InclusionExlusionTab from "./tabs/inclusion-exlusion";
import StayTab from "./tabs/stay";
import CancellationTab from "./tabs/cancellation";
import ReviewTab from "./tabs/review";

const Tab = ({ packageData, selectedStayCategory }) => {
  const [activeTab, setActiveTab] = useState("details");
  const handleTabClick = (tab) => {
    setActiveTab(tab);
    // Scroll to content accounting for sticky header
    const tabContent = document.querySelector('.tab-content');
    const stickyHeaderHeight = 108; // Header (60px) + Tab nav height
    if (tabContent) {
      const targetScrollPosition = tabContent.offsetTop - stickyHeaderHeight;
      window.scrollTo({
        top: targetScrollPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <>
      {/* tab header */}
      <div className="sticky  top-[48px] md:top-[60px] bg-white z-30 border-b border-gray-200 mb-0">
        <div className="relative">
          <nav className="flex overflow-x-auto -mb-px space-x-4 py-4 scrollbar-hide no-scrollbar pr-12">
            <button
              className={`whitespace-nowrap text-sm font-medium cursor-pointer ${
                activeTab === "details"
                  ? "bg-gray-900 text-white rounded-full px-4 py-2 font-medium"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-4 py-2 rounded-full font-medium"
              }`}
              onClick={() => handleTabClick("details")}
            >
              Details
            </button>
            <button
              className={`whitespace-nowrap text-sm font-medium cursor-pointer ${
                activeTab === "itinerary"
                  ? "bg-gray-900 text-white rounded-full px-4 py-2 font-medium"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-4 py-2 rounded-full font-medium"
              }`}
              onClick={() => handleTabClick("itinerary")}
            >
              Itinerary
            </button>
            <button
              className={`whitespace-nowrap text-sm font-medium cursor-pointer ${
                activeTab === "stay"
                  ? "bg-gray-900 text-white rounded-full px-4 py-2 font-medium"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-4 py-2 rounded-full font-medium"
              }`}
              onClick={() => handleTabClick("stay")}
            >
              Stay
            </button>
            <button
              className={`whitespace-nowrap text-sm font-medium cursor-pointer ${
                activeTab === "inclusion"
                  ? "bg-gray-900 text-white rounded-full px-4 py-2 font-medium"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-4 py-2 rounded-full font-medium"
              }`}
              onClick={() => handleTabClick("inclusion")}
            >
              Inclusion & Exclusion
            </button>
            <button
              className={`whitespace-nowrap text-sm font-medium cursor-pointer ${
                activeTab === "terms"
                  ? "bg-gray-900 text-white rounded-full px-4 py-2 font-medium"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-4 py-2 rounded-full font-medium"
              }`}
              onClick={() => handleTabClick("terms")}
            >
              Terms and Conditions
            </button>
            <button
              className={`whitespace-nowrap text-sm font-medium cursor-pointer ${
                activeTab === "cancellation"
                  ? "bg-gray-900 text-white rounded-full px-4 py-2 font-medium"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-4 py-2 rounded-full font-medium"
              }`}
              onClick={() => handleTabClick("cancellation")}
            >
              Cancellation Policy
            </button>
            {/* <button
              className={`whitespace-nowrap text-sm font-medium cursor-pointer ${
                activeTab === "reviews"
                  ? "bg-gray-900 text-white rounded-full px-4 py-2 font-medium"
                  : "text-gray-500 hover:bg-gray-100 hover:text-gray-700 px-4 py-2 rounded-full font-medium"
              }`}
              onClick={() => handleTabClick("reviews")}
            >
              Reviews
            </button> */}
          </nav>

          <button className="absolute right-0 top-1/2 -translate-y-1/2 h-8 w-8 bg-white text-gray-800 border border-gray-200 rounded-full flex items-center justify-center shadow-md z-10">
            <i className="fi fi-rr-angle-small-right relative top-[2px]"></i>
          </button>
        </div>
      </div>
      {/* tab content */}
      <div className="tab-content pt-4 text-sm">
        <GeneralTab packageData={packageData} activeTab={activeTab} />
        <StayTab
          packageData={packageData}
          activeTab={activeTab}
          selectedStayCategory={selectedStayCategory}
        />
        <ItinearyTab packageData={packageData} activeTab={activeTab} />
        <InclusionExlusionTab packageData={packageData} activeTab={activeTab} />
        <TermsConditionTab packageData={packageData} activeTab={activeTab} />
        <CancellationTab packageData={packageData} activeTab={activeTab} />
        <ReviewTab packageData={packageData} activeTab={activeTab} />
      </div>
    </>
  );
};

export default Tab;
