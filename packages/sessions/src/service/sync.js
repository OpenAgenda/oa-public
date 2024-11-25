import { promise as get } from './get.js';
import { promise as open } from './open.js';
import { callbackify } from './helpers/index.js';

async function sync(config, request) {
  const user = await get(config, request);

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

  return open(config, request, null, { uid: user.uid });
}

export default (config, request, cb) => {
  callbackify(sync(config, request), cb);
};
