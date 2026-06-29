import AttractionBookingPage from "./AttractionBookingPage";
import { attractionInfo } from "../service";
import { normalizeCloseoutDates } from "@/utils/closeoutUtils";

const BookingPage = async ({ params }) => {
  const { id } = await params;

  const attractionResponse = await attractionInfo(id);
  const payload = attractionResponse?.data;
  const closeoutDates = normalizeCloseoutDates(payload?.closeout_dates || []);
  const seasonalDates = payload?.seasonal_dates || [];

  return (
    <AttractionBookingPage
      attractionId={id}
      closeoutDates={closeoutDates}
      seasonalDates={seasonalDates}
      initialAttractionData={payload?.attraction ?? null}
      freeBooking={Boolean(payload?.attraction?.free_booking)}
    />
  );
};

export default BookingPage;
