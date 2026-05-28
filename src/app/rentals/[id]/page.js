import { getRentalDetails } from "../service";
import RentalDetailsClient from "./RentalDetailsClient";

export default async function RentalDetailsPage({ params }) {
  const { id } = await params;
  const res = await getRentalDetails(id);
  const rental = res?.data;

  if (!rental) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center px-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Rental not found</h1>
          <p className="text-gray-600">The rental you are looking for could not be found.</p>
        </div>
      </div>
    );
  }

  return <RentalDetailsClient rental={rental} />;
}

