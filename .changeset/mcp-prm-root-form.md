---
'@openagenda/mcp': patch
---

Serve the OAuth Protected Resource Metadata (RFC 9728) at the root well-known
form too (`/.well-known/oauth-protected-resource`, without the resource path
suffix). Some clients derive the PRM from the origin instead of the full
resource URL — Le Chat (Mistral) documents exactly that URL in its connector
troubleshooting checklist and could not discover the authorization server.
