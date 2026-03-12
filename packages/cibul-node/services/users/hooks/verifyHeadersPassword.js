import { Forbidden } from '@openagenda/verror';
import logs from '@openagenda/logs';

const log = logs('services/users/hooks/verifyHeadersPassword');

export default function verifyHeadersPassword() {
  return async (context) => {
    log('verifying password for email %s', context.params.user.email);
    if (
      !await context.self.verifyPassword(
        context.headers.authorization.replace(/^Basic\s/, ''),
        { query: { email: context.params.user.email } },
      )
    ) {
      throw new Forbidden('Password is invalid.');
    }
  };
}
