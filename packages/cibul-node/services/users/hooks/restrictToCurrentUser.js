'use strict';

module.exports = function restrictToCurrentUser() {
  return context => {
    if (!context.params.user) {
      throw new errors.NotAuthenticated('You are not authenticated.');
    }

    if (context.params.user.uid === undefined) {
      throw new errors.Forbidden('uid is missing from current user.');
    }

    if (context.params.user.uid !== context.id) {
      throw new errors.Forbidden('You do not have the permissions to access this.');
    }
  };
};
