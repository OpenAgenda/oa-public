---
'@openagenda/api-spec': minor
'@openagenda/api-client': minor
---

Fix two `EventSummary` (list, `detailed: false`) contract bugs where a `required` field never carried real data.

- **`timings` was always `[]`.** event-search strips the full occurrence array from the light projection, so the summary mapper coerced the absent field to `[]` — a consumer reading `EventSummary.timings` saw "no occurrences" for every event. `timings` is now **detailed-only** (removed from `EventSummary`, kept on `Event`); the compact view already exposes the span through `firstTiming`/`lastTiming`/`nextTiming`.
- **`timezone` was always `null`.** event-search grouped `timezone` with `timings` in the same non-detailed strip, dropping a single IANA name that the compact `firstTiming`/`lastTiming`/`nextTiming` instants need to render correctly across DST. The strip no longer removes `timezone`, so `EventSummary.timezone` is now populated.

Breaking for the v3 SDK types: `EventSummary.timings` is gone (fetch a single `Event` for the full list).
