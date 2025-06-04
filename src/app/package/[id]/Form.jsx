"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter, useSearchParams } from "next/navigation";

const Form = ({
  packageData,
  selectedStayCategory,
  date,
  packagePrice,
  enquireOnly,
}) => {
  const router = useRouter();
  const [adultCount, setAdultCount] = useState(1);
  const [childCount, setChildCount] = useState(0);
  const [infantCount, setInfantCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(new Date(date));
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const { total_days, total_nights } = packageData.data;

  const searchParams = useSearchParams();

  const onDateChange = (newDate) => {
    setSelectedDate(newDate);
    const params = new URLSearchParams(searchParams.toString());
    params.set("date", newDate.toISOString().split("T")[0]);
    router.replace(`/package/${packageData.data.id}?${params.toString()}`);
  };

  const ratesByDate = {
    "2025-05-31": 100,
    "2025-06-01": 15000,
    "2025-06-02": 135,
    "2025-06-03": 140,
    "2025-06-04": 125,
    "2025-06-05": 130,
    "2025-06-06": 120,
    "2025-06-07": 110,
    "2025-06-08": 100,
    "2025-06-09": 90,
    "2025-06-10": 80,
    "2025-06-11": 70,
    "2025-06-12": 60,
    "2025-06-13": 50,
    "2025-06-14": 40,
    "2025-06-15": 30,
    "2025-06-16": 20,
    // Add more dates and rates
  };

  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  function submitHandler() {
    const data = {
      package_id: packageData.data.id,
      package_stay_category_id: selectedStayCategory.package_stay_category_id,
      date: selectedDate.toISOString().split("T")[0],
      package_price: packagePrice,
      adult_count: adultCount,
      child_count: childCount,
      infant_count: infantCount,
      type: "booking",
    };

    if (enquireOnly) {
      data.type = "enquire";
      data.full_name = fullName;
      data.email = email;
      data.phone = phone;
    }

    console.log(data);

    // send data to server
  }

  function downloadHandler() {
    console.log("downloadHandler");
  }

  return (
    <div
      className={`${
        !enquireOnly ? "sticky top-6" : ""
      } bg-[#f7f7f7] rounded-xl p-3 shadow-sm`}
    >
      <span className="text-xs font-medium text-gray-800  bg-green-200 rounded-full px-2 py-1 mb-2">
        <i className="fi fi-rr-pending mr-2 relative !top-0.5"></i>
        Scheduled Trip
      </span>
      <div className="flex items-center justify-between mb-6 mt-4">
        <div>
          <span className="text-3xl font-bold text-gray-800">
            ₹ {packagePrice}
          </span>
          <span className="text-gray-700 text-sm font-medium ml-1">
            / Person
          </span>
        </div>
        <div className="bg-gray-800 text-white text-xs px-3 py-1 rounded-full">
          {total_nights} N &nbsp; {total_days} D
        </div>
      </div>

      {/* Stay Category Badge */}

      {/* Starting Date */}
      <div className="mb-4 bg-white rounded-xl p-4">
        <label className="block text-sm font-medium text-gray-800 mb-2">
          Starting Date
        </label>
        <div className="relative">
          <DatePicker
            minDate={new Date()} // Prevents selecting dates in the past
            placeholderText="Choose Date"
            className="w-full h-8 px-0 pr-10 border-b text-gray-800 border-gray-300 focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer font-medium"
            selected={selectedDate}
            onChange={(date) => onDateChange(date)}
            popperPlacement="bottom-start"
            renderDayContents={(day, date) => {
              const dateStr = formatDate(date);
              const rate = ratesByDate[dateStr];
              return (
                <div style={{ textAlign: "center", position: "relative" }}>
                  <div>{day}</div>
                  {rate ? (
                    <div
                      style={{
                        fontSize: "0.7em",
                        color: "red",
                        position: "absolute",
                        left: 0,
                        top: "23px",
                        textAlign: "center",
                        width: "100%",
                      }}
                    >
                      ₹{rate}
                    </div>
                  ) : null}
                </div>
              );
            }}
          />
          <div className="absolute right-0 top-1/2 transform -translate-y-1/2  pointer-events-none text-gray-500">
            <i className="fi fi-rr-calendar text-lg"></i>
          </div>
        </div>
      </div>

      {/* No. of Tickets */}
      <div className="mb-4 bg-white rounded-xl p-4">
        <label className="block text-sm font-medium text-gray-800 mb-4">
          No. of Tickets
        </label>

        {/* Adults */}
        <div className="flex items-center justify-between mb-2 border-b border-gray-200 pb-2">
          <div>
            <p className="font-medium text-gray-800 text-sm">Adult</p>
            <p className="text-xs text-gray-500">Over 18+</p>
          </div>
          <div className="flex items-center">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
              onClick={() => setAdultCount(Math.max(1, adultCount - 1))}
            >
              <i className="fi fi-rr-minus text-xs"></i>
            </button>
            <span className="mx-4 w-6 text-center text-gray-800 font-medium">
              {adultCount}
            </span>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
              onClick={() => setAdultCount(adultCount + 1)}
            >
              <i className="fi fi-rr-plus text-xs"></i>
            </button>
          </div>
        </div>

        {/* Children */}
        <div className="flex items-center justify-between mb-2 border-b border-gray-200 pb-2">
          <div>
            <p className="font-medium text-gray-800 text-sm">Child</p>
            <p className="text-xs text-gray-500">Ages 2-17</p>
          </div>
          <div className="flex items-center">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
              onClick={() => setChildCount(Math.max(0, childCount - 1))}
            >
              <i className="fi fi-rr-minus text-xs"></i>
            </button>
            <span className="mx-4 w-6 text-center text-gray-800 font-medium">
              {childCount}
            </span>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
              onClick={() => setChildCount(childCount + 1)}
            >
              <i className="fi fi-rr-plus text-xs"></i>
            </button>
          </div>
        </div>

        {/* Infants */}
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-800 text-sm">Infants</p>
            <p className="text-xs text-gray-500">Under 2</p>
          </div>
          <div className="flex items-center">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
              onClick={() => setInfantCount(Math.max(0, infantCount - 1))}
            >
              <i className="fi fi-rr-minus text-xs"></i>
            </button>
            <span className="mx-4 w-6 text-center text-gray-800 font-medium">
              {infantCount}
            </span>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 text-gray-500 hover:bg-gray-50 cursor-pointer"
              onClick={() => setInfantCount(infantCount + 1)}
            >
              <i className="fi fi-rr-plus text-xs"></i>
            </button>
          </div>
        </div>
      </div>

      {/* enquire only */}
      {enquireOnly && (
        <div className="mb-6 bg-white rounded-xl p-4">
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Full Name
            </label>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              type="text"
              className="w-full h-8 px-0 pr-10 border-b text-gray-800 border-gray-300 bg-white focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer  placeholder:font-normal font-medium tracking-tight"
              placeholder="Enter your full name"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="w-full h-8 px-0 pr-10 border-b text-gray-800 border-gray-300 bg-white focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer  placeholder:font-normal font-medium tracking-tight"
              placeholder="Enter your email"
            />
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium text-gray-800 mb-2">
              Phone
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              type="text"
              className="w-full h-8 px-0 pr-10 border-b text-gray-800 border-gray-300 bg-white focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer placeholder:font-normal font-medium tracking-tight"
              placeholder="Enter your phone number"
            />
          </div>
        </div>
      )}

      {/* Book Now Button */}
      <button
        onClick={() => submitHandler()}
        className="w-full h-12 bg-primary-600 text-white font-medium rounded-full flex items-center justify-center mb-3 hover:bg-primary-700 transition duration-150 cursor-pointer"
      >
        Book Now
        <i className="fi fi-rr-arrow-right ml-2"></i>
      </button>

      {/* Download Itinerary */}
      <button
        onClick={() => downloadHandler()}
        className="w-full h-12 text-center text-gray-800 flex items-center bg-white rounded-full justify-center hover:text-gray-800 cursor-pointer"
      >
        Download Itinerary
        <i className="fi fi-rr-download ml-2"></i>
      </button>
    </div>
  );
};

export default Form;
