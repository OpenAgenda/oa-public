'use strict';

const path = require('node:path');
const fixtures = require('@openagenda/fixtures');
const svc = require('../../service');

function fix(config, files, options, cb) {
  fixtures.init({ mysql: config.mysql });

  fixtures(
    [
      {
        table: config.schemas.invitation,
        src: `${path.dirname(__dirname)}/fixtures/invitation.data.sql`,
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

  svc.init(config, (err) => {
    if (err) return cb(err);

    fix(config, files, options, cb);
  });
}

module.exports = {
  ...svc,
  initAndLoad,
};
