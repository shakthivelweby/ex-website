import InlineSpinner from "./InlineSpinner";

export default function ListingGridLoader({ message = "Loading..." }) {
  return (
    <div className="text-center py-12" role="status" aria-live="polite" aria-busy="true">
      <div className="flex items-center justify-center gap-3">
        <InlineSpinner className="h-8 w-8 text-primary" />
        <span className="text-primary font-medium">{message}</span>
      </div>
    </div>
  );
}
