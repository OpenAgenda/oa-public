# @openagenda/mcp

## 1.0.2

### Patch Changes

- [#139](https://github.com/OpenAgenda/oa/pull/139) [`a7efa05`](https://github.com/OpenAgenda/oa/commit/a7efa0544f4eb38c747ac336a0cdacfacb82f6c5) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Serve the OAuth Protected Resource Metadata (RFC 9728) at the root well-known
  form too (`/.well-known/oauth-protected-resource`, without the resource path
  suffix). Some clients derive the PRM from the origin instead of the full
  resource URL — Le Chat (Mistral) documents exactly that URL in its connector
  troubleshooting checklist and could not discover the authorization server.

## 1.0.1

### Patch Changes

- [#135](https://github.com/OpenAgenda/oa/pull/135) [`77cd0c9`](https://github.com/OpenAgenda/oa/commit/77cd0c9019de0ccd08b94de2af09013ee39d84fa) Thanks [@bertho-zero](https://github.com/bertho-zero)! - Clearer MCP registry listing and a truthful handshake version. The registry
  description now leads with the capability ("Search, analyze and manage events
  on OpenAgenda.") and the stdio path documents `OA_LOCAL_NO_SANDBOX` — the
  unblock flag when deno is not installed. The MCP `initialize` handshake now
  reports the released package version instead of a hardcoded `0.0.0`.
