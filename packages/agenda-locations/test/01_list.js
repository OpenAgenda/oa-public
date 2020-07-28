'use strict';

const config = require('../testconfig');
const fixtures = require('./fixtures/load');

describe('agenda-locations - functional - list', () => {
  const f = fixtures(config.mysql);

  let svc;

  before(async () => {
    await f.load();
  });

  it('fixtures are loaded', () => {

  });
});
