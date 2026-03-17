export default function appendFirstNextAndLastTiming(event) {
  if (!event.timings || !event.timings.length) {
    return event;
  }

  const now = new Date();

  const firstTiming = event.firstTiming || event.timings[0];
  const lastTiming = event.lastTiming || event.timings[event.timings.length - 1];

  let nextTiming = null;

  if (!(lastTiming && new Date(lastTiming.end || lastTiming) < now)) {
    for (const timing of event.timings) {
      if (new Date(timing.end) >= now) {
        nextTiming = timing;
        break;
      }
    }
  }

  return {
    ...event,
    firstTiming,
    lastTiming,
    nextTiming,
  };
}
