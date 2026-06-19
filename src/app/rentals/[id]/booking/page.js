import { Suspense } from "react";
import { getRentalDetails, getRentalPickupLocations } from "../../service";
import RentalBookingClient from "./RentalBookingClient";

export default async function RentalBookingPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const pickupFromUrl = typeof sp?.pickup_location === "string" ? sp.pickup_location : "";

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
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">
          Loading booking…
        </div>
      }
    >
      <RentalBookingClient
        rentalId={id}
        initialRental={initialRental}
        initialPickupLocations={
          Array.isArray(initialPickupLocations) ? initialPickupLocations : []
        }
        initialPickupFromUrl={pickupFromUrl}
      />
    </Suspense>
  );
}
