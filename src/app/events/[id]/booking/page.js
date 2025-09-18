import BookingPage from "./BookingPage";

const EventBookingPage = ({ params }) => {
  const { id } = params;

  return <BookingPage eventId={id} />;
};

export default EventBookingPage;
