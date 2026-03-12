import { Forbidden } from '@openagenda/verror';

export default function restrictToUnlogged() {
  return (context) => {
    if (context.params.user) {
      throw new Forbidden('You must not be logged in.');
    }
  };
}
