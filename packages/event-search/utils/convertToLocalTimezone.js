import { formatInTimeZone } from 'date-fns-tz';

const FMT = "yyyy-MM-dd'T'HH:mm:ssXXX";

export default function convertToLocalTimezone(event) {
  if (!event.timezone || !event.timings) {
    return event;
  }

  return {
    ...event,
    timings: event.timings.map((t) => ({
      begin: formatInTimeZone(new Date(t.begin), event.timezone, FMT),
      end: formatInTimeZone(new Date(t.end), event.timezone, FMT),
    })),
  };
}
