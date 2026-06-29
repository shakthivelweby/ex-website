/** Activity `duration` is stored in minutes in the API. */
export function formatActivityDuration(value) {
  const minutes = Number(value);
  if (!Number.isFinite(minutes) || minutes <= 0) return "TBD";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`;
  if (hours > 0) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return `${mins} min`;
}
