'use strict';

const { alterItems } = require('feathers-hooks-common');

module.exports = function populateAccountTypes() {
  return context => {
    if (context.result === null) {
      return context;
    }

    return alterItems(async record => {
      const entity = await context.service._get(record.uid, {
        query: { $select: ['password'] }
      });

      return Object.assign(record, {
        hasSocialAccount: Boolean(
          entity.facebookUid || entity.twitterId || entity.googleId
        ),
        hasLocalAccount: Boolean(entity.password)
      });
    })(context);
  };
};
