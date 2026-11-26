import { toEventSchema } from '@openagenda/sdk-js/schema-org';

/**
 * Kept for anything importing this path directly: the package publishes `lib/`
 * and has no `exports` map. The mapping itself lives in `@openagenda/sdk-js`.
 *
 * Callers of this path cut the event down to the date they describe
 * (`{ ...event, timings: [timing] }`), as the portal's own copy expected. Such
 * an event is read as that date, so that it states the date's own availability
 * and never the event summary's, which speaks for the other dates too.
 *
 * @deprecated Import `toEventSchema` from `@openagenda/sdk-js/schema-org` and
 * pass the date as the `timing` option.
 */
export default function deprecatedToEventSchema(event, options = {}) {
  // A `timing` given, even null, is the caller's say; undefined is none.
  if (options.timing !== undefined || event?.timings?.length !== 1) {
    return toEventSchema(event, options);
  }

  return toEventSchema(event, { ...options, timing: event.timings[0] });
}
