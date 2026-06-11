---
'@openagenda/logs': minor
---

Add OpenTelemetry support: a new `OtelTransport` enabled via the `otel` option, and an `includeSpan` option on `DebugTransport` (defaults to `true`). Error serialization helpers are extracted to `utils/errorToJSON` and `utils/cloneAndReplaceErrors`.
