import ClientWrapper from "./clientWrapper";

export default async function Events({ searchParams }) {
  return <ClientWrapper searchParams={searchParams} />;
}