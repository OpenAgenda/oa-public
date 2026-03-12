import { Forbidden, NotAuthenticated } from '@openagenda/verror';

export default function restrictToCurrentUser() {
  return (context) => {
    if (!context.params.user) {
      throw new NotAuthenticated('You are not authenticated.');
    }

    if (context.params.user.uid === undefined) {
      throw new Forbidden('uid is missing from current user.');
    }

    if (context.params.user.uid !== context.id) {
      throw new Forbidden('You do not have the permissions to access this.');
    }
  };
}
