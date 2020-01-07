'use strict';

const fs = require('fs');
const should = require('should');
const config = require('../testconfig');
const Service = require('../');
const textLog = require('../service/helpers/textLog');

describe('01 - event-search - functional: rebuild', function() {

  describe('basic usage', function() {

    const totalEvents = 30;
    let service;

    this.timeout(30000);

    async function eventsList(lastId, limit) {
      return JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/01_events.${lastId}.${limit}.json`)
      );
    }

    beforeEach(() => {
      service = Service(config);
    });

    describe('01 - list evaluation', () => {

      it('if a input list is not provided, errors', async () => {
        try {
          await service('test_alias').rebuild('not a function');
        } catch( err ) {
          err.message.should.equal('list is not a function');
        }
      } );

      it('if list returns an error, it is encapsulated', async () => {
        let err;

        try {
          await service('test_alias').rebuild( {
            eventsList: (lastId, limit) => new Promise( ( rs, rj ) => rj( new Error( 'crash!' ) ) )
          } );
        } catch(e) {
          err = e;
        }

        err.message.should.equal('provided list failed: crash!');
      });

    });

    describe('01 - index rebuild', function() {

      it('generated index name is given in result details', async () => {
        const result = await service('test_alias').rebuild({
          eventsList
        });

        // index will look like this: test_alias_20170327T1013
        result.detail.index.substr(0, 10).should.equal('test_alias');
      });

      it('result gives number of indexed events', async () => {
        const result = await service('test_alias').rebuild({
          eventsList
        });

        result.counts.indexed.should.equal(totalEvents);
      });

      it('index is effectively created', async () => {
        const result = await service( 'test_alias' ).rebuild({
          eventsList
        });

        (await service.getConfig().client.indices.exists({
          index: result.detail.index
        })).body.should.equal(true);
      });

      it('.exists endpoint indicates when an index does not exist', async () => {
        const exists = await service('this_alias_does_not_exist').exists();

        exists.should.equal(false);
      });

      it('.exists endpoint indicates when an alias/index exists', async () => {

        const exists = await service( 'test_alias' ).exists();

        exists.should.equal( true );

      } );

    } );

  });

  describe('extending the mapping', function() {

    let service;

    this.timeout(60000);

    async function eventsList(offset, limit) {
      return JSON.parse(
        fs.readFileSync(`${__dirname}/fixtures/01_events.${offset}.${limit}.json`)
      );
    }

    beforeEach(() => {
      service = Service(config);
    });

    it('takes schema fields and uses it to extend mapping', async () => {

      const config = service.getConfig();

      await service('test_alias_extended').rebuild({
        eventsList,
        extensions: {
          custom: {
            expectedParticipants: {
              type: 'integer'
            },
            inquiryEmail: {
              type: 'email'
            }
          }
        }
      });

      /*
        {
          "body": {
            "test_alias_extended_20200102t1036": {
              "mappings": {
      */

      // look at mapping
      const mappings = await config.client.indices.getMapping({
        index: 'test_alias_extended'
      }).then(r => r.body[Object.keys(r.body)[0]].mappings);


      mappings.properties.custom.should.eql({
        properties: {
          expectedParticipants: {
            type: 'integer'
          },
          inquiryEmail: {
            type: 'keyword'
          },
          search_internal_keywords: {
            type: 'keyword'
          }
        }
      });

    } );

  } );

} );
