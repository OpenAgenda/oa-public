// Build the post-activation redirect URL passed to better-auth as
// `callbackURL` when emitting / consuming a verification email.
//
// Two callsites:
// - Express façade `/activate/:token` (`activate` in `auth/local.front.js`)
//   — has a real `req`, mirrors `computeRedirect.js` logic.
// - Feathers `users.create` after-hook (`hooks/sendVerificationEmailOnCreate.js`)
//   — runs without a request, only `optionals` are available.
//
// We ALWAYS route through `/post-activate`, even when there is no invitation
// token. Two reasons:
//
//   1. When BA's `verifyEmail` is invoked with a `callbackURL` and the token
//      is invalid/expired/unknown, BA redirects to `<callbackURL>?error=<CODE>`
//      (see node_modules/better-auth/dist/api/routes/email-verification.mjs:152-157).
//      Routing every callback through `/post-activate` lets us intercept that
//      `?error=…` and surface it as `/auth/signin?msg=invalidActivation` —
//      a `?error=…` landing on `/home` or `/{slug}/contribute` would be
//      indistinguishable from a normal page load and the user would never
//      know what failed.
//
//   2. Invitations (linkMember, etc.) MUST be applied on the just-signed-in
//      user, which is what `/post-activate` does. Keeping a single hop
//      handler simplifies the `cibul-node /activate/:token` façade to a pure
//      302 proxy to `/api/auth/verify-email`.
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

  const pickedAgendaSlug = agendaSlug || undefined;

  return `/post-activate${qs.stringify(
    {
      ...merged.invitation && { invitation: merged.invitation },
      ...pickedAgendaSlug && { agenda: pickedAgendaSlug },
      next: baseRedirect,
    },
    { addQueryPrefix: true },
  )}`;
}
