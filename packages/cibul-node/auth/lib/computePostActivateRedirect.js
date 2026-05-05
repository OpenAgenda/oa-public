// Build the post-activation redirect URL passed to better-auth as
// `callbackURL` when emitting / consuming a verification email.
//
// Two callsites:
// - Express façade `/activate/:token` (`activate`, `activateResend` in
//   `auth/local.front.js`) — has a real `req`, mirrors `computeRedirect.js`
//   logic.
// - Feathers `users.create` after-hook (`hooks/sendVerificationEmailOnCreate.js`)
//   — runs without a request, only `optionals` are available.
//
// When an invitation token is present, we route through `/post-activate` so
// the invitation can be applied (token-based actions like `linkMember`) after
// BA's auto-signin redirect. Otherwise, we redirect straight to the agenda's
// contribute page (if known) or `/home`.
//
// The returned value is a path (not absolute). better-auth expects callbackURL
// to be a same-origin path or a `trustedOrigins`-allowed absolute URL; phase 3
// already wired `trustedOrigins: [config.root, ...]`, so a path resolves
// against `config.root` cleanly.

import qs from 'qs';

export default function computePostActivateRedirect({ req, optionals } = {}) {
  const query = req?.query ?? {};
  const merged = { ...optionals, ...query };

  let agendaSlug;
  if (merged.agenda) {
    agendaSlug = typeof merged.agenda === 'string' ? merged.agenda : merged.agenda.slug;
  } else if (req?.agenda) {
    agendaSlug = req.agenda.slug;
  }

  let baseRedirect;

  if (merged.redirect) {
    try {
      baseRedirect = Buffer.from(merged.redirect, 'base64').toString();
    } catch (e) {
      // fall through to default
    }
  }

  if (!baseRedirect) {
    baseRedirect = agendaSlug ? `/${agendaSlug}/contribute` : '/home';
  }

  // When an invitation token is present, hop through /post-activate so the
  // invitation actions (linkMember, etc.) can be applied to the just-signed-in
  // user. Without an invitation, skip the hop entirely.
  if (merged.invitation) {
    return `/post-activate${qs.stringify(
      { invitation: merged.invitation, next: baseRedirect },
      { addQueryPrefix: true },
    )}`;
  }

  return baseRedirect;
}
