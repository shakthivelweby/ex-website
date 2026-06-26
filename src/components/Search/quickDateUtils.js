export const formatSearchDate = (date) => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const parseSearchDate = (value) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
};

const startOfToday = () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return today;
};

export const getDateRangeForQuickOption = (option) => {
  const today = startOfToday();

  switch (option) {
    case "Today":
      return { start: today, end: today };
    case "Tomorrow": {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      return { start: tomorrow, end: tomorrow };
    }
    case "This Weekend": {
      const daysUntilSaturday = (6 - today.getDay() + 7) % 7;
      const saturday = new Date(today);
      saturday.setDate(today.getDate() + daysUntilSaturday);
      const sunday = new Date(saturday);
      sunday.setDate(saturday.getDate() + 1);
      return { start: saturday, end: sunday };
    }
    default:
      return null;
  }
};

/** @deprecated use getDateRangeForQuickOption */
export const getDateForQuickOption = (option) =>
  getDateRangeForQuickOption(option)?.start ?? null;

export const rangesMatch = (dateFrom, dateTo, start, end) =>
  dateFrom === formatSearchDate(start) && dateTo === formatSearchDate(end);

export const inferQuickDateRangePick = (dateFrom, dateTo) => {
  if (!dateFrom || !dateTo) return null;

  for (const option of ["Today", "Tomorrow", "This Weekend"]) {
    const range = getDateRangeForQuickOption(option);
    if (range && rangesMatch(dateFrom, dateTo, range.start, range.end)) {
      return option;
    }
  }

  return null;
};

export const resolveQuickDateRangePick = (dateFrom, dateTo, explicitPick) => {
  if (!dateFrom || !dateTo) return null;

  if (explicitPick) {
    const range = getDateRangeForQuickOption(explicitPick);
    if (range && rangesMatch(dateFrom, dateTo, range.start, range.end)) {
      return explicitPick;
    }
  }

  return inferQuickDateRangePick(dateFrom, dateTo);
};
