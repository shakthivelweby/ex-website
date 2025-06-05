"use client";

import { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useRouter, useSearchParams } from "next/navigation";
import apiMiddleware from "@/app/api/apiMiddleware";
import SuccessPopup from "@/components/SuccessPopup/SuccessPopup";
import Button from "@/components/common/Button";

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
  const [error, setError] = useState({
    fullName: "",
    email: "",
    phone: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState({
    title: "",
    message: "",
  });


  const [isLoading, setIsLoading] = useState(false);

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
  };

  function formatDate(date) {
    return date.toISOString().split("T")[0];
  }

  // Validation functions
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone);
  };

  // Handle input changes with validation
  const handleFullNameChange = (e) => {
    const value = e.target.value;
    setFullName(value);
    if (error.fullName) {
      setError(prev => ({
        ...prev,
        fullName: value.trim() ? "" : "Full Name is required"
      }));
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    if (error.email) {
      setError(prev => ({
        ...prev,
        email: value ? (validateEmail(value) ? "" : "Please enter a valid email") : "Email is required"
      }));
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    setPhone(value);
    if (error.phone) {
      setError(prev => ({
        ...prev,
        phone: value ? (validatePhone(value) ? "" : "Please enter a valid 10-digit phone number") : "Phone is required"
      }));
    }
  };

  async function submitHandler() {
    setIsLoading(true);
    
    if (enquireOnly) {
      // Validate all fields
      const newErrors = {
        fullName: fullName.trim() ? "" : "Full Name is required",
        email: email ? (validateEmail(email) ? "" : "Please enter a valid email") : "Email is required",
        phone: phone ? (validatePhone(phone) ? "" : "Please enter a valid 10-digit phone number") : "Phone is required"
      };

      // Check if there are any errors
      if (Object.values(newErrors).some(error => error !== "")) {
        setError(newErrors);
        setIsLoading(false);
        return;
      }
    }

    const data = {
      package_id: packageData.data.id,
      enquiry_date: selectedDate.toISOString().split("T")[0],
      adult: adultCount,
      child: childCount,
      infant: infantCount,
      type: "booking",
    };

    if (enquireOnly) {
      data.type = "enquire";
      data.name = fullName.trim();
      data.email = email.trim();
      data.phone = phone.trim();
    }

    try {
      if(data.type === "enquire") {
        const res = await apiMiddleware.post("/package-enquiry", data);
        setSuccessMessage({
          title: "Enquiry Sent!",
          message: "We've received your enquiry and will get back to you soon.",
        });
      } else {
        const res = await apiMiddleware.post("/package-booking", data);
        setSuccessMessage({
          title: "Booking Successful!",
          message: "Your trip has been booked successfully. Check your email for details.",
        });
      }
      setShowSuccess(true);
      // Reset form if needed
      if (enquireOnly) {
        setFullName("");
        setEmail("");
        setPhone("");
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  function downloadHandler() {
    console.log("downloadHandler");
  }

  return (
    <>
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

        {/* Starting Date */}
        <div className="mb-4 bg-white rounded-xl p-4">
          <label className="block text-sm font-medium text-gray-800 mb-2">
            Starting Date
          </label>
          <div className="relative">
            <DatePicker
              minDate={new Date()}
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
                onChange={handleFullNameChange}
                type="text"
                className={`w-full h-8 px-0 pr-10 border-b text-gray-800 border-gray-300 bg-white focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer placeholder:font-normal font-medium tracking-tight ${
                  error.fullName ? "border-red-500" : ""
                }`}
                placeholder="Enter your full name"
              />
              {error.fullName && (
                <p className="text-red-500 text-xs mt-1">
                  <i className="fi fi-rr-info mr-1"></i>
                  {error.fullName}
                </p>
              )}
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Email
              </label>
              <input
                value={email}
                onChange={handleEmailChange}
                type="email"
                className={`w-full h-8 px-0 pr-10 border-b text-gray-800 border-gray-300 bg-white focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer placeholder:font-normal font-medium tracking-tight ${
                  error.email ? "border-red-500" : ""
                }`}
                placeholder="Enter your email"
              />
              {error.email && (
                <p className="text-red-500 text-xs mt-1">
                  <i className="fi fi-rr-info mr-1"></i>
                  {error.email}
                </p>
              )}
            </div>
            <div className="mb-2">
              <label className="block text-sm font-medium text-gray-800 mb-2">
                Phone
              </label>
              <input
                value={phone}
                onChange={handlePhoneChange}
                type="tel"
                maxLength={10}
                className={`w-full h-8 px-0 pr-10 border-b text-gray-800 border-gray-300 bg-white focus:outline-none focus:ring-none focus:border-primary-500 cursor-pointer placeholder:font-normal font-medium tracking-tight ${
                  error.phone ? "border-red-500" : ""
                }`}
                placeholder="Enter your phone number"
              />
              {error.phone && (
                <p className="text-red-500 text-xs mt-1">
                  <i className="fi fi-rr-info mr-1"></i>
                  {error.phone}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Book Now Button */}
        <Button
          onClick={submitHandler}
          size="lg"
          className="w-full mb-3"
          isLoading={isLoading}
          icon={<i className="fi fi-rr-arrow-right ml-2"></i>}
        >
          {enquireOnly ? "Enquire Now" : "Book Now"}
        </Button>

        {/* Download Itinerary */}
        <Button
          onClick={downloadHandler}
          variant="outline"
          size="lg"
          className="w-full"
          icon={<i className="fi fi-rr-download ml-2"></i>}
        >
          Download Itinerary
        </Button>
      </div>

      {/* Success Popup */}
      <SuccessPopup
        show={showSuccess}
        onClose={() => setShowSuccess(false)}
        title={successMessage.title}
        message={successMessage.message}
      />
    </>
  );
};

export default Form;
