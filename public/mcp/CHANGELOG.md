# @openagenda/mcp

## 1.0.1

### Patch Changes

- [#135](https://github.com/OpenAgenda/oa/pull/135) [`77cd0c9`](https://github.com/OpenAgenda/oa/commit/77cd0c9019de0ccd08b94de2af09013ee39d84fa) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Clearer MCP registry listing and a truthful handshake version. The registry
  description now leads with the capability ("Search, analyze and manage events
  on OpenAgenda.") and the stdio path documents `OA_LOCAL_NO_SANDBOX` — the
  unblock flag when deno is not installed. The MCP `initialize` handshake now
  reports the released package version instead of a hardcoded `0.0.0`.
