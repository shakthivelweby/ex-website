import AttractionBookingPage from "./AttractionBookingPage";
import { attractionInfo } from "../service";

const BookingPage = async ({ params }) => {
const { id } = await params;

  // Fetch attraction data to get closeout_dates
  const attractionResponse = await attractionInfo(id);
  const attraction = attractionResponse?.data;

  console.log("attraction guide check", attraction.attraction.attraction_ticket_type_prices[0].guide_rate);
  
  // Extract closeout_dates for date disabling
  const closeoutDates = attraction?.closeout_dates || [];
  
  // Extract guide_rate for guide pricing
  const guideRate = attraction?.attraction?.attraction_ticket_type_prices?.[0]?.guide_rate || 0;

  return <AttractionBookingPage attractionId={id} closeoutDates={closeoutDates} guideRate={guideRate} />;
};

export default BookingPage;
