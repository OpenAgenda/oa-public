import errors from '@feathersjs/errors';

export default function restrictToUnlogged() {
  return (context) => {
    if (context.params.user) {
      throw new errors.Forbidden('You must not be logged in.');
    }
  };
}
