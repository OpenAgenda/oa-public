import { spreadTimings } from '@openagenda/date-utils';

// An event's timings grouped the way a reader looks for them: by month, then
// by day (or run of days), with the time slots, all in the event's own
// timezone. The month and day buckets are `spreadTimings`', as in the PDF.

const capitalize = (s) => s.charAt(0).toUpperCase() + s.slice(1);

// A calendar key ("2026-09", "2026-09-18") is already a wall-clock value in the
// event's timezone: it is formatted at noon UTC, in UTC, so no offset can move
// it to the day before.
const calendarDate = (key) =>
  new Date(`${key.length === 7 ? `${key}-01` : key}T12:00:00Z`);

const nextDay = (day) => {
  const date = calendarDate(day);

  date.setUTCDate(date.getUTCDate() + 1);

  return date.toISOString().slice(0, 10);
};

export default function groupTimings(timings, options = {}) {
  // `||`, not a default: an event can carry a null timezone.
  const timezone = options.timezone || 'Europe/Paris';
  const lang = options.lang || 'fr';

  const monthFormat = new Intl.DateTimeFormat(lang, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
  // Weekday and day number formatted apart: Intl orders them per language
  // (« 30 Wednesday » in English), the PDF says « Wednesday 30 » everywhere.
  const weekdayFormat = new Intl.DateTimeFormat(lang, {
    weekday: 'long',
    timeZone: 'UTC',
  });
  const dayLabel = (day) =>
    `${weekdayFormat.format(calendarDate(day))} ${Number(day.slice(8))}`;
  const timeFormat = new Intl.DateTimeFormat(lang, {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone,
  });

  const sorted = [...timings].sort(
    (a, b) => new Date(a.begin) - new Date(b.begin),
  );
  const months = spreadTimings(sorted, timezone);

  return Object.keys(months)
    .sort()
    .map((month) => {
      const days = Object.values(months[month])
        .flatMap((week) => Object.entries(week))
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, dayTimings]) => [
          day,
          dayTimings.map(
            (t) =>
              `${timeFormat.format(new Date(t.begin))} – ${timeFormat.format(new Date(t.end))}`,
          ),
        ]);

      // Consecutive days with the same slots read as one range: a daily event
      // over a year takes a line per month, not one per day.
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
              ? capitalize(dayLabel(from))
              : `${capitalize(dayLabel(from))} – ${dayLabel(to)}`,
          slots,
        })),
      };
    });
}
