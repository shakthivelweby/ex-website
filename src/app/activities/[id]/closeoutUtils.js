const DAY_KEYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

export function isDateInRange(ymd, start, end) {
  if (!ymd) return false;
  if (start && ymd < start) return false;
  if (end && ymd > end) return false;
  return true;
}

function getDayKeyFromDate(date) {
  const d = date instanceof Date ? date : new Date(`${date}T12:00:00`);
  return DAY_KEYS[d.getDay()];
}

function isTruthyDayFlag(value) {
  return value === true || value === 1 || value === "1";
}

/**
 * Normalize applicable_days from API (object, nested relation, or legacy array).
 */
export function normalizeApplicableDays(raw) {
  if (!raw) return null;

  if (typeof raw === "object" && !Array.isArray(raw)) {
    const hasDayKeys = DAY_KEYS.some(
      (k) => raw[k] !== undefined && raw[k] !== null
    );
    if (hasDayKeys) return raw;
  }

  if (Array.isArray(raw) && raw.length > 0) {
    const out = Object.fromEntries(DAY_KEYS.map((k) => [k, false]));
    raw.forEach((entry) => {
      const name = String(
        entry?.day_name || entry?.day || entry?.name || entry?.weekday || entry || ""
      ).toLowerCase();
      DAY_KEYS.forEach((k) => {
        if (name === k || name.startsWith(k) || name.includes(k)) {
          out[k] = true;
        }
      });
    });
    return out;
  }

  return null;
}

function isWeekdayClosed(applicableDays, dayKey) {
  if (!applicableDays) {
    // No weekday filter: entire date range is closed.
    return true;
  }
  return isTruthyDayFlag(applicableDays[dayKey]);
}

/**
 * Returns true when the date should be blocked (close-out).
 */
export function isActivityCloseoutDate(closeouts, ymd, dateInput) {
  if (!Array.isArray(closeouts) || !ymd) return false;

  const dateObj =
    dateInput instanceof Date ? dateInput : new Date(`${ymd}T12:00:00`);
  const dayKey = getDayKeyFromDate(dateObj);

  return closeouts.some((entry) => {
    const start = entry?.start_date ?? entry?.startDate ?? null;
    const end = entry?.end_date ?? entry?.endDate ?? null;
    const applicableDays = normalizeApplicableDays(
      entry?.applicable_days ?? entry?.applicableDays ?? null
    );

    const hasRange = Boolean(start && end);
    if (hasRange && !isDateInRange(ymd, start, end)) {
      return false;
    }

    // Weekly recurring rule (no date range): close on selected weekdays.
    if (!hasRange && applicableDays) {
      return isWeekdayClosed(applicableDays, dayKey);
    }

    if (!hasRange && !applicableDays) {
      return false;
    }

    return isWeekdayClosed(applicableDays, dayKey);
  });
}

export function normalizeCloseoutDates(raw) {
  if (!Array.isArray(raw)) return [];
  return raw.map((entry) => ({
    ...entry,
    start_date: entry?.start_date ?? entry?.startDate ?? null,
    end_date: entry?.end_date ?? entry?.endDate ?? null,
    applicable_days: normalizeApplicableDays(
      entry?.applicable_days ?? entry?.applicableDays ?? null
    ),
  }));
}
