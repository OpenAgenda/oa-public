'use strict';

const { alterItems } = require('feathers-hooks-common');

const getOriginal = fn => (fn.original ? getOriginal(fn.original) : fn);

module.exports = function populateAccountTypes() {
  return context => {
    if (context.result === null) {
      return context;
    }

    const service = context.self;

    return alterItems(async record => {
      const entity = await getOriginal(service.get).call(service, record.uid, {
        query: {
          $select: ['password', 'facebook_uid', 'twitter_id', 'google_id']
        }
      });

      return Object.assign(record, {
        hasSocialAccount: Boolean(
          entity.facebook_uid || entity.twitter_id || entity.google_id
        ),
        hasLocalAccount: Boolean(entity.password)
      });
    })(context);
  };
};
