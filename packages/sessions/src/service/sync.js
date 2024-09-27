'use strict';

const get = require('./get');
const open = require('./open');

const { callbackify } = require('./helpers');

async function sync(config, request) {
  const user = await get.promise(config, request);

  if (!user) {
    return {
      success: false,
      errors: [
        {
          code: 'session.notfound',
        },
      ],
    };
  }

  return open.promise(config, request, null, { uid: user.uid });
}

module.exports = (config, request, cb) => {
  callbackify(sync(config, request), cb);
};
