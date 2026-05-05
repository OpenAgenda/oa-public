// Build the post-signin redirect URL passed to better-auth as `callbackURL`
// when starting an OAuth flow (`/sign-in/social/:provider`). BA's callback
// route lands the browser on this URL after a successful provider exchange.
//
// Symmetric with `computePostActivateRedirect`: when an invitation token is
// present we route through `/post-activate` so token-based actions
// (linkMember, etc.) are applied to the freshly-signed-in user; otherwise
// redirect to the agenda's contribute page (if any) or `/home`.
//
// Returned value is a same-origin path; better-auth's `trustedOrigins`
// resolves it against `config.root` cleanly.

import qs from 'qs';

// Reject anything that isn't a clear same-origin path: must start with `/`,
// must not start with `//` (protocol-relative URL) or `/\` (Edge/IE quirk),
// must not contain a scheme, and must not contain CR/LF/whitespace
// (header-injection guard). Anything that doesn't pass falls back to /home.
function isSafeSameOriginPath(value) {
  if (typeof value !== 'string' || value.length === 0) return false;
  if (value[0] !== '/') return false;
  if (value.startsWith('//') || value.startsWith('/\\')) return false;
  if (/[\r\n\t]/.test(value)) return false;
  if (/^\/+[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) return false;
  return true;
}

export default function computePostSignInRedirect({ req } = {}) {
  const query = req?.query ?? {};

  let agendaSlug;
  if (query.agenda) {
    agendaSlug = typeof query.agenda === 'string' ? query.agenda : query.agenda.slug;
  } else if (req?.agenda) {
    agendaSlug = req.agenda.slug;
  }

  let baseRedirect;

  if (query.redirect) {
    try {
      const decoded = Buffer.from(query.redirect, 'base64').toString();
      if (isSafeSameOriginPath(decoded)) baseRedirect = decoded;
    } catch (e) {
      // fall through to default
    }
  }

  if (!baseRedirect) {
    baseRedirect = agendaSlug ? `/${agendaSlug}/contribute` : '/home';
  }

  if (query.invitation) {
    return `/post-activate${qs.stringify(
      { invitation: query.invitation, next: baseRedirect },
      { addQueryPrefix: true },
    )}`;
  }

  return baseRedirect;
}
