import TicketClient from "./TicketClient";

export const metadata = {
  title: "Your Ticket | Explore World",
  description: "View and share your activity booking ticket",
};

export default async function ActivityTicketPage({ params }) {
  const { bookingId } = await params;

  return <TicketClient bookingId={bookingId} />;
}
