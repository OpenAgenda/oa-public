'use strict';

const { alterItems } = require('feathers-hooks-common');

module.exports = function hasSocialAccount() {
  return context => {
    if (context.result === null) {
      return context;
    }

    return alterItems(record => Object.assign(record, {
      hasSocialAccount: Boolean(
        !record.password
            && (record.facebookUid || record.twitterId || record.googleId)
      ),
      hasLocalAccount: Boolean(record.password)
    }))(context);
  };
};
