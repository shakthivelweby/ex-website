import TicketClient from "./TicketClient";

export const metadata = {
  title: "Your Attraction Ticket | Explore World",
  description: "View and share your attraction booking ticket",
};

export default async function AttractionTicketPage({ params }) {
  const { bookingId } = await params;
  return <TicketClient bookingId={bookingId} />;
}
