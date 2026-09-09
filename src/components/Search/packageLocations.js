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

export function splitPackageLocations(selected = []) {
  const states = [];
  const destinations = [];

  selected.forEach((item) => {
    if (!item) return;
    if (item.type === "state") states.push(item);
    else destinations.push(item);
  });

  return { states, destinations };
}

export function togglePackageLocation(selected = [], item) {
  if (!item) return selected;

  const nextItem = { ...item, type: item.type || "destination" };
  const exists = selected.some((current) =>
    isSameLocationOption(current, nextItem),
  );

  if (exists) {
    return selected.filter(
      (current) => !isSameLocationOption(current, nextItem),
    );
  }

  return [...selected, nextItem];
}

export function packageLocationPickerHint(selected = [], { isSchedule } = {}) {
  if (isSchedule) return "Select one destination";
  if (selected.length === 0) return "Select destinations or states";

  const { states, destinations } = splitPackageLocations(selected);
  const parts = [];

  if (states.length) {
    parts.push(`${states.length} ${states.length === 1 ? "state" : "states"}`);
  }
  if (destinations.length) {
    parts.push(
      `${destinations.length} ${
        destinations.length === 1 ? "destination" : "destinations"
      }`,
    );
  }

  return `${parts.join(" and ")} selected — add more`;
}

function appendDuration(params, duration) {
  if (duration) params.set("duration", String(duration));
  return params;
}

function queryString(params) {
  const value = params.toString();
  return value ? `?${value}` : "";
}

function normalizeSearchDestination(dest) {
  return {
    id: dest.id,
    name: dest.name,
    type: "destination",
    state_id: dest.state_id,
    country_id: dest.country_id ?? dest.state?.country_id,
    destination_id: dest.id,
  };
}

function countryPackagesHref(countryId, extraParams, duration) {
  const params = appendDuration(new URLSearchParams(extraParams), duration);
  return `/packages/${countryId}${queryString(params)}`;
}

export function resolveSelectedStates(allDestinations = [], stateIds = []) {
  const statesById = new Map();

  allDestinations.forEach((destination) => {
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

  return stateIds
    .map((id) => statesById.get(id))
    .filter(Boolean);
}

export function buildPackageSearchHref({
  selectedLocations = [],
  duration = "",
  isSchedule = false,
} = {}) {
  const { states, destinations } = splitPackageLocations(selectedLocations);

  if (isSchedule) {
    const item = destinations[0];
    return {
      href: "/scheduled",
      choosedDestination: item ? normalizeSearchDestination(item) : null,
    };
  }

  if (states.length === 1 && destinations.length === 0) {
    const state = states[0];
    const countryId = state.country_id;
    if (!countryId) return { href: "/explore" };
    return {
      href: countryPackagesHref(
        countryId,
        { state: String(state.id) },
        duration,
      ),
    };
  }

  if (states.length === 0 && destinations.length === 1) {
    const item = normalizeSearchDestination(destinations[0]);
    const countryId = item.country_id;
    if (!countryId) {
      const params = appendDuration(
        new URLSearchParams({ destinations: String(item.id) }),
        duration,
      );
      return { href: `/packages/search${queryString(params)}` };
    }
    return {
      href: countryPackagesHref(
        countryId,
        {
          state: String(item.state_id),
          destination: String(item.id),
        },
        duration,
      ),
      choosedDestination: item,
    };
  }

  const params = appendDuration(new URLSearchParams(), duration);
  const destIds = destinations.map((dest) => dest.id).filter(Boolean).join(",");
  const stateIds = states.map((state) => state.id).filter(Boolean).join(",");
  if (destIds) params.set("destinations", destIds);
  if (stateIds) params.set("states", stateIds);

  return {
    href: `/packages/search${queryString(params)}`,
    sessionDestinations: destinations.map(normalizeSearchDestination),
    sessionStates: states,
  };
}
