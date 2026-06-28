"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  attractionInfo,
  getDetailsForBooking,
} from "../service";
import Button from "@/components/common/Button";
import AttractionTicketSelectionStep from "./AttractionTicketSelectionStep";
import PaymentProcessingOverlay from "@/components/PaymentProcessingOverlay/PaymentProcessingOverlay";
import PaymentSuccessPopup from "@/components/PaymentSuccessPopup/PaymentSuccessPopup";
import ErrorPopup from "@/components/ErrorPopup/ErrorPopup";
import { initializeRazorpayPayment } from "@/sdk/razorpay";
import { book, createOrder, verifyPayment, paymentFailure } from "@/app/checkout/attractions/service";
import { getLoggedInUserEmail } from "@/utils/authSession";
import { getPaymentErrorPayload, money } from "@/utils/paymentCheckoutUi";
import isLogin from "@/utils/isLogin";
import { formatTimeTo12Hour } from "@/utils/formatDate";
import {
  isActivityCloseoutDate,
  normalizeCloseoutDates,
} from "@/utils/closeoutUtils";

function attractionAdminPct(ticket) {
  return Math.max(0, Number(ticket?.admin_charge ?? 0));
}

function applyAdminCharge(amountRaw, adminPctRaw) {
  const amount = Number(amountRaw || 0);
  return Math.round(amount * 100) / 100;
}

/** Discount applies on the admin-inclusive amount. */
function applyDiscountOnAmount(amountRaw, discountPctRaw) {
  const amount = Number(amountRaw || 0);
  const pct = Math.max(0, Number(discountPctRaw || 0));
  if (pct <= 0) return amount;
  return Math.round((amount - (amount * pct) / 100) * 100) / 100;
}

function resolvePaxAdultChildRaw(ticket) {
  let adultPrice = parseFloat(ticket.adult_price || 0);
  let childPrice = parseFloat(ticket.child_price || 0);
  if (adultPrice === 0 && childPrice === 0 && ticket.full_rate) {
    adultPrice = parseFloat(ticket.full_rate);
    childPrice = parseFloat(ticket.full_rate);
  }
  return { adultPrice, childPrice };
}

function getAvailabilityMeta(slots) {
  if (slots == null || slots === "") {
    return { label: "Available", tone: "ok" };
  }
  const count = Number(slots);
  if (count <= 0) {
    return { label: "Sold out", tone: "soldout" };
  }
  if (count <= 5) {
    return { label: `${count} left`, tone: "low" };
  }
  return { label: `${count} available`, tone: "ok" };
}

function AccordionChevron({ expanded, className = "" }) {
  return (
    <span
      className={`fi-box h-8 w-8 shrink-0 rounded-full bg-gray-100 text-gray-600 ${className}`}
      aria-hidden="true"
    >
      <i
        className={`fi fi-br-angle-down text-[14px] transition-transform duration-200 ${
          expanded ? "rotate-180" : ""
        }`}
      />
    </span>
  );
}

function IconBox({ icon, size = "md", className = "" }) {
  const dim = size === "sm" ? "h-8 w-8" : "h-9 w-9";
  const glyph = size === "sm" ? "text-[14px]" : "text-[15px]";
  return (
    <span
      className={`fi-box ${dim} shrink-0 rounded-lg border border-gray-200 bg-gray-50 text-gray-600 ${className}`}
    >
      <i className={`${icon} ${glyph}`} aria-hidden="true" />
    </span>
  );
}

function MetaRow({ icon, children }) {
  return (
    <div className="flex items-start gap-3">
      <IconBox icon={icon} size="sm" />
      <span className="min-w-0 flex-1 pt-1.5 text-sm leading-snug text-gray-700">
        {children}
      </span>
    </div>
  );
}

function SummaryLine({ label, value, valueClassName = "text-gray-900 font-medium tabular-nums" }) {
  return (
    <div className="flex items-center justify-between gap-4 py-1.5">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm text-right ${valueClassName}`}>{value}</span>
    </div>
  );
}

function AttractionReviewRow({
  ticketName,
  visitDate,
  guestLabel,
  quantity,
  unitPrice,
  lineTotal,
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 shadow-sm">
      <span className="fi-box h-9 w-9 shrink-0 rounded-lg border border-gray-200 bg-gray-50 text-gray-600">
        <i className="fi fi-rr-ticket text-[14px]" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-gray-900">{ticketName}</p>
        <p className="mt-0.5 text-xs text-gray-500">{visitDate}</p>
        <p className="text-[11px] text-gray-400">
          {guestLabel} · Qty {quantity}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold tabular-nums text-gray-900">₹{lineTotal.toFixed(2)}</p>
        <p className="text-[11px] tabular-nums text-gray-400">₹{unitPrice.toFixed(2)} ea.</p>
      </div>
    </div>
  );
}

function getTicketUnitPrices(ticket) {
  const adm = attractionAdminPct(ticket);
  const pct = Number(ticket.discount || 0);
  if (ticket.rate_type === "full") {
    const afterAdmin = applyAdminCharge(Number(ticket.full_rate || 0), adm);
    const final = applyDiscountOnAmount(afterAdmin, pct);
    return {
      adult: { afterAdmin, final },
      child: { afterAdmin, final },
      hasDiscount: pct > 0,
    };
  }
  const { adultPrice, childPrice } = resolvePaxAdultChildRaw(ticket);
  const adultAfterAdmin = applyAdminCharge(adultPrice, adm);
  const childAfterAdmin = applyAdminCharge(childPrice, adm);
  return {
    adult: {
      afterAdmin: adultAfterAdmin,
      final: applyDiscountOnAmount(adultAfterAdmin, pct),
    },
    child: {
      afterAdmin: childAfterAdmin,
      final: applyDiscountOnAmount(childAfterAdmin, pct),
    },
    hasDiscount: pct > 0,
  };
}

function getTicketFromPrice(ticket) {
  const prices = getTicketUnitPrices(ticket);
  const lowest = Math.min(prices.adult.final, prices.child.final);
  return prices.hasDiscount ? lowest.toFixed(2) : String(lowest);
}

function getLineMaxQty(ticket, lineType, tickets) {
  const maxPerUser = Number(ticket.maximum_allowed_bookings_per_user || 10);
  const slots =
    ticket.available_slots != null ? Number(ticket.available_slots) : null;
  const other = lineType === "adult" ? tickets?.child || 0 : tickets?.adult || 0;
  let cap = maxPerUser;
  if (slots != null && slots >= 0) {
    cap = Math.min(cap, Math.max(0, slots - other));
  }
  return cap;
}

function TermsAgreement({ checked, onChange, id = "attractionTermsAgreement" }) {
  return (
    <label
      htmlFor={id}
      className="flex cursor-pointer items-start gap-2.5 rounded-lg border border-gray-200 bg-gray-50/80 px-3 py-2.5"
    >
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-3.5 w-3.5 shrink-0 rounded border-gray-300 text-gray-900 focus:ring-gray-400"
      />
      <span className="text-[11px] leading-snug text-gray-600">
        I agree to the{" "}
        <Link
          href="/termsandcondition"
          className="font-medium text-gray-900 underline underline-offset-2"
        >
          Terms & Conditions
        </Link>{" "}
        and{" "}
        <Link
          href="/termsandcondition#cancellation"
          className="font-medium text-gray-900 underline underline-offset-2"
        >
          Cancellation Policy
        </Link>
      </span>
    </label>
  );
}

const AttractionBookingPage = ({
  attractionId,
  closeoutDates = [],
  guideRate = 0,
  initialAttractionData = null,
}) => {
  const router = useRouter();
  const [attractionData, setAttractionData] = useState(initialAttractionData);
  const [ticketData, setTicketData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [selectedDate, setSelectedDate] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [adultChildTickets, setAdultChildTickets] = useState({});
  const [expandedTicketType, setExpandedTicketType] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [needGuide, setNeedGuide] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [checkoutError, setCheckoutError] = useState(null);
  const [paymentPhase, setPaymentPhase] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [completedBookingId, setCompletedBookingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState({
    title: "",
    message: "",
    emailSent: false,
    userEmail: "",
    visitDate: "",
    guestSummary: "",
    amountPaid: "",
  });
  const [showPaymentError, setShowPaymentError] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [pendingCheckout, setPendingCheckout] = useState(null);
  const [userContact, setUserContact] = useState({ email: "", phone: "" });

  // Check for mobile view
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Function to check if a date should be disabled (same as Form.jsx)
  const isDateDisabled = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const dateStr = `${year}-${month}-${day}`;

    return isActivityCloseoutDate(
      normalizeCloseoutDates(closeoutDates),
      dateStr,
      date
    );
  };

  // Initialise visit date from localStorage (detail page) or today, then load tickets for that date.
  useEffect(() => {
    if (!attractionId) return;

    const storedDate =
      typeof window !== "undefined"
        ? localStorage.getItem(`attraction_${attractionId}_selectedDate`)
        : null;
    const visitDate =
      storedDate && /^\d{4}-\d{2}-\d{2}$/.test(storedDate)
        ? storedDate
        : new Date().toISOString().split("T")[0];
    setSelectedDate(visitDate);

    const loadBookingDetails = async () => {
      try {
        setLoading(true);
        const response = await getDetailsForBooking(attractionId, visitDate);
        if (response?.data) {
          setAttractionData(response.data);
          setTicketData(response.data);
        }
      } catch (error) {
        console.error("Error fetching booking details:", error);
      } finally {
        setLoading(false);
      }
    };

    loadBookingDetails();
  }, [attractionId]);

  useEffect(() => {
    try {
      const user = JSON.parse(localStorage.getItem("user") || "null");
      if (!user) return;
      setUserContact({
        email: String(user.email || "").trim(),
        phone: String(user.phone || "").trim(),
      });
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    setPendingCheckout(null);
  }, [adultChildTickets, needGuide, selectedDate]);

  useEffect(() => {
    const prices = ticketData?.attraction_ticket_type_prices;
    if (prices?.length && expandedTicketType == null) {
      setExpandedTicketType(prices[0].attraction_ticket_type_id);
    }
  }, [ticketData?.attraction_ticket_type_prices, expandedTicketType]);

  const handleVisitDateChange = async (date) => {
    const dateString = date ? date.toISOString().split("T")[0] : "";
    setSelectedDate(dateString);
    setAdultChildTickets({});
    setExpandedTicketType(null);

    if (dateString && attractionId) {
      localStorage.setItem(`attraction_${attractionId}_selectedDate`, dateString);
      try {
        setLoading(true);
        const response = await getDetailsForBooking(attractionId, dateString);
        if (response?.data) {
          setAttractionData(response.data);
          setTicketData(response.data);
        }
      } catch (error) {
        console.error("Error fetching booking details for date:", error);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const handleQuantityChange = (ticketTypeId, change) => {
    const currentQuantity = selectedTickets[ticketTypeId] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);

    if (newQuantity === 0) {
      const newSelectedTickets = { ...selectedTickets };
      delete newSelectedTickets[ticketTypeId];
      setSelectedTickets(newSelectedTickets);
    } else {
      setSelectedTickets({
        ...selectedTickets,
        [ticketTypeId]: newQuantity,
      });
    }
  };

  const handleAdultChildQuantityChange = (ticketTypeId, type, change) => {
    const currentTickets = adultChildTickets[ticketTypeId] || {
      adult: 0,
      child: 0,
    };
    const newQuantity = Math.max(0, currentTickets[type] + change);

    const updatedTickets = {
      ...adultChildTickets,
      [ticketTypeId]: {
        ...currentTickets,
        [type]: newQuantity,
      },
    };

    // Remove the ticket type if both adult and child are 0
    if (
      updatedTickets[ticketTypeId].adult === 0 &&
      updatedTickets[ticketTypeId].child === 0
    ) {
      const newTickets = { ...updatedTickets };
      delete newTickets[ticketTypeId];
      setAdultChildTickets(newTickets);
    } else {
      setAdultChildTickets(updatedTickets);
    }
  };

  const handleTicketTypeClick = (ticketTypeId) => {
    if (expandedTicketType === ticketTypeId) {
      setExpandedTicketType(null);
    } else {
      setExpandedTicketType(ticketTypeId);
    }
  };

  const getTotalSelectedTickets = () => {
    return Object.values(adultChildTickets).reduce(
      (sum, tickets) => sum + tickets.adult + tickets.child,
      0
    );
  };

  const getSelectedCountForTicketType = (ticketTypeId) => {
    const tickets = adultChildTickets[ticketTypeId];
    if (!tickets) return 0;
    return tickets.adult + tickets.child;
  };

  const getTotalPrice = () => {
    let total = 0;

    // Calculate adult/child tickets
    Object.entries(adultChildTickets).forEach(([ticketTypeId, tickets]) => {
      const ticket = ticketData?.attraction_ticket_type_prices?.find(
        (t) => t.attraction_ticket_type_id == ticketTypeId
      );
      if (ticket && (tickets.adult > 0 || tickets.child > 0)) {
        const adm = attractionAdminPct(ticket);
        if (ticket.rate_type === "full") {
          const raw = Number(ticket.full_rate || 0);
          const afterAdmin = applyAdminCharge(raw, adm);
          const unit = applyDiscountOnAmount(afterAdmin, ticket.discount);
          total += unit * (tickets.adult + tickets.child);
        } else if (ticket.rate_type === "pax") {
          const { adultPrice: adultRaw, childPrice: childRaw } =
            resolvePaxAdultChildRaw(ticket);
          const adultAfterAdmin = applyAdminCharge(adultRaw, adm);
          const childAfterAdmin = applyAdminCharge(childRaw, adm);
          const adultUnit = applyDiscountOnAmount(
            adultAfterAdmin,
            ticket.discount
          );
          const childUnit = applyDiscountOnAmount(
            childAfterAdmin,
            ticket.discount
          );
          total += adultUnit * tickets.adult + childUnit * tickets.child;
        }
      }
    });

    // Add guide price if guide is selected
    if (needGuide && guideRate > 0) {
      total += parseFloat(guideRate);
    }
    return total;
  };

  const handleContinue = async () => {
    if (getTotalSelectedTickets() === 0) {
      return;
    }
    if (!selectedDate) {
      return;
    }
    await refreshBookingData();
    setCurrentStep(2);
  };

  const handleBack = async () => {
    setCurrentStep(1);
    setCheckoutError(null);
    setPendingCheckout(null);
    await refreshBookingData();
  };

  const refreshBookingData = async () => {
    if (!attractionId || !selectedDate) return;
    try {
      const response = await getDetailsForBooking(attractionId, selectedDate);
      if (response?.data) {
        setAttractionData(response.data);
        setTicketData(response.data);
      }
    } catch (error) {
      console.error("Error refreshing booking details:", error);
    }
  };

  const getGuestSummary = () => {
    const adultCount = Object.values(adultChildTickets).reduce(
      (sum, tickets) => sum + tickets.adult,
      0
    );
    const childCount = Object.values(adultChildTickets).reduce(
      (sum, tickets) => sum + tickets.child,
      0
    );
    return `${adultCount} adult(s), ${childCount} child(ren)`;
  };

  const buildApiBookingData = () => {
    const formattedTickets = [];
    let totalAmount = 0;
    let discountAmount = 0;

    Object.entries(adultChildTickets).forEach(([ticketTypeId, tickets]) => {
      if (tickets.adult === 0 && tickets.child === 0) return;

      const ticket = ticketData?.attraction_ticket_type_prices?.find(
        (t) => t.attraction_ticket_type_id == ticketTypeId
      );

      if (ticket && (tickets.adult > 0 || tickets.child > 0)) {
        const totalQuantity = tickets.adult + tickets.child;
        const adm = attractionAdminPct(ticket);

        if (ticket.rate_type === "full") {
          const originalRaw = Number(ticket.full_rate || 0);
          const afterAdmin = applyAdminCharge(originalRaw, adm);
          let ticketPrice = afterAdmin;
          if (ticket.discount > 0) {
            ticketPrice = applyDiscountOnAmount(afterAdmin, ticket.discount);
            discountAmount += (afterAdmin - ticketPrice) * totalQuantity;
          }

          const ticketTotal = ticketPrice * totalQuantity;
          totalAmount += ticketTotal;

          formattedTickets.push({
            id: parseInt(ticketTypeId, 10),
            attraction_ticket_type_id: parseInt(ticketTypeId, 10),
            quantity: totalQuantity,
            adult_quantity: tickets.adult,
            child_quantity: tickets.child,
            price: ticketPrice,
            unit_price: ticketPrice,
            total_price: ticketTotal,
            total: ticketTotal,
          });
        } else if (ticket.rate_type === "pax") {
          let adultPrice = parseFloat(ticket.adult_price || 0);
          let childPrice = parseFloat(ticket.child_price || 0);
          if (adultPrice === 0 && childPrice === 0 && ticket.full_rate) {
            adultPrice = parseFloat(ticket.full_rate);
            childPrice = parseFloat(ticket.full_rate);
          }

          const adultAfterAdmin = applyAdminCharge(adultPrice, adm);
          const childAfterAdmin = applyAdminCharge(childPrice, adm);
          let adultFinal = adultAfterAdmin;
          let childFinal = childAfterAdmin;

          if (ticket.discount > 0) {
            adultFinal = applyDiscountOnAmount(adultAfterAdmin, ticket.discount);
            childFinal = applyDiscountOnAmount(childAfterAdmin, ticket.discount);
            discountAmount +=
              (adultAfterAdmin - adultFinal) * tickets.adult +
              (childAfterAdmin - childFinal) * tickets.child;
          }

          const ticketTotal =
            adultFinal * tickets.adult + childFinal * tickets.child;
          totalAmount += ticketTotal;

          formattedTickets.push({
            id: parseInt(ticketTypeId, 10),
            attraction_ticket_type_id: parseInt(ticketTypeId, 10),
            quantity: totalQuantity,
            adult_quantity: tickets.adult,
            child_quantity: tickets.child,
            adult_price: adultFinal,
            child_price: childFinal,
            unit_price: adultFinal,
            total_price: ticketTotal,
            total: ticketTotal,
          });
        }
      }
    });

    if (!formattedTickets.length) return null;

    if (needGuide && guideRate > 0) {
      totalAmount += parseFloat(guideRate);
    }

    const adultCount = Object.values(adultChildTickets).reduce(
      (sum, tickets) => sum + tickets.adult,
      0
    );
    const childCount = Object.values(adultChildTickets).reduce(
      (sum, tickets) => sum + tickets.child,
      0
    );

    return {
      attraction_id: parseInt(attractionId, 10),
      visit_date: selectedDate,
      total_amount: parseFloat((totalAmount + discountAmount).toFixed(2)),
      discount_amount: parseFloat(discountAmount.toFixed(2)),
      adult_count: adultCount,
      child_count: childCount,
      bookingTickets: formattedTickets,
      include_guide: needGuide,
      guide_rate: needGuide ? guideRate : 0,
    };
  };

  const closePaymentError = () => {
    setShowPaymentError(false);
    setPaymentError(null);
  };

  const showPaymentErrorModal = (payload) => {
    setPaymentError(payload);
    setShowPaymentError(true);
  };

  const getOrderErrorPayload = (message) => ({
    variant: "warning",
    title: "Couldn't start payment",
    message: String(message || "We couldn't prepare your payment. Please try again."),
    hint: "Your booking is saved. You can continue to payment when you're ready.",
    canRetry: true,
    primaryLabel: "Continue to payment",
    primaryIcon: "fi-rr-refresh",
    secondaryLabel: "Close",
  });

  const resolveBookingIdFromVerify = (verificationResponse, fallbackBookingId) =>
    verificationResponse?.data?.payment?.attraction_booking_id ??
    verificationResponse?.data?.payment?.attractionBooking?.id ??
    verificationResponse?.data?.attraction_booking_id ??
    verificationResponse?.data?.attractionBooking?.id ??
    fallbackBookingId;

  const openRazorpayAndVerify = async (orderRes, paymentAmount, bookingId) => {
    setPaymentPhase(null);
    const paymentResponse = await initializeRazorpayPayment({
      amount: paymentAmount,
      currency: "INR",
      name: "Explore World",
      description: `Payment for ${attractionData?.name || "attraction"} tickets`,
      orderId: orderRes.data.order_id,
      key: orderRes.data.key,
      email: userContact.email,
      contact: userContact.phone,
    });

    if (!paymentResponse.status) {
      setPaymentPhase(null);
      try {
        await paymentFailure(orderRes.data.attraction_payment_id);
      } catch (_) {}
      showPaymentErrorModal(getPaymentErrorPayload(paymentResponse));
      return false;
    }

    setPaymentPhase("verifying");
    const verificationResponse = await verifyPayment({
      order_id: orderRes.data.order_id,
      payment_id: paymentResponse.data.razorpay_payment_id,
      signature: paymentResponse.data.razorpay_signature,
      customer_email: getLoggedInUserEmail() || userContact.email || undefined,
    });

    if (!verificationResponse.status) {
      setPaymentPhase(null);
      try {
        await paymentFailure(orderRes.data.attraction_payment_id);
      } catch (_) {}
      showPaymentErrorModal({
        variant: "error",
        title: "Payment verification failed",
        message:
          verificationResponse?.message || "We couldn't confirm your payment on our end.",
        hint: "If an amount was deducted from your account, please contact support with your payment reference.",
        canRetry: false,
        primaryLabel: "Close",
      });
      return false;
    }

    setPaymentPhase("confirming");
    await new Promise((resolve) => setTimeout(resolve, 450));
    setPaymentPhase(null);

    const resolvedBookingId = resolveBookingIdFromVerify(verificationResponse, bookingId);
    if (!resolvedBookingId) {
      showPaymentErrorModal({
        variant: "warning",
        title: "Payment received",
        message:
          "Your payment went through, but we couldn't load your ticket id. Check My Bookings for your confirmation.",
        hint: "If you don't see your booking within a few minutes, contact support.",
        canRetry: false,
        primaryLabel: "Close",
      });
      return false;
    }

    const userEmail = getLoggedInUserEmail() || userContact.email || "";
    setPendingCheckout(null);
    setCompletedBookingId(resolvedBookingId);
    setSuccessMessage({
      title: "You're all set!",
      message: "Your attraction tickets have been booked successfully.",
      emailSent: Boolean(verificationResponse?.data?.confirmation_email_sent),
      userEmail,
      visitDate: selectedDate ? formatDate(selectedDate) : "—",
      guestSummary: getGuestSummary(),
      amountPaid: money(paymentAmount),
    });
    setShowSuccess(true);
    localStorage.removeItem(`attraction_${attractionId}_selectedDate`);
    return true;
  };

  const goToCompletedTicket = () => {
    setShowSuccess(false);
    if (completedBookingId) {
      router.push(`/my-bookings/attraction/ticket/${completedBookingId}`);
    } else {
      router.push("/my-bookings?tab=attractions");
    }
  };

  const executeCheckout = async () => {
    setIsPaying(true);
    setCheckoutError(null);

    try {
      if (!termsAccepted) {
        setCheckoutError("Please accept the terms to continue");
        return;
      }

      const apiBookingData = buildApiBookingData();
      if (!apiBookingData) {
        setCheckoutError("Please select at least one ticket to continue");
        return;
      }

      let bookingId = pendingCheckout?.bookingId;
      let paymentAmount = pendingCheckout?.paymentAmount;

      if (!bookingId) {
        const response = await book(apiBookingData);
        if (!response.status) {
          setCheckoutError(response.message || "Failed to complete booking. Please try again.");
          return;
        }

        bookingId = response.data.id;
        paymentAmount =
          response?.data?.grand_total != null && response.data.grand_total !== ""
            ? Number(response.data.grand_total)
            : Number(grandTotalForSummary || 0);

        setPendingCheckout({ bookingId, paymentAmount });
      }

      setPaymentPhase("preparing");
      const orderRes = await createOrder({
        attraction_id: apiBookingData.attraction_id,
        attraction_booking_id: bookingId,
        amount: paymentAmount,
      });

      if (!orderRes.status) {
        setPaymentPhase(null);
        showPaymentErrorModal(getOrderErrorPayload(orderRes.message));
        return;
      }

      await openRazorpayAndVerify(orderRes, paymentAmount, bookingId);
    } catch (error) {
      setPaymentPhase(null);
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        showPaymentErrorModal({
          variant: "warning",
          title: "Verification taking longer",
          message: "Payment verification is taking longer than expected.",
          hint: "Please check My Bookings to confirm whether your payment was successful before trying again.",
          canRetry: false,
          primaryLabel: "Close",
        });
      } else {
        showPaymentErrorModal({
          variant: "error",
          title: "Something went wrong",
          message:
            error.response?.data?.message ||
            error.message ||
            "Failed to complete booking. Please try again.",
          hint: "Your ticket selection is still saved. You can try again in a moment.",
          canRetry: true,
          primaryLabel: "Try again",
          primaryIcon: "fi-rr-refresh",
          secondaryLabel: "Close",
        });
      }
    } finally {
      setIsPaying(false);
    }
  };

  const handlePaymentRetry = async () => {
    closePaymentError();
    setCheckoutError(null);
    await executeCheckout();
  };

  const handleProceedToPayment = () => {
    if (!isLogin()) {
      const event = new CustomEvent("showLogin");
      window.dispatchEvent(event);
      return;
    }

    executeCheckout();
  };

  const gstPercent = 18;
  const conveniencePercent = 2;

  // Compute discount-aware subtotal for summary
  let subtotalOriginal = 0;
  let discountForSummary = 0;
  Object.entries(adultChildTickets).forEach(([ticketTypeId, tickets]) => {
    const ticket = ticketData?.attraction_ticket_type_prices?.find(
      (t) => t.attraction_ticket_type_id == ticketTypeId
    );
    if (!ticket || (tickets.adult === 0 && tickets.child === 0)) return;

    const qty = tickets.adult + tickets.child;
    const pct = Number(ticket.discount || 0);

    const adm = attractionAdminPct(ticket);
    if (ticket.rate_type === "full") {
      const originalUnit = applyAdminCharge(Number(ticket.full_rate || 0), adm);
      const discountedUnit = applyDiscountOnAmount(originalUnit, pct);
      subtotalOriginal += originalUnit * qty;
      discountForSummary += (originalUnit - discountedUnit) * qty;
      return;
    }

    const { adultPrice: adultRaw, childPrice: childRaw } =
      resolvePaxAdultChildRaw(ticket);
    const adultUnit = applyAdminCharge(adultRaw, adm);
    const childUnit = applyAdminCharge(childRaw, adm);
    const discountedAdult = applyDiscountOnAmount(adultUnit, pct);
    const discountedChild = applyDiscountOnAmount(childUnit, pct);
    subtotalOriginal +=
      adultUnit * tickets.adult + childUnit * tickets.child;
    discountForSummary +=
      (adultUnit - discountedAdult) * tickets.adult +
      (childUnit - discountedChild) * tickets.child;
  });

  if (needGuide && guideRate > 0) {
    subtotalOriginal += Number(guideRate || 0);
  }

  const subtotalForSummary = Math.max(0, subtotalOriginal - discountForSummary);
  const gstAmount = (Number(subtotalForSummary || 0) * gstPercent) / 100;
  const afterGst = Number(subtotalForSummary || 0) + gstAmount;
  const convenienceAmount = (afterGst * conveniencePercent) / 100;
  const grandTotalForSummary = afterGst + convenienceAmount;

  const getPriceBreakdown = () => ({
    totalTickets: getTotalSelectedTickets(),
    subtotalOriginal,
    discountAmount: discountForSummary,
    subtotalAfterDiscount: subtotalForSummary,
    gstPercent,
    gstAmount,
    conveniencePercent,
    convenienceFeeAmount: convenienceAmount,
    grandTotal: grandTotalForSummary,
    guideAmount: needGuide && guideRate > 0 ? Number(guideRate) : 0,
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!attractionData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {loading ? "Loading..." : "Attraction not found"}
          </h2>
          <p className="text-gray-600">
            {loading
              ? "Please wait while we fetch the attraction details..."
              : "The attraction you're looking for doesn't exist or there was an error loading the data."}
          </p>
          {!loading && (
            <button
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
            >
              Try Again
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Mobile Attraction Details Header - Only visible on mobile */}
        <div className="lg:hidden mb-6">
          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
            <div className="flex items-center gap-3 p-4">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                {attractionData.cover_image || attractionData.thumb_image ? (
                  <Image
                    src={
                      attractionData.cover_image || attractionData.thumb_image
                    }
                    alt={attractionData.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <i className="fi fi-rr-image text-gray-400 text-xl"></i>
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">
                  Book tickets
                </p>
                <h1 className="truncate text-base font-semibold text-gray-900">
                  {attractionData.name}
                </h1>
              </div>
            </div>
            <div className="space-y-3 border-t border-gray-100 px-4 py-3">
              <MetaRow icon="fi fi-rr-clock">
                {formatTimeTo12Hour(attractionData.start_time) || "TBD"}
              </MetaRow>
              <MetaRow icon="fi fi-rr-map-marker">{attractionData.location}</MetaRow>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 mt-10">
          {/* Left Column - Ticket Selection */}
          <div className="min-w-0 max-w-full">
            {currentStep === 1 ? (
              <AttractionTicketSelectionStep
                selectedDate={selectedDate}
                onDateChange={handleVisitDateChange}
                isDateDisabled={isDateDisabled}
                ticketPrices={ticketData?.attraction_ticket_type_prices}
                adultChildTickets={adultChildTickets}
                expandedTicketType={expandedTicketType}
                onTicketTypeClick={handleTicketTypeClick}
                onAdultChildQuantityChange={handleAdultChildQuantityChange}
                getSelectedCountForTicketType={getSelectedCountForTicketType}
                getTotalSelectedTickets={getTotalSelectedTickets}
                getTicketFromPrice={getTicketFromPrice}
                getTicketUnitPrices={getTicketUnitPrices}
                getAvailabilityMeta={getAvailabilityMeta}
                getLineMaxQty={getLineMaxQty}
                needGuide={needGuide}
                onNeedGuideChange={setNeedGuide}
                guideRate={guideRate}
                formatDate={formatDate}
              />
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-3.5">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">
                      Step 2 of 2
                    </p>
                    <h2 className="mt-0.5 text-base font-semibold tracking-tight text-gray-900">
                      Review your tickets
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Confirm details before you pay
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="shrink-0 text-sm font-medium text-gray-500 transition-colors hover:text-gray-900"
                  >
                    Edit
                  </button>
                </div>

                <div className="space-y-2 bg-gray-50/50 p-4">
                  {Object.entries(adultChildTickets).flatMap(([ticketTypeId, tickets]) => {
                    if (tickets.adult === 0 && tickets.child === 0) return [];
                    const ticket = ticketData?.attraction_ticket_type_prices?.find(
                      (t) => t.attraction_ticket_type_id == ticketTypeId
                    );
                    const ticketName =
                      ticket?.attraction_ticket_type?.attraction_ticket_type_master?.name ||
                      "Ticket";
                    const unitPrices = getTicketUnitPrices(ticket);
                    const visitLabel = formatDate(selectedDate);
                    const rows = [];

                    if (tickets.adult > 0) {
                      rows.push(
                        <AttractionReviewRow
                          key={`${ticketTypeId}-adult`}
                          ticketName={ticketName}
                          visitDate={visitLabel}
                          guestLabel="Adult"
                          quantity={tickets.adult}
                          unitPrice={unitPrices.adult.final}
                          lineTotal={unitPrices.adult.final * tickets.adult}
                        />
                      );
                    }
                    if (tickets.child > 0) {
                      rows.push(
                        <AttractionReviewRow
                          key={`${ticketTypeId}-child`}
                          ticketName={ticketName}
                          visitDate={visitLabel}
                          guestLabel="Child"
                          quantity={tickets.child}
                          unitPrice={unitPrices.child.final}
                          lineTotal={unitPrices.child.final * tickets.child}
                        />
                      );
                    }
                    return rows;
                  })}

                  {needGuide && guideRate > 0 ? (
                    <AttractionReviewRow
                      ticketName="Guide service"
                      visitDate={formatDate(selectedDate)}
                      guestLabel="Add-on"
                      quantity={1}
                      unitPrice={Number(guideRate)}
                      lineTotal={Number(guideRate)}
                    />
                  ) : null}
                </div>

                <div className="border-t border-gray-100 p-4 lg:hidden">
                  <TermsAgreement
                    checked={termsAccepted}
                    onChange={setTermsAccepted}
                    id="attractionTermsMobile"
                  />
                  {checkoutError ? (
                    <p className="mt-2 text-xs text-red-600">{checkoutError}</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Attraction Details & Summary - Hidden on mobile */}
          <div className="hidden min-w-0 lg:block lg:shrink-0">
            <div className="sticky top-6 space-y-3">
              {currentStep === 1 ? (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    {attractionData.cover_image || attractionData.thumb_image ? (
                      <Image
                        src={
                          attractionData.cover_image || attractionData.thumb_image
                        }
                        alt={attractionData.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 33vw"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <i className="fi fi-rr-image text-gray-400 text-4xl"></i>
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    {attractionData.attraction_category_master?.name ? (
                      <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">
                        {attractionData.attraction_category_master.name}
                      </p>
                    ) : null}
                    <h3 className="mt-0.5 text-lg font-semibold tracking-tight text-gray-900">
                      {attractionData.name}
                    </h3>
                    <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                      {selectedDate ? (
                        <MetaRow icon="fi fi-rr-calendar">{formatDate(selectedDate)}</MetaRow>
                      ) : null}
                      <MetaRow icon="fi fi-rr-clock">
                        {formatTimeTo12Hour(attractionData.start_time) || "TBD"}
                      </MetaRow>
                      <MetaRow icon="fi fi-rr-map-marker">{attractionData.location}</MetaRow>
                    </div>
                  </div>
                </div>
              ) : null}

              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                  {currentStep === 2 ? (
                    <>
                      <p className="truncate text-[11px] font-medium uppercase tracking-widest text-gray-400">
                        {attractionData.name}
                      </p>
                      <h3 className="mt-0.5 text-sm font-semibold text-gray-900">Checkout</h3>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-semibold text-gray-900">Order summary</h3>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {getTotalSelectedTickets() > 0
                          ? `${getTotalSelectedTickets()} ticket${getTotalSelectedTickets() !== 1 ? "s" : ""} selected`
                          : "No tickets selected yet"}
                      </p>
                    </>
                  )}
                </div>

                <div className="p-4">
                  {(() => {
                    const b = getPriceBreakdown();
                    return (
                      <>
                        <div className="divide-y divide-gray-100">
                          <SummaryLine label="Tickets" value={b.totalTickets} />
                          {b.guideAmount > 0 ? (
                            <SummaryLine label="Guide" value={`₹${b.guideAmount.toFixed(2)}`} />
                          ) : null}
                          <SummaryLine
                            label="Subtotal"
                            value={`₹${b.subtotalAfterDiscount.toFixed(2)}`}
                          />
                          {b.discountAmount > 0 ? (
                            <SummaryLine
                              label="Discount"
                              value={`−₹${b.discountAmount.toFixed(2)}`}
                            />
                          ) : null}
                          {b.gstPercent > 0 ? (
                            <SummaryLine
                              label={`GST (${b.gstPercent}%)`}
                              value={`₹${b.gstAmount.toFixed(2)}`}
                            />
                          ) : null}
                          <SummaryLine
                            label={`Convenience (${b.conveniencePercent}%)`}
                            value={`₹${b.convenienceFeeAmount.toFixed(2)}`}
                          />
                        </div>

                        <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-900 px-3.5 py-3 text-white">
                          <span className="text-sm font-medium text-gray-300">
                            {currentStep === 2 ? "Total to pay" : "Grand total"}
                          </span>
                          <span className="text-xl font-bold tabular-nums">
                            ₹{b.grandTotal.toFixed(2)}
                          </span>
                        </div>
                      </>
                    );
                  })()}
                </div>

                <div className="border-t border-gray-100 px-4 pb-4 pt-3">
                  {currentStep === 1 ? (
                    <Button
                      onClick={handleContinue}
                      size="lg"
                      className="w-full"
                      disabled={getTotalSelectedTickets() === 0 || !selectedDate}
                    >
                      Continue to review
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="hidden lg:block">
                        <TermsAgreement
                          checked={termsAccepted}
                          onChange={setTermsAccepted}
                          id="attractionTermsDesktop"
                        />
                      </div>
                      {checkoutError ? (
                        <p className="hidden text-xs text-red-600 lg:block">{checkoutError}</p>
                      ) : null}
                      <Button
                        onClick={handleProceedToPayment}
                        size="lg"
                        className="w-full h-12 text-base font-semibold"
                        disabled={isPaying || !termsAccepted}
                      >
                        {isPaying
                          ? "Processing…"
                          : `Pay ₹${getPriceBreakdown().grandTotal.toFixed(2)}`}
                      </Button>
                      <div className="flex flex-col items-center gap-2">
                        <button
                          type="button"
                          onClick={handleBack}
                          className="fi-inline text-sm font-medium text-gray-500 transition-colors hover:text-gray-800"
                        >
                          <i className="fi fi-rr-angle-left text-[11px]" aria-hidden="true" />
                          <span>Edit ticket selection</span>
                        </button>
                        <p className="fi-inline m-0 text-[11px] text-gray-400">
                          <i className="fi fi-rr-shield-check text-[11px]" aria-hidden="true" />
                          <span>Secure checkout · Razorpay</span>
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile sticky bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur-sm shadow-[0_-4px_24px_rgba(0,0,0,0.08)]">
          {(() => {
            const b = getPriceBreakdown();
            if (currentStep === 1) {
              return (
                <div className="p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">
                        {getTotalSelectedTickets()} ticket
                        {getTotalSelectedTickets() !== 1 ? "s" : ""}
                      </p>
                      <p className="text-lg font-bold tabular-nums text-gray-900">
                        ₹{b.grandTotal.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={handleContinue}
                    size="lg"
                    className="w-full"
                    disabled={getTotalSelectedTickets() === 0 || !selectedDate}
                  >
                    Continue to review
                  </Button>
                </div>
              );
            }

            return (
              <div className="flex items-center gap-3 p-4">
                <button
                  type="button"
                  onClick={handleBack}
                  className="shrink-0 px-1 text-sm font-medium text-gray-500 hover:text-gray-800"
                >
                  Edit
                </button>
                <Button
                  onClick={handleProceedToPayment}
                  size="lg"
                  className="flex-1 h-12"
                  disabled={isPaying || !termsAccepted}
                >
                  {isPaying ? "Processing…" : `Pay ₹${b.grandTotal.toFixed(2)}`}
                </Button>
              </div>
            );
          })()}
        </div>

        {/* Bottom padding for mobile to prevent content from being hidden by fixed summary and navigation */}
        <div className={`lg:hidden ${currentStep === 2 ? "h-28" : "h-36"}`}></div>
      </div>

      <PaymentProcessingOverlay show={Boolean(paymentPhase)} stage={paymentPhase || "verifying"} />
      <PaymentSuccessPopup
        show={showSuccess}
        onClose={goToCompletedTicket}
        title={successMessage.title}
        message={successMessage.message}
        itemLabel="Your visit"
        itemTitle={attractionData?.name || "Attraction"}
        amountPaid={successMessage.amountPaid}
        detailLeftLabel="Visit date"
        detailLeft={successMessage.visitDate}
        detailRightLabel="Guests"
        detailRight={successMessage.guestSummary}
        emailSent={successMessage.emailSent}
        userEmail={successMessage.userEmail}
        primaryAction={{
          label: "View ticket",
          icon: "fi-rr-ticket",
          onClick: goToCompletedTicket,
        }}
        secondaryAction={{
          label: "Done",
          onClick: goToCompletedTicket,
        }}
      />
      <ErrorPopup
        show={showPaymentError}
        onClose={closePaymentError}
        variant={paymentError?.variant || "error"}
        title={paymentError?.title}
        message={paymentError?.message}
        hint={paymentError?.hint}
        closeOnBackdrop={paymentError?.variant === "cancelled"}
        primaryAction={
          paymentError?.canRetry
            ? {
                label: paymentError?.primaryLabel || "Try again",
                icon: paymentError?.primaryIcon,
                isLoading: isPaying && !paymentPhase,
                loadingLabel: "Opening payment…",
                onClick: handlePaymentRetry,
              }
            : { label: paymentError?.primaryLabel || "Close", onClick: closePaymentError }
        }
        secondaryAction={
          paymentError?.canRetry
            ? { label: paymentError?.secondaryLabel || "Close", onClick: closePaymentError }
            : null
        }
      />
    </div>
  );
};

export default AttractionBookingPage;
