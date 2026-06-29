import AttractionBookingPage from "./AttractionBookingPage";
import { attractionInfo } from "../service";
import { normalizeCloseoutDates } from "@/utils/closeoutUtils";

const BookingPage = async ({ params }) => {
  const { id } = await params;

  const attractionResponse = await attractionInfo(id);
  const attraction = attractionResponse?.data;
  const closeoutDates = normalizeCloseoutDates(attraction?.closeout_dates || []);
  const initialAttractionData = attraction || null;

  return (
    <AttractionBookingPage
      attractionId={id}
      closeoutDates={closeoutDates}
      initialAttractionData={initialAttractionData}
    />
  );
};

export default BookingPage;
