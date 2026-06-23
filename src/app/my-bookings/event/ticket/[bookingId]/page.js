import TicketClient from "./TicketClient";

export const metadata = {
  title: "Your Event Ticket | Explore World",
  description: "View and share your event booking ticket",
};

export default async function EventTicketPage({ params }) {
  const { bookingId } = await params;
  return <TicketClient bookingId={bookingId} />;
}
