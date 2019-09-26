"use strict";

const should = require('should');
const config = require('../testconfig');
const svc = require('./service');

let knex;

describe('events - functional (server): slug to uid', function () {

  this.timeout(60000);

  before(done => {

    svc.initAndLoad(config, [
      config.schemas.event + '_few'
    ], { reset: true }, () => {

      knex = svc.getConfig().knex;

      done();

    });

  });

  after(done => svc.shutdown(done));


  it('slugToUid - success', async () => {

    const uid = await svc.slugToUid('decouvrez-le-livre-le-plus-froid-du-monde');

    should(uid).equal(88161554);

  });

  it('slugToUid - inexistant event', async () => {

    const uid = await svc.slugToUid('un-truc-improbable');

    should(uid).equal(null);

  });

});
