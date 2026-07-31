/** Build package search options: states first, then destinations. */
export function buildPackageLocationOptions(destinations = []) {
  const statesById = new Map();

  destinations.forEach((destination) => {
    const state = destination?.state;
    if (!state?.id || statesById.has(state.id)) return;

    statesById.set(state.id, {
      id: state.id,
      name: state.name,
      type: "state",
      country_id: state.country_id,
      thumb_image: state.thumb_image || null,
      thumb_image_url: state.thumb_image_url || null,
    });
  });

  const states = Array.from(statesById.values()).sort((a, b) =>
    String(a.name || "").localeCompare(String(b.name || "")),
  );

  const destinationOptions = destinations.map((destination) => ({
    ...destination,
    type: "destination",
  }));

  return [...states, ...destinationOptions];
}

export function locationOptionKey(item) {
  return `${item?.type || "destination"}-${item?.id}`;
}

export function isSameLocationOption(a, b) {
  if (!a || !b) return false;
  return (
    a.id === b.id && (a.type || "destination") === (b.type || "destination")
  );
}

export function filterLocationOptions(options, query) {
  if (!query?.trim()) return options;
  const normalized = query.toLowerCase().trim();

  return options.filter((item) => {
    if (item.type === "state") {
      return item.name?.toLowerCase().includes(normalized);
    }

    return (
      item.name?.toLowerCase().includes(normalized) ||
      item.state?.name?.toLowerCase().includes(normalized)
    );
  });
}
