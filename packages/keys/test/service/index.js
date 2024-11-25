// proxy function for service in a test env. Init does service init as well as fixture loading.

import fixtures from '@openagenda/fixtures';
import svc from '../../service/index.js';

export function initAndLoad(...args) {
  const defautFiles = ['key'];

  let config;
  let files;
  let options;

  if (args.length === 3) {
    [config, files, options] = args;
  } else if (args.length === 2 && Array.isArray(args[1])) {
    [config, files] = args;
    options = { reset: true };
  } else if (args.length === 2) {
    [config, options] = args;
    files = defautFiles;
  } else if (args.length === 1) {
    [config] = args;
    options = { reset: true };
    files = defautFiles;
  }

  const params = { reset: true, ...options };

  fixtures.init({ mysql: config.mysql });

  // reset before migrations if needed
  return new Promise((resolve, reject) => {
    fixtures([], { reset: params.reset }, async (err) => {
      if (err) {
        console.log(err);
        return reject(err);
      }

      try {
        await svc.init(config);

        fixtures(
          [
            {
              table: config.schemas.key,
              src: `${import.meta.dirname}/key.data.sql`,
            },
          ].filter((f) => files.includes(f.src.split('/').pop().split('.')[0])),
          { reset: false },
          (err1) => {
            if (err1) return reject(err1);
            resolve();
          },
        );
      } catch (e) {
        console.log(e);
        throw e;
      }
    });
  });
}

export default svc;

svc.initAndLoad = initAndLoad;
