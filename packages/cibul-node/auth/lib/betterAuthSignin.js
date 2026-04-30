import logs from '@openagenda/logs';
import { wantsJson } from './utils.js';
import computeRedirect from './computeRedirect.js';

const log = logs('auth/betterAuthSignin');

export default async function betterAuthSignin({
  services,
  req,
  res,
  email,
  password,
  oaUser,
  result,
}) {
  const { auth, users } = services;

  let signinResponse = result;
  if (!signinResponse) {
    signinResponse = await auth.api.signInEmail({
      body: { email, password },
      asResponse: true,
    });
    auth.forwardSetCookieHeaders(signinResponse, res);
  }

  users.refresh(oaUser.uid, { lastSignin: true }).catch((err) => {
    log('warn', 'could not refresh lastSignin', { err });
  });

  const redirectUrl = computeRedirect(req, oaUser);

  if (wantsJson(req)) {
    res.json({ success: true, redirect: redirectUrl });
    return;
  }

  res.redirect(302, redirectUrl);
}
