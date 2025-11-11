import BookingClient from "./BookingClient";

const BookingPage = async ({ params }) => {
  const { id } = await params;
  
  return <BookingClient activityId={id} />;
};

export default BookingPage;

