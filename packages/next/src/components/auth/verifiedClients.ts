// Operator-controlled allowlist of "verified" first-party OAuth clients.
//
// A verified client suppresses the consent screen's "OpenAgenda has not verified
// this application" warning (see Consent.tsx). This is a TRUST signal that
// removes an anti-phishing guard, so it MUST be impossible for a self-registered
// (DCR) client to grant itself: the allowlist lives ONLY in operator-controlled
// server env (`NEXT_VERIFIED_OAUTH_CLIENT_IDS`), never in the `oauth_client`
// table that the open registration endpoint can write. Changing it is a
// deploy-gated, code-reviewed action — appropriate governance for the badge.
//
// Verified is INDEPENDENT of `skip_consent`: it only hides the warning. A
// verified client still renders the consent screen and the user still authorizes
// once (verified ≠ trusted/skip-consent). Resolve this server-side and pass the
// boolean down — never expose the list to the client bundle.
//
// Format: comma-separated client_ids, e.g. `NEXT_VERIFIED_OAUTH_CLIENT_IDS=oa-rsvp`.

const verifiedClientIds: ReadonlySet<string> = new Set(
  (process.env.NEXT_VERIFIED_OAUTH_CLIENT_IDS ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean),
);

export function isVerifiedClient(clientId?: string): boolean {
  return !!clientId && verifiedClientIds.has(clientId);
}
