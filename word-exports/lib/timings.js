// An event's timings grouped the way a reader looks for them: by month, then
// by day (or run of days), with the time slots, all in the event's own
// timezone.

function localParts(date, timeZone) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
      .formatToParts(date)
      .map(({ type, value }) => [type, value]),
  );

  return {
    month: `${parts.year}-${parts.month}`,
    day: `${parts.year}-${parts.month}-${parts.day}`,
  };
}

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// A calendar key ("2026-09", "2026-09-18") is already a wall-clock value in the
// event's timezone: it is formatted at noon UTC, in UTC, so no offset can move
// it to the day before.
const calendarDate = (key) =>
  new Date(`${key.length === 7 ? `${key}-01` : key}T12:00:00Z`);

export default function groupTimings(
  timings,
  { timezone = 'Europe/Paris', lang = 'fr' } = {},
) {
  const monthFormat = new Intl.DateTimeFormat(lang, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  const dayFormat = new Intl.DateTimeFormat(lang, {
    weekday: 'long',
    day: 'numeric',
    timeZone: 'UTC',
  });
  const timeFormat = new Intl.DateTimeFormat(lang, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  });

  const months = new Map();

  for (const timing of [...timings].sort(
    (a, b) => new Date(a.begin) - new Date(b.begin),
  )) {
    const begin = new Date(timing.begin);
    const { month, day } = localParts(begin, timezone);

    if (!months.has(month)) months.set(month, new Map());

    const days = months.get(month);

    if (!days.has(day)) days.set(day, []);

    days
      .get(day)
      .push(
        `${timeFormat.format(begin)} – ${timeFormat.format(new Date(timing.end))}`,
      );
  }

  const nextDay = (day) => {
    const date = calendarDate(day);

    date.setUTCDate(date.getUTCDate() + 1);

    return date.toISOString().slice(0, 10);
  };

  // Consecutive days with the same slots read as one range: a daily event
  // over a year takes a line per month, not one per day.
  return [...months].map(([month, days]) => {
    const runs = [];

    for (const [day, slots] of days) {
      const last = runs.at(-1);
      const key = slots.join('|');

      if (last && last.key === key && nextDay(last.to) === day) {
        last.to = day;
      } else {
        runs.push({ from: day, to: day, key, slots });
      }
    }

    return {
      label: capitalize(monthFormat.format(calendarDate(month))),
      days: runs.map(({ from, to, slots }) => ({
        label:
          from === to
            ? capitalize(dayFormat.format(calendarDate(from)))
            : `${capitalize(dayFormat.format(calendarDate(from)))} – ${dayFormat.format(calendarDate(to))}`,
        slots,
      })),
    };
  });
}
