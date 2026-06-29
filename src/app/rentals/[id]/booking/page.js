import { Suspense } from "react";
import { getRentalDetails, getRentalPickupLocations } from "../../service";
import RentalBookingClient from "./RentalBookingClient";
import BookingPageSkeleton from "@/components/loading/BookingPageSkeleton";

export const dynamic = "force-dynamic";

const pickSearchParam = (sp, key) => {
  const v = sp?.[key];
  return typeof v === "string" ? v.trim() : "";
};

export default async function RentalBookingPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const pickupFromUrl = pickSearchParam(sp, "pickup_location");
  const initialBookingFromUrl = {
    pickup_location: pickupFromUrl,
    dropoff_location: pickSearchParam(sp, "dropoff_location") || pickupFromUrl,
    start_date: pickSearchParam(sp, "start_date"),
    end_date: pickSearchParam(sp, "end_date"),
    pickup_time: pickSearchParam(sp, "pickup_time"),
    dropoff_time: pickSearchParam(sp, "dropoff_time"),
  };

  let initialRental = null;
  let initialPickupLocations = [];
  if (id) {
    try {
      const [res, pickupRows] = await Promise.all([
        getRentalDetails(id),
        getRentalPickupLocations(id),
      ]);
      initialRental = res?.data ?? null;
      initialPickupLocations = Array.isArray(pickupRows) ? pickupRows : [];
      if (
        !initialPickupLocations.length &&
        Array.isArray(initialRental?.pickup_locations)
      ) {
        initialPickupLocations = initialRental.pickup_locations;
      }
    } catch (_) {
      initialRental = null;
      initialPickupLocations = [];
    }
  }

  return (
    <Suspense fallback={<BookingPageSkeleton />}>
      <RentalBookingClient
        rentalId={id}
        initialRental={initialRental}
        initialPickupLocations={
          Array.isArray(initialPickupLocations) ? initialPickupLocations : []
        }
        initialPickupFromUrl={pickupFromUrl}
        initialBookingFromUrl={initialBookingFromUrl}
      />
    </Suspense>
  );
}
