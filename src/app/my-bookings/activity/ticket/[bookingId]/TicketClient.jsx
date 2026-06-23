"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import BookingTicket from "@/components/ticket/BookingTicket";
import {
  TicketLoadingShell,
  TicketSignInPrompt,
  useClientAuth,
} from "@/components/ticket/ticketClientUtils";
import { downloadActivityTicketPdf, getActivityTicket } from "../../service";

function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    "Unable to load ticket. It may be unavailable until payment is complete."
  );
}

export default function ActivityTicketClient({ bookingId }) {
  const router = useRouter();
  const normalizedBookingId = String(bookingId || "").trim();
  const { ready, loggedIn } = useClientAuth();

  const { data: ticket, isLoading, error, refetch, isFetching } = useQuery({
    queryKey: ["activityTicket", normalizedBookingId],
    queryFn: () => getActivityTicket(normalizedBookingId),
    enabled:
      ready &&
      loggedIn &&
      Boolean(normalizedBookingId) &&
      normalizedBookingId !== "undefined",
    retry: (failureCount, err) => {
      const status = err?.response?.status;
      if (status === 403 || status === 404) {
        return failureCount < 5;
      }
      return failureCount < 1;
    },
    retryDelay: (attempt) => Math.min(700 * (attempt + 1), 3500),
  });

  if (!ready) {
    return <TicketLoadingShell />;
  }

  if (!loggedIn) {
    return <TicketSignInPrompt />;
  }

  if (!normalizedBookingId || normalizedBookingId === "undefined") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100 px-4 dark:bg-gray-950">
        <p className="text-center text-gray-700 dark:text-gray-200">Invalid booking reference.</p>
        <button
          type="button"
          onClick={() => router.push("/my-bookings?tab=activities")}
          className="text-sm text-primary-600"
        >
          Back to My Bookings
        </button>
      </div>
    );
  }

  if (isLoading || (isFetching && !ticket?.booking_reference)) {
    return <TicketLoadingShell />;
  }

  if (error || !ticket?.booking_reference) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-100 px-4 dark:bg-gray-950">
        <p className="text-center text-gray-700 dark:text-gray-200">{getErrorMessage(error)}</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="rounded-full bg-primary-600 px-5 py-2 text-sm font-medium text-white"
        >
          Try again
        </button>
        <button
          type="button"
          onClick={() => router.push("/my-bookings?tab=activities")}
          className="text-sm text-primary-600"
        >
          Back to My Bookings
        </button>
      </div>
    );
  }

  return (
    <BookingTicket
      ticket={ticket}
      bookingId={normalizedBookingId}
      bookingType="activity"
      onDownloadPdf={downloadActivityTicketPdf}
      onClose={() => router.push("/my-bookings?tab=activities")}
    />
  );
}
