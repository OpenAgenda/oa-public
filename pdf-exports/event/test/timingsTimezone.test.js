import assert from 'node:assert/strict';
import { getTimingMonthSegments } from '../lib/timings.utils.js';
import saintJames from './fixtures/saint-james.event.json' with { type: 'json' };

// Event 4901119 of jep-2026-martinique: three slots on 18, 19 and 20 September
// 2026, 09:00 local, in America/Martinique (UTC-4). Its PDF export used to
// title the timings block "Août 2026" and list "jeudi 17 / vendredi 18 /
// samedi 19" — a whole day early — because spreadTimings' month and day keys
// ("2026-09", "2026-09-18") are calendar strings with no zone, and re-reading
// them through `new Date()` puts them at UTC midnight, which in any negative
// offset is still the previous day.
const cases = [
  {
    name: 'America/Martinique (UTC-4)',
    timezone: 'America/Martinique',
    timings: saintJames.timings,
    expected: [
      {
        label: 'Septembre 2026',
        dates: [
          { label: 'vendredi 18', timings: ['09:00'] },
          { label: 'samedi 19', timings: ['09:00'] },
          { label: 'dimanche 20', timings: ['09:00'] },
        ],
      },
    ],
  },
  {
    name: 'Europe/Paris (UTC+2), same wall-clock dates',
    timezone: 'Europe/Paris',
    timings: [
      { begin: '2026-09-18T09:00:00+02:00', end: '2026-09-18T17:00:00+02:00' },
      { begin: '2026-09-19T09:00:00+02:00', end: '2026-09-19T17:00:00+02:00' },
      { begin: '2026-09-20T09:00:00+02:00', end: '2026-09-20T17:00:00+02:00' },
    ],
    expected: [
      {
        label: 'Septembre 2026',
        dates: [
          { label: 'vendredi 18', timings: ['09:00'] },
          { label: 'samedi 19', timings: ['09:00'] },
          { label: 'dimanche 20', timings: ['09:00'] },
        ],
      },
    ],
  },
  {
    // The labels have to follow the event timezone, not the instant's UTC day.
    // This slot is 23:00 in Martinique, i.e. 03:00 the next day in UTC: read
    // as UTC it would be dated « samedi 19 ».
    name: 'America/Martinique, a late-evening slot whose UTC day is the next one',
    timezone: 'America/Martinique',
    timings: [
      { begin: '2026-09-18T23:00:00-04:00', end: '2026-09-18T23:30:00-04:00' },
    ],
    expected: [
      {
        label: 'Septembre 2026',
        dates: [{ label: 'vendredi 18', timings: ['23:00'] }],
      },
    ],
  },
  {
    // The very same instant, displayed for a Paris agenda, is a day later —
    // the day label moves with the timezone, which is what makes it a display
    // in the event's own context rather than a formatting of a fixed instant.
    name: 'Europe/Paris, that same instant, a day later locally',
    timezone: 'Europe/Paris',
    timings: [
      { begin: '2026-09-18T23:00:00-04:00', end: '2026-09-18T23:30:00-04:00' },
    ],
    expected: [
      {
        label: 'Septembre 2026',
        dates: [{ label: 'samedi 19', timings: ['05:00'] }],
      },
    ],
  },
  {
    // Same thing across a month boundary: 22:00 on the last day of August in
    // Martinique is already 1 September in UTC, and must still be titled
    // « Août 2026 ».
    name: 'America/Martinique, the last evening of the month',
    timezone: 'America/Martinique',
    timings: [
      { begin: '2026-08-31T22:00:00-04:00', end: '2026-08-31T23:00:00-04:00' },
    ],
    expected: [
      {
        label: 'Août 2026',
        dates: [{ label: 'lundi 31', timings: ['22:00'] }],
      },
    ],
  },
  {
    name: 'Pacific/Gambier (UTC-9), a slot on the first of the month',
    timezone: 'Pacific/Gambier',
    timings: [
      { begin: '2026-09-01T10:00:00-09:00', end: '2026-09-01T12:00:00-09:00' },
    ],
    expected: [
      {
        label: 'Septembre 2026',
        dates: [{ label: 'mardi 1', timings: ['10:00'] }],
      },
    ],
  },
];

const flatten = (segments) =>
  segments.map((month) => ({
    label: month.label,
    dates: month.weeks.flatMap((week) =>
      week.dates.map((date) => ({
        label: date.label,
        timings: date.timings.map((timing) => timing.label),
      }))),
  }));

const failures = [];

for (const { name, timezone, timings, expected } of cases) {
  const segments = getTimingMonthSegments({
    value: timings,
    relatedValues: { timezone },
    lang: 'fr',
  });

  try {
    assert.deepEqual(flatten(segments), expected);
    console.log(`ok   ${name}`);
  } catch (error) {
    failures.push(name);
    console.log(`FAIL ${name}\n${error.message}`);
  }
}

if (failures.length) {
  process.exit(1);
}
