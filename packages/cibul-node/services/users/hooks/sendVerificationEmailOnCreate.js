// Phase 3b — replace the legacy `tokens.create({type:'aa'})` + sendToken('aa')
// chain with a call to better-auth's `sendVerificationEmail`.
//
// The OA UI signup path goes through Feathers `users.create` (not
// `auth.api.signUpEmail`), so BA's `sendOnSignUp: true` never fires for our
// real users. This after-hook bridges the two: when a freshly created user
// is not activated, ask BA to issue a verification token and email it via
// the `onSendVerificationEmail` callback wired in `services/auth/index.js`.
//
// The legacy `createActivationToken()` hook in `packages/users/service/index.js`
// still creates a `tokens` row of type `aa`. That row is now dead data
// (nobody emails it: `sendToken.js` no longer has an `'aa'` branch); cleanup
// is deferred to phase 6 along with the rest of the Feathers tokens table.
//
// Failure policy: log+swallow. The user can retry via the resend panel on
// /auth/signin?view=resend (BA `/api/auth/send-verification-email`). We
// never want a transient SMTP / rate-limit error to break account creation
// itself.

import logs from '@openagenda/logs';
import computePostActivateRedirect from '../../../auth/lib/computePostActivateRedirect.js';

const log = logs('services/users/hooks/sendVerificationEmailOnCreate');

const afterCreate = () => async (context, next) => {
  await next();

  const auth = context.services?.auth;
  const user = context.result;

  if (!auth || !user) return;
  if (user.isActivated) return;

  try {
    const callbackURL = computePostActivateRedirect({
      optionals: context.params?.tokenOptionals ?? context.params?.optionals,
    });

    await auth.api.sendVerificationEmail({
      body: { email: user.email, callbackURL },
    });
  } catch (err) {
    log.error('sendVerificationEmail after users.create failed', {
      userId: user?.id,
      err,
    });
  }
};

export default function sendVerificationEmailOnCreateHooks() {
  return {
    create: [afterCreate()],
  };
}
