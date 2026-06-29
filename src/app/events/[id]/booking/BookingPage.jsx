"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { getDetailsForBooking } from "../service";
import { eventInfo } from "../service";
import Button from "@/components/common/Button";
import BookingPageSkeleton from "@/components/loading/BookingPageSkeleton";
import EventTicketOptionCard from "./EventTicketOptionCard";
import PaymentProcessingOverlay from "@/components/PaymentProcessingOverlay/PaymentProcessingOverlay";
import PaymentSuccessPopup from "@/components/PaymentSuccessPopup/PaymentSuccessPopup";
import ErrorPopup from "@/components/ErrorPopup/ErrorPopup";
import { initializeRazorpayPayment } from "@/sdk/razorpay";
import { book, createOrder, verifyPayment, paymentFailure } from "@/app/checkout/events/service";
import { getLoggedInUserEmail } from "@/utils/authSession";
import { getPaymentErrorPayload, money } from "@/utils/paymentCheckoutUi";
import { getSplitPaymentPlan } from "@/utils/razorpayLimits";
import {
  isPartialPayment,
  resolveRemainingBalance,
  roundMoney,
} from "@/utils/paymentCompletion";
import SplitPaymentNotice from "@/components/booking/SplitPaymentNotice";
import PaymentTrustPanel from "@/components/booking/PaymentTrustPanel";
import BalancePaymentPopup from "@/components/booking/BalancePaymentPopup";
import isLogin from "@/utils/isLogin";

/** One row per ticket type — API can return duplicate price rows for the same day. */
function dedupeTicketPrices(prices) {
  if (!Array.isArray(prices)) return [];
  const byType = new Map();
  for (const row of prices) {
    const typeId = row?.event_ticket_type_id ?? row?.eventTicketTypeId;
    if (!typeId || byType.has(typeId)) continue;
    byType.set(typeId, row);
  }
  return Array.from(byType.values());
}

/** One row per show — duplicate show rows have been observed for the same slot. */
function dedupeEventShows(shows) {
  if (!Array.isArray(shows)) return [];
  const byKey = new Map();
  for (const show of shows) {
    const key =
      show?.id ??
      `${show?.name || ""}|${show?.start_time || ""}|${show?.end_time || ""}`;
    if (byKey.has(key)) continue;
    byKey.set(key, show);
  }
  return Array.from(byKey.values());
}

function normalizeBookingDays(days) {
  if (!Array.isArray(days)) return [];
  return days.map((date) => ({
    ...date,
    event_ticket_prices: dedupeTicketPrices(
      date.event_ticket_prices || date.eventTicketPrices
    ),
    event_shows: dedupeEventShows(date.event_shows || date.eventShows),
  }));
}

function getAvailabilityMeta(slots) {
  const count = Number(slots ?? 0);
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

function ReviewTicketRow({
  ticketName,
  dateLabel,
  showName,
  timeLabel,
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
        <p className="mt-0.5 text-xs text-gray-500">
          {dateLabel} · {showName}
        </p>
        <p className="text-[11px] text-gray-400">
          {timeLabel} · Qty {quantity}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-bold tabular-nums text-gray-900">₹{lineTotal.toFixed(2)}</p>
        <p className="text-[11px] tabular-nums text-gray-400">₹{unitPrice.toFixed(2)} ea.</p>
      </div>
    </div>
  );
}

function TermsAgreement({ checked, onChange, id = "eventTermsAgreement" }) {
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

const BookingPage = ({ eventId }) => {
  const router = useRouter();
  const [eventData, setEventData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTickets, setSelectedTickets] = useState({});
  const [expandedDate, setExpandedDate] = useState(null);
  const [expandedShow, setExpandedShow] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isContinuing, setIsContinuing] = useState(false);
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
    eventDate: "",
    ticketSummary: "",
    amountPaid: "",
  });
  const [showPaymentError, setShowPaymentError] = useState(false);
  const [paymentError, setPaymentError] = useState(null);
  const [pendingCheckout, setPendingCheckout] = useState(null);
  const [userContact, setUserContact] = useState({ email: "", phone: "" });
  const [razorpayMax, setRazorpayMax] = useState(null);
  const [balancePaymentPopup, setBalancePaymentPopup] = useState(null);

  // Fetch both event and booking details
  useEffect(() => {
    fetchData();
  }, [eventId]);

  useEffect(() => {
    if (!bookingData?.length) return;
    const firstDate = bookingData[0];
    if (firstDate?.id == null) return;
    setExpandedDate(firstDate.id);
    const firstShow = firstDate.event_shows?.[0];
    if (firstShow?.id != null) {
      setExpandedShow(`${firstDate.id}-${firstShow.id}`);
    }
  }, [bookingData]);

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
  }, [selectedTickets]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [eventResponse, bookingResponse] = await Promise.all([
        eventInfo(eventId),
        getDetailsForBooking(eventId),
      ]);

      setEventData(eventResponse.data);
      setBookingData(normalizeBookingDays(bookingResponse.data));
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    return date.toLocaleDateString("en-US", options);
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const handleDateClick = (dateId) => {
    if (expandedDate === dateId) {
      setExpandedDate(null);
      setExpandedShow(null);
    } else {
      setExpandedDate(dateId);
      setExpandedShow(null);
    }
  };

  const handleShowClick = (dateId, showId) => {
    const key = `${dateId}-${showId}`;
    if (expandedShow === key) {
      setExpandedShow(null);
    } else {
      setExpandedShow(key);
    }
  };

  const handleQuantityChange = (dateId, showId, ticketTypeId, change) => {
    const key = `${dateId}-${showId}-${ticketTypeId}`;
    const currentQuantity = selectedTickets[key] || 0;
    const newQuantity = Math.max(0, currentQuantity + change);

    if (newQuantity === 0) {
      const newSelectedTickets = { ...selectedTickets };
      delete newSelectedTickets[key];
      setSelectedTickets(newSelectedTickets);
    } else {
      setSelectedTickets({
        ...selectedTickets,
        [key]: newQuantity,
      });
    }
  };

  const getTotalSelectedTickets = () => {
    return Object.values(selectedTickets).reduce(
      (sum, quantity) => sum + quantity,
      0
    );
  };

  const getSelectedCountForDate = (dateId) =>
    Object.entries(selectedTickets).reduce((sum, [key, qty]) => {
      if (qty <= 0) return sum;
      const [dId] = key.split("-");
      return dId == dateId ? sum + qty : sum;
    }, 0);

  const getSelectedCountForShow = (dateId, showId) =>
    Object.entries(selectedTickets).reduce((sum, [key, qty]) => {
      if (qty <= 0) return sum;
      const [dId, sId] = key.split("-");
      return dId == dateId && sId == showId ? sum + qty : sum;
    }, 0);

  const getLowestPriceForDate = (date) => {
    const prices = date?.event_ticket_prices || [];
    if (!prices.length) return 0;
    return Math.min(
      ...prices.map((t) => {
        const afterAdmin = Number(t?.price || 0);
        const final =
          Number(t?.discount || 0) > 0
            ? afterAdmin - (afterAdmin * Number(t.discount)) / 100
            : afterAdmin;
        return Math.round(final * 100) / 100;
      })
    );
  };

  const getMaxQuantity = (ticketPrice) => {
    const perUser = Number(ticketPrice.maximum_allowed_bookings_per_user);
    const slots = Number(ticketPrice.available_slots);
    const limits = [slots].filter((n) => Number.isFinite(n) && n >= 0);
    if (Number.isFinite(perUser) && perUser > 0) limits.push(perUser);
    if (!limits.length) return 99;
    return Math.min(...limits);
  };

  const applyAdminCharge = (amountRaw, adminPctRaw) => {
    const amount = Number(amountRaw || 0);
    return Math.round(amount * 100) / 100;
  };

  const applyDiscount = (amountRaw, discountPctRaw) => {
    const amount = Number(amountRaw || 0);
    const pct = Math.max(0, Number(discountPctRaw || 0));
    if (pct <= 0) return Math.round(amount * 100) / 100;
    return Math.round((amount - (amount * pct) / 100) * 100) / 100;
  };

  const getTotalPrice = () => {
    let total = 0;
    Object.entries(selectedTickets).forEach(([key, quantity]) => {
      const [dateId, showId, ticketTypeId] = key.split("-");
      const date = bookingData?.find((d) => d.id == dateId);
      const ticketPrice = date?.event_ticket_prices.find(
        (t) => t.event_ticket_type_id == ticketTypeId
      );

      if (ticketPrice && quantity > 0) {
        const unitAfterAdmin = applyAdminCharge(
          ticketPrice.price,
          ticketPrice.admin_charge
        );
        total += unitAfterAdmin * quantity;
      }
    });
    return total;
  };

  const getPriceBreakdown = () => {
    const GST_PERCENT = 18;
    const CONVENIENCE_PERCENT = 2;

    let totalAmount = 0;
    let discountAmount = 0;

    Object.entries(selectedTickets).forEach(([key, quantity]) => {
      const [dateId, showId, ticketTypeId] = key.split("-");
      const date = bookingData?.find((d) => d.id == dateId);
      const ticketPrice = date?.event_ticket_prices.find(
        (t) => t.event_ticket_type_id == ticketTypeId
      );
      if (!ticketPrice || quantity <= 0) return;

      const unitAfterAdmin = applyAdminCharge(
        ticketPrice.price,
        ticketPrice.admin_charge
      );
      const lineTotal = unitAfterAdmin * quantity;
      const pct = parseFloat(ticketPrice.discount || 0);
      const unitFinal = applyDiscount(unitAfterAdmin, pct);
      const lineDiscount = (unitAfterAdmin - unitFinal) * quantity;

      totalAmount += lineTotal;
      discountAmount += lineDiscount;
    });

    const subtotalAfterDiscount = Math.max(0, totalAmount - discountAmount);

    const gstAmount = (subtotalAfterDiscount * GST_PERCENT) / 100;
    const afterGst = subtotalAfterDiscount + gstAmount;
    const convenienceFeeAmount = (afterGst * CONVENIENCE_PERCENT) / 100;
    const grandTotal = afterGst + convenienceFeeAmount;

    return {
      totalAmount,
      discountAmount,
      subtotalAfterDiscount,
      gstPercent: GST_PERCENT,
      gstAmount,
      conveniencePercent: CONVENIENCE_PERCENT,
      convenienceFeeAmount,
      grandTotal,
    };
  };

  const getCheckoutPayLabel = (grandTotal) => {
    const plan = getSplitPaymentPlan(grandTotal, razorpayMax);
    return plan.requiresSplit
      ? `Pay ₹${plan.firstPayment.toFixed(2)} now`
      : `Pay ₹${grandTotal.toFixed(2)}`;
  };

  const refreshBookingSlots = async () => {
    try {
      const bookingResponse = await getDetailsForBooking(eventId);
      setBookingData(normalizeBookingDays(bookingResponse.data));
    } catch (error) {
      console.error("Error refreshing ticket availability:", error);
    }
  };

  const handleContinue = async () => {
    if (getTotalSelectedTickets() === 0) {
      alert("Please select at least one ticket to continue");
      return;
    }
    setIsContinuing(true);
    try {
      await refreshBookingSlots();
      setCurrentStep(2);
    } finally {
      setIsContinuing(false);
    }
  };

  const handleBack = async () => {
    setCurrentStep(1);
    setCheckoutError(null);
    setPendingCheckout(null);
    await refreshBookingSlots();
  };

  const buildApiBookingData = () => {
    const formattedTickets = [];
    let totalAmount = 0;
    let discountAmount = 0;

    Object.entries(selectedTickets).forEach(([key, quantity]) => {
      if (quantity === 0) return;

      const [dateId, showId, ticketTypeId] = key.split("-");
      const date = bookingData?.find((d) => d.id == dateId);
      const show = date?.event_shows.find((s) => s.id == showId);
      const ticketPrice = date?.event_ticket_prices.find(
        (t) => t.event_ticket_type_id == ticketTypeId
      );

      if (date && show && ticketPrice && quantity > 0) {
        const unitAfterAdmin = applyAdminCharge(
          ticketPrice.price,
          ticketPrice.admin_charge
        );
        const ticketTotal = unitAfterAdmin * quantity;
        totalAmount += ticketTotal;

        const pct = parseFloat(ticketPrice.discount || 0);
        if (pct > 0) {
          const unitFinal = applyDiscount(unitAfterAdmin, pct);
          discountAmount += (unitAfterAdmin - unitFinal) * quantity;
        }

        formattedTickets.push({
          event_ticket_type_id: parseInt(ticketTypeId, 10),
          quantity,
          unit_price: unitAfterAdmin,
          total_price: ticketTotal,
        });
      }
    });

    const firstTicketKey = Object.keys(selectedTickets).find(
      (key) => selectedTickets[key] > 0
    );
    if (!firstTicketKey || !formattedTickets.length) return null;

    const [dateId, showId] = firstTicketKey.split("-");

    return {
      event_id: parseInt(eventId, 10),
      event_day_id: parseInt(dateId, 10),
      event_show_id: parseInt(showId, 10),
      total_amount: parseFloat(totalAmount.toFixed(2)),
      discount_amount: parseFloat(discountAmount.toFixed(2)),
      bookingTickets: formattedTickets,
    };
  };

  const getFirstSelectedEventDateLabel = () => {
    const firstTicketKey = Object.keys(selectedTickets).find(
      (key) => selectedTickets[key] > 0
    );
    if (!firstTicketKey) return "—";
    const [dateId] = firstTicketKey.split("-");
    const date = bookingData?.find((d) => d.id == dateId);
    return date?.date ? formatDate(date.date) : "—";
  };

  const closePaymentError = () => {
    setShowPaymentError(false);
    setPaymentError(null);
  };

  const showPaymentErrorModal = (payload) => {
    setPaymentError(payload);
    setShowPaymentError(true);
  };

  const getOrderErrorPayload = (message) => {
    const text = String(message || "");
    if (/maximum amount/i.test(text)) {
      return {
        variant: "warning",
        title: "Payment amount too high",
        message:
          "This order exceeds Razorpay's per-transaction limit for your account. We've updated checkout to split large payments automatically — please try again.",
        hint: "If it still fails, ask your admin to raise the limit in the Razorpay Dashboard (Account → Transaction limits).",
        canRetry: true,
        primaryLabel: "Try again",
        primaryIcon: "fi-rr-refresh",
        secondaryLabel: "Close",
      };
    }
    return {
      variant: "warning",
      title: "Couldn't start payment",
      message: text || "We couldn't prepare your payment. Please try again.",
      hint: "Your booking is saved. You can continue to payment when you're ready.",
      canRetry: true,
      primaryLabel: "Continue to payment",
      primaryIcon: "fi-rr-refresh",
      secondaryLabel: "Close",
    };
  };

  const resolveBookingIdFromVerify = (verificationResponse, fallbackBookingId) =>
    verificationResponse?.data?.payment?.event_booking_id ??
    verificationResponse?.data?.payment?.eventBooking?.id ??
    verificationResponse?.data?.event_booking_id ??
    verificationResponse?.data?.eventBooking?.id ??
    fallbackBookingId;

  const openRazorpayAndVerify = async (
    orderRes,
    paymentAmount,
    bookingId,
    priorPaidAmount = 0
  ) => {
    setPaymentPhase(null);
    const chargeAmount = Number(orderRes?.data?.amount ?? paymentAmount);
    const paymentResponse = await initializeRazorpayPayment({
      amount: chargeAmount,
      currency: "INR",
      name: "Explore World",
      description: `Payment for ${eventData?.name || "event"} tickets`,
      orderId: orderRes.data.order_id,
      key: orderRes.data.key,
      email: userContact.email,
      contact: userContact.phone,
    });

    if (!paymentResponse.status) {
      setPaymentPhase(null);
      try {
        await paymentFailure(orderRes.data.event_payment_id);
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
        await paymentFailure(orderRes.data.event_payment_id);
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
    const ticketCount = getTotalSelectedTickets();
    const remainingBalance = resolveRemainingBalance(verificationResponse, orderRes, {
      bookingRelation: "eventBooking",
      bookingRelationSnake: "event_booking",
    });
    const isPartial = isPartialPayment(verificationResponse, orderRes, {
      bookingRelation: "eventBooking",
      bookingRelationSnake: "event_booking",
    });
    const totalPaid = roundMoney(priorPaidAmount + chargeAmount);

    setPendingCheckout(
      isPartial ? { bookingId: resolvedBookingId, paymentAmount: remainingBalance } : null
    );
    setCompletedBookingId(resolvedBookingId);

    if (isPartial) {
      setBalancePaymentPopup({
        bookingId: resolvedBookingId,
        eventId: parseInt(eventId, 10),
        paidAmount: totalPaid,
        remainingBalance,
        emailSent: Boolean(verificationResponse?.data?.confirmation_email_sent),
        userEmail,
      });
      return true;
    }

    setBalancePaymentPopup(null);
    setSuccessMessage({
      title: "You're all set!",
      message: "Your event tickets have been booked successfully.",
      emailSent: Boolean(verificationResponse?.data?.confirmation_email_sent),
      userEmail,
      eventDate: getFirstSelectedEventDateLabel(),
      ticketSummary: `${ticketCount} ticket${ticketCount !== 1 ? "s" : ""}`,
      amountPaid: money(totalPaid),
    });
    setShowSuccess(true);
    return true;
  };

  const goToCompletedTicket = () => {
    setShowSuccess(false);
    setBalancePaymentPopup(null);
    if (completedBookingId) {
      router.push(`/my-bookings/event/ticket/${completedBookingId}`);
    } else {
      router.push("/my-bookings?tab=events");
    }
  };

  const handleBalancePayLater = () => {
    setBalancePaymentPopup(null);
    router.push("/my-bookings?tab=events");
  };

  const executeBalancePayment = async () => {
    if (!balancePaymentPopup || isPaying) return;

    const { bookingId, eventId, remainingBalance, paidAmount } = balancePaymentPopup;
    setIsPaying(true);
    setCheckoutError(null);

    try {
      setPaymentPhase("preparing");
      const orderRes = await createOrder({
        event_id: eventId,
        event_booking_id: bookingId,
        amount: remainingBalance,
      });

      if (!orderRes.status) {
        setPaymentPhase(null);
        showPaymentErrorModal(getOrderErrorPayload(orderRes.message));
        return;
      }

      if (orderRes.data?.max_transaction_amount != null) {
        setRazorpayMax(Number(orderRes.data.max_transaction_amount));
      }

      await openRazorpayAndVerify(
        orderRes,
        Number(orderRes.data?.amount ?? remainingBalance),
        bookingId,
        paidAmount
      );
    } catch (error) {
      setPaymentPhase(null);
      showPaymentErrorModal({
        variant: "error",
        title: "Something went wrong",
        message:
          error.response?.data?.message ||
          error.message ||
          "Failed to process balance payment. Please try again.",
        hint: "You can also pay the remaining balance from My Bookings.",
        canRetry: true,
        primaryLabel: "Try again",
        primaryIcon: "fi-rr-refresh",
        secondaryLabel: "Close",
      });
    } finally {
      setIsPaying(false);
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

      const breakdown = getPriceBreakdown();
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
            : Number(breakdown.grandTotal || 0);

        setPendingCheckout({ bookingId, paymentAmount });
      }

      setPaymentPhase("preparing");
      const orderRes = await createOrder({
        event_id: apiBookingData.event_id,
        event_booking_id: bookingId,
        amount: paymentAmount,
      });

      if (!orderRes.status) {
        setPaymentPhase(null);
        showPaymentErrorModal(getOrderErrorPayload(orderRes.message));
        return;
      }

      if (orderRes.data?.max_transaction_amount != null) {
        setRazorpayMax(Number(orderRes.data.max_transaction_amount));
      }

      await openRazorpayAndVerify(
        orderRes,
        Number(orderRes.data?.amount ?? paymentAmount),
        bookingId
      );
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

  if (loading) {
    return <BookingPageSkeleton />;
  }

  if (!eventData || !bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            Event not found
          </h2>
          <p className="text-gray-600">
            The event you're looking for doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-4 ">
        {/* Mobile Event Details Header - Only visible on mobile */}
        <div className="lg:hidden mb-6">
          <div className="bg-white rounded-lg shadow border p-4">
            <div className="flex items-center gap-3 mb-4">
              <div>
                <h1 className="text-lg font-semibold text-gray-800">
                  Book Tickets
                </h1>
                <p className="text-sm text-gray-600">{eventData.name}</p>
              </div>
            </div>

            <div className="space-y-3 text-sm">
              <MetaRow icon="fi fi-rr-calendar">
                {formatDate(eventData.starting_date)} – {formatDate(eventData.ending_date)}
              </MetaRow>
              <MetaRow icon="fi fi-rr-map-marker">{eventData.location}</MetaRow>
              <MetaRow icon="fi fi-rr-clock">{eventData.duration}</MetaRow>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] gap-6 mt-10">
          {/* Left Column - Ticket Selection */}
          <div className="min-w-0 max-w-full">
            {currentStep === 1 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
                <div className="px-4 py-3.5 border-b border-gray-100">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">
                        Step 1 of 2
                      </p>
                      <h2 className="text-base font-semibold text-gray-900 tracking-tight mt-0.5">
                        Select tickets
                      </h2>
                    </div>
                    {getTotalSelectedTickets() > 0 ? (
                      <div className="shrink-0 rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-center">
                        <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400">
                          Selected
                        </p>
                        <p className="text-lg font-bold leading-none tabular-nums text-gray-900">
                          {getTotalSelectedTickets()}
                        </p>
                      </div>
                    ) : null}
                  </div>
                </div>

                <div className="p-3 sm:p-4 space-y-2 bg-gray-50/50">
                  {bookingData?.map((date) => {
                    const dateSelected = getSelectedCountForDate(date.id);
                    const isDateExpanded = expandedDate === date.id;
                    const lowestPrice = getLowestPriceForDate(date);

                    return (
                      <div
                        key={date.id}
                        className={`rounded-xl border overflow-hidden transition-all duration-200 ${
                          isDateExpanded
                            ? "border-gray-300 shadow-sm"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <button
                          type="button"
                          className={`w-full px-3 sm:px-4 py-3 text-left transition-colors ${
                            isDateExpanded
                              ? "bg-white"
                              : "bg-white hover:bg-gray-50/80"
                          }`}
                          onClick={() => handleDateClick(date.id)}
                          aria-expanded={isDateExpanded}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div
                                className={`flex flex-col items-center justify-center w-12 h-12 rounded-lg border shrink-0 ${
                                  isDateExpanded
                                    ? "bg-gray-900 border-gray-900 text-white"
                                    : "bg-white border-gray-200 text-gray-900"
                                }`}
                              >
                                <span className="text-[9px] font-semibold uppercase tracking-wide opacity-80">
                                  {new Date(date.date).toLocaleDateString("en-US", {
                                    month: "short",
                                  })}
                                </span>
                                <span className="text-lg font-bold leading-none">
                                  {new Date(date.date).getDate()}
                                </span>
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-base font-semibold text-gray-900 truncate">
                                  {formatDate(date.date)}
                                </h3>
                                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white text-gray-600 text-xs font-medium rounded-full border border-gray-200">
                                    <span className="fi-box h-3 w-3">
                                      <i className="fi fi-rr-play text-[8px]" aria-hidden="true" />
                                    </span>
                                    {date.event_shows.length} show
                                    {date.event_shows.length !== 1 ? "s" : ""}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {date.event_ticket_prices.length} ticket types
                                  </span>
                                  {dateSelected > 0 ? (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                                      {dateSelected} selected
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                            <div className="flex shrink-0 items-center gap-2.5">
                              <div className="hidden min-w-[4.5rem] text-right sm:block">
                                <p className="text-[10px] font-medium uppercase tracking-wide text-gray-400 leading-none">
                                  From
                                </p>
                                <p className="mt-1 text-base font-semibold text-gray-900 tabular-nums leading-none">
                                  ₹{lowestPrice}
                                </p>
                              </div>
                              <AccordionChevron expanded={isDateExpanded} />
                            </div>
                          </div>
                        </button>

                        {isDateExpanded ? (
                          <div className="border-t border-gray-100 bg-white">
                            {date.event_shows.map((show, showIndex) => {
                              const showKey = `${date.id}-${show.id}`;
                              const isShowExpanded = expandedShow === showKey;
                              const showSelected = getSelectedCountForShow(
                                date.id,
                                show.id
                              );

                              return (
                                <div
                                  key={show.id}
                                  className={
                                    showIndex !== date.event_shows.length - 1
                                      ? "border-b border-gray-100/80"
                                      : ""
                                  }
                                >
                                  <button
                                    type="button"
                                    className={`w-full px-3 sm:px-4 py-2.5 text-left transition-colors ${
                                      isShowExpanded
                                        ? "bg-white border-b border-gray-100"
                                        : "bg-gray-50/80 hover:bg-gray-100/80"
                                    }`}
                                    onClick={() => handleShowClick(date.id, show.id)}
                                    aria-expanded={isShowExpanded}
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="flex min-w-0 items-center gap-3">
                                        <IconBox
                                          icon="fi fi-rr-clock"
                                          className={
                                            isShowExpanded
                                              ? "bg-gray-100 text-gray-700"
                                              : ""
                                          }
                                        />
                                        <div className="min-w-0">
                                          <h4 className="text-sm font-semibold text-gray-900">
                                            {show.name}
                                          </h4>
                                          <p className="text-xs text-gray-600 mt-0.5">
                                            {formatTime(show.start_time)} –{" "}
                                            {formatTime(show.end_time)}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="flex shrink-0 items-center gap-2.5">
                                        <div className="flex min-h-[2rem] min-w-[4.5rem] items-center justify-end">
                                          {showSelected > 0 ? (
                                            <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full leading-none">
                                              {showSelected} selected
                                            </span>
                                          ) : (
                                            <span className="text-xs text-gray-500 leading-none">
                                              {date.event_ticket_prices.length} options
                                            </span>
                                          )}
                                        </div>
                                        <AccordionChevron expanded={isShowExpanded} />
                                      </div>
                                    </div>
                                  </button>

                                  {isShowExpanded ? (
                                    <div
                                      className="mx-2 sm:mx-3 mb-2.5 mt-0.5 rounded-lg p-2 space-y-1.5"
                                      style={{ backgroundColor: "#e9e9ec" }}
                                    >
                                      {date.event_ticket_prices.map((ticketPrice) => {
                                        const key = `${date.id}-${show.id}-${ticketPrice.event_ticket_type_id}`;
                                        const qty = selectedTickets[key] || 0;
                                        const isSelected = qty > 0;
                                        const ticketType = ticketPrice.event_ticket_type;
                                        const afterAdmin = applyAdminCharge(
                                          ticketPrice.price,
                                          ticketPrice.admin_charge
                                        );
                                        const finalPrice = applyDiscount(
                                          afterAdmin,
                                          ticketPrice.discount
                                        );
                                        const hasDiscount =
                                          Number(ticketPrice.discount || 0) > 0;
                                        const maxQty = getMaxQuantity(ticketPrice);
                                        const isSoldOut = maxQty <= 0;
                                        const availability = getAvailabilityMeta(
                                          ticketPrice.available_slots
                                        );

                                        return (
                                          <EventTicketOptionCard
                                            key={`${show.id}-${ticketPrice.event_ticket_type_id}`}
                                            name={ticketType?.name || "Ticket"}
                                            price={
                                              hasDiscount
                                                ? finalPrice.toFixed(2)
                                                : String(afterAdmin)
                                            }
                                            originalPrice={String(afterAdmin)}
                                            hasDiscount={hasDiscount}
                                            availability={availability.label}
                                            maxQty={maxQty}
                                            isSoldOut={isSoldOut}
                                            qty={qty}
                                            isSelected={isSelected}
                                            lineTotal={
                                              isSelected
                                                ? `₹${(finalPrice * qty).toFixed(2)}`
                                                : null
                                            }
                                            onDecrease={() =>
                                              handleQuantityChange(
                                                date.id,
                                                show.id,
                                                ticketPrice.event_ticket_type_id,
                                                -1
                                              )
                                            }
                                            onIncrease={() =>
                                              handleQuantityChange(
                                                date.id,
                                                show.id,
                                                ticketPrice.event_ticket_type_id,
                                                1
                                              )
                                            }
                                          />
                                        );
                                      })}
                                    </div>
                                  ) : null}
                                </div>
                              );
                            })}
                          </div>
                        ) : null}
                      </div>
                    );
                  })}

                  {getTotalSelectedTickets() === 0 ? (
                    <p className="text-center text-[11px] text-gray-400 py-1">
                      Use + on a ticket to add passes
                    </p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-sm">
                <div className="flex items-start justify-between gap-4 border-b border-gray-100 px-4 py-3.5">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">
                      Step 2 of 2
                    </p>
                    <h2 className="mt-0.5 text-base font-semibold text-gray-900 tracking-tight">
                      Review your tickets
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Confirm details before you pay
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleBack}
                    className="shrink-0 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
                  >
                    Edit
                  </button>
                </div>

                <SplitPaymentNotice
                  grandTotal={getPriceBreakdown().grandTotal}
                  className="mx-4 mt-3"
                />

                <div className="space-y-2 bg-gray-50/50 p-4">
                  {Object.entries(selectedTickets).map(([key, quantity]) => {
                    if (quantity === 0) return null;
                    const [dateId, showId, ticketTypeId] = key.split("-");
                    const date = bookingData?.find((d) => d.id == dateId);
                    const show = date?.event_shows.find((s) => s.id == showId);
                    const ticketPrice = date?.event_ticket_prices.find(
                      (t) => t.event_ticket_type_id == ticketTypeId
                    );
                    const ticketType = ticketPrice?.event_ticket_type;
                    const afterAdmin = applyAdminCharge(
                      ticketPrice?.price,
                      ticketPrice?.admin_charge
                    );
                    const final = applyDiscount(afterAdmin, ticketPrice?.discount);
                    const lineTotal = final * quantity;

                    return (
                      <ReviewTicketRow
                        key={key}
                        ticketName={ticketType?.name || "Ticket"}
                        dateLabel={formatDate(date?.date)}
                        showName={show?.name || "Show"}
                        timeLabel={`${formatTime(show?.start_time)} – ${formatTime(show?.end_time)}`}
                        quantity={quantity}
                        unitPrice={final}
                        lineTotal={lineTotal}
                      />
                    );
                  })}
                </div>

                <div className="space-y-3 border-t border-gray-100 p-4">
                  <PaymentTrustPanel />
                  <div className="rounded-xl border border-blue-100 bg-blue-50/80 p-3.5">
                    <p className="text-xs leading-relaxed text-blue-900">
                      <i className="fi fi-rr-envelope relative top-0 mr-1.5" aria-hidden="true" />
                      You&apos;ll receive an instant confirmation email with your e-ticket after payment.
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-100 p-4 lg:hidden">
                  <TermsAgreement checked={termsAccepted} onChange={setTermsAccepted} id="eventTermsMobile" />
                  {checkoutError ? (
                    <p className="mt-2 text-xs text-red-600">{checkoutError}</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Event Details & Summary - Hidden on mobile */}
          <div className="hidden min-w-0 lg:block lg:shrink-0">
            <div className="sticky top-6 space-y-3">
              {currentStep === 1 ? (
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-gray-100">
                    <Image
                      src={eventData.cover_image}
                      alt={eventData.name}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </div>
                  <div className="p-4">
                    {eventData.event_category_master?.name ? (
                      <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400">
                        {eventData.event_category_master.name}
                      </p>
                    ) : null}
                    <h3 className="text-lg font-semibold text-gray-900 tracking-tight mt-0.5">
                      {eventData.name}
                    </h3>
                    <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                      <MetaRow icon="fi fi-rr-calendar">
                        {formatDate(eventData.starting_date)} –{" "}
                        {formatDate(eventData.ending_date)}
                      </MetaRow>
                      <MetaRow icon="fi fi-rr-map-marker">{eventData.location}</MetaRow>
                      <MetaRow icon="fi fi-rr-clock">{eventData.duration}</MetaRow>
                    </div>
                  </div>
                </div>
              ) : null}

              {/* Order summary / checkout */}
              <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                <div className="border-b border-gray-100 bg-gray-50 px-4 py-3">
                  {currentStep === 2 ? (
                    <>
                      <p className="text-[11px] font-medium uppercase tracking-widest text-gray-400 truncate">
                        {eventData.name}
                      </p>
                      <h3 className="text-sm font-semibold text-gray-900 mt-0.5">Checkout</h3>
                    </>
                  ) : (
                    <>
                      <h3 className="text-sm font-semibold text-gray-900">Order summary</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
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
                          <SummaryLine
                            label="Tickets"
                            value={getTotalSelectedTickets()}
                          />
                          <SummaryLine
                            label="Subtotal"
                            value={`₹${b.totalAmount.toFixed(2)}`}
                          />
                          {b.discountAmount > 0 ? (
                            <SummaryLine
                              label="Discount"
                              value={`−₹${b.discountAmount.toFixed(2)}`}
                            />
                          ) : null}
                          <SummaryLine
                            label="After discount"
                            value={`₹${b.subtotalAfterDiscount.toFixed(2)}`}
                          />
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

                        {currentStep === 2 ? (
                          <SplitPaymentNotice grandTotal={b.grandTotal} className="mt-3" />
                        ) : null}
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
                      disabled={getTotalSelectedTickets() === 0}
                      isLoading={isContinuing}
                      loadingLabel="Loading review…"
                    >
                      Continue to review
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      <div className="hidden lg:block">
                        <TermsAgreement
                          checked={termsAccepted}
                          onChange={setTermsAccepted}
                          id="eventTermsDesktop"
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
                        isLoading={isPaying}
                        loadingLabel="Processing…"
                        icon={<i className="fi fi-rr-lock" aria-hidden="true" />}
                      >
                        {getCheckoutPayLabel(getPriceBreakdown().grandTotal)}
                      </Button>
                      <div className="mt-3">
                        <PaymentTrustPanel compact />
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
                        {getTotalSelectedTickets()} ticket{getTotalSelectedTickets() !== 1 ? "s" : ""}
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
                    disabled={getTotalSelectedTickets() === 0}
                    isLoading={isContinuing}
                    loadingLabel="Loading review…"
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
                  className="shrink-0 text-sm font-medium text-gray-500 hover:text-gray-800 px-1"
                >
                  Edit
                </button>
                <Button
                  onClick={handleProceedToPayment}
                  size="lg"
                  className="flex-1 h-12"
                  disabled={isPaying || !termsAccepted}
                  isLoading={isPaying}
                  loadingLabel="Processing…"
                >
                  {getCheckoutPayLabel(b.grandTotal)}
                </Button>
              </div>
            );
          })()}
        </div>

        {/* Bottom padding for mobile sticky bar */}
        <div className={`lg:hidden ${currentStep === 2 ? "h-28" : "h-36"}`}></div>
      </div>

      <PaymentProcessingOverlay show={Boolean(paymentPhase)} stage={paymentPhase || "verifying"} />
      <BalancePaymentPopup
        show={Boolean(balancePaymentPopup) && !showSuccess}
        itemTitle={eventData?.name || "Event"}
        paidAmount={balancePaymentPopup?.paidAmount}
        remainingBalance={balancePaymentPopup?.remainingBalance}
        isPaying={isPaying}
        onPayNow={executeBalancePayment}
        onPayLater={handleBalancePayLater}
      />
      <PaymentSuccessPopup
        show={showSuccess}
        onClose={goToCompletedTicket}
        title={successMessage.title}
        message={successMessage.message}
        itemLabel="Your event"
        itemTitle={eventData?.name || "Event"}
        amountPaid={successMessage.amountPaid}
        detailLeftLabel="Event date"
        detailLeft={successMessage.eventDate}
        detailRightLabel="Tickets"
        detailRight={successMessage.ticketSummary}
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

export default BookingPage;
