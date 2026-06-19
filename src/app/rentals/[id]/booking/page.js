import { Suspense } from "react";
import { getRentalDetails } from "../../service";
import RentalBookingClient from "./RentalBookingClient";

export default async function RentalBookingPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const pickupFromUrl = typeof sp?.pickup_location === "string" ? sp.pickup_location : "";

  let initialRental = null;
  if (id) {
    try {
      const res = await getRentalDetails(id);
      initialRental = res?.data ?? null;
    } catch (_) {
      initialRental = null;
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
        initialPickupFromUrl={pickupFromUrl}
      />
    </Suspense>
  );
}
