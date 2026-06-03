import { Forbidden } from '@openagenda/verror';
import logs from '@openagenda/logs';

const log = logs('services/users/hooks/verifyHeadersPassword');

export default function verifyHeadersPassword() {
  return async (context) => {
    // Identify the authenticated user by their stable uid, not their email.
    // The session's email can be stale after an email change (legacy
    // confirmChangeEmail updates user.email without refreshing the session),
    // and looking the user up by a no-longer-existing email throws NotFound
    // (404) on the next password challenge.
    log('verifying password for user %s', context.params.user.uid);
    if (
      !await context.self.verifyPassword(
        context.headers.authorization.replace(/^Basic\s/, ''),
        { query: { uid: context.params.user.uid } },
      )
    ) {
      throw new Forbidden('Password is invalid.');
    }
  };
}
