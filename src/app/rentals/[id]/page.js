import { getRentalDetails } from "../service";
import RentalDetailsClient from "./RentalDetailsClient";

export default async function RentalDetailsPage({ params }) {
  const { id } = await params;
  const res = await getRentalDetails(id);
  const rental = res?.data;

  if (!rental) {
    return (
      <div className="container mx-auto px-4 pt-28 pb-10 text-gray-500">
        Rental not found.
      </div>
    );
  }

  return <RentalDetailsClient rental={rental} />;
}

