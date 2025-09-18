import AttractionBookingPage from "./AttractionBookingPage";

const BookingPage = ({ params }) => {
  const { id } = params;

  return <AttractionBookingPage attractionId={id} />;
};

export default BookingPage;
