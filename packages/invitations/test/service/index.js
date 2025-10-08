import path from 'node:path';
import fixtures from '@openagenda/fixtures';
import * as svc from '../../service/index.js';

function fix(config, files, options, cb) {
  fixtures.init({ mysql: config.mysql });

  fixtures(
    [
      {
        table: config.schemas.invitation,
        src: `${path.dirname(import.meta.dirname)}/fixtures/invitation.data.sql`,
      },
    ].filter((f) => files.includes(f.src.split('/').pop().split('.')[0])),
    options,
    cb,
  );
}

function initAndLoad(...args) {
  let config;
  let files;
  let options;
  let cb;

  if (args.length === 4) {
    [config, files, options, cb] = args;
  } else if (args.length === 3) {
    [config, files, cb] = args;
    options = { reset: true };
  } else if (args.length === 2) {
    [config, cb] = args;
    options = { reset: true };
    files = ['invitation'];
  }

  svc.init(config);

  fix(config, files, options, cb);
}

export * from '../../service/index.js';
export { initAndLoad };
