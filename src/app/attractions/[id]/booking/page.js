import AttractionBookingPage from "./AttractionBookingPage";
import { attractionInfo } from "../service";

const BookingPage = async ({ params }) => {
  const { id } = await params;

  // Fetch attraction data to get closeout_dates and guide_rate
  const attractionResponse = await attractionInfo(id);
  const attraction = attractionResponse?.data;
  
  // Extract closeout_dates for date disabling
  const closeoutDates = attraction?.closeout_dates || [];
  
  // Extract guide_rate for guide pricing - handle both possible data structures
  const guideRate = attraction?.attraction?.attraction_ticket_type_prices?.[0]?.guide_rate || 
                    attraction?.attraction_ticket_type_prices?.[0]?.guide_rate || 
                    0;
  
  // Pass initial attraction data to prevent null errors
  const initialAttractionData = attraction || null;

  return (
    <AttractionBookingPage 
      attractionId={id} 
      closeoutDates={closeoutDates} 
      guideRate={guideRate}
      initialAttractionData={initialAttractionData}
    />
  );
};

export default BookingPage;
