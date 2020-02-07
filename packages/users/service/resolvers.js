'use strict';

module.exports = {
  apiKey: () => async (user, context) => {
    if (!user || !user.uid) {
      return;
    }

    const { config } = context.self;

    const result = await config.interfaces.keys.get({
      type: 'userPublic',
      identifier: user.uid
    });

    user.apiKey = result ? result.key : null;
  },
  apiSecret: () => async (user, context) => {
    if (!user || !user.uid) {
      return;
    }

    const { config } = context.self;

    const result = await config.interfaces.keys.get({
      type: 'userPrivate',
      identifier: user.uid
    });

    user.apiSecret = result ? result.key : null;
  }
};
