// Flush BA rate-limit counters from Redis. Phase 6 lot 2 — direct-routing to
// `/api/auth/*` exposes every test to the BA rate-limiter (the legacy
// Express wrappers used to bypass it via in-process `auth.api.*` calls). The
// global default is 100 reqs / 60 s per (ip, path), shared across the whole
// jest suite — without this reset, late-running tests in the suite hit 429
// before they even get to make assertions.
//
// The redis-storage prefix is `{better-auth}:` (configured in
// @openagenda/auth wrapper) and the key shape is `${ip}|${path}`.
export default async function flushRateLimit(redis) {
  const keys = await redis.keys('{better-auth}:*|/*');
  if (keys.length) await redis.del(...keys);
}
