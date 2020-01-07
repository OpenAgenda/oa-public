'use strict';

const fs = require('fs');
const should = require('should');

const Service = require('../');

const config = require('../testconfig');

describe('07 - event search - functional: deleteIndex', function() {

  describe('simple', function() {

    let service;

    this.timeout(30000);

    before(async () => {
      service = Service(config);
    });

    it('indices and alias are effectively removed', async () => {

      await service( 'simple_search' ).rebuild( {
        eventsList: async function(lastId, limit) {
          return JSON.parse(fs.readFileSync(`${__dirname}/fixtures/05_events.${lastId}.${limit}.json`));
        }
      } );

      const client = service.getConfig().client;

      const indices = Object.keys((await client.indices.getAlias({
        name: 'simple_search'
      })).body);

      (await client.indices.existsAlias({ name: 'simple_search' })).body.should.equal(true);

      await service( 'simple_search' ).deleteIndex();

      while (indices.length) {
        (await client.indices.exists({ index: indices.pop() })).body.should.equal(false);
      }

      (await client.indices.existsAlias({ name: 'simple_search' })).body.should.equal( false );

    });

  });

});
