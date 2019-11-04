'use strict';

const should = require('should');

const events = require('@openagenda/events/test/service');

const config = require('../testconfig');
const Service = require('../');

describe('event-search - functional: rebuild', function() {

  describe('basic usage', function() {

    let totalEvents;
    let service;

    this.timeout(20000);

    async function eventsList(offset, limit) {
      return events.list(offset, limit, {
        internal: true,
        detailed: true,
        private: null
      }).then(r =>  r.events);
    }

    before(done => {
      events.initAndLoad(config.eventService, [{
        table: 'event',
        src: __dirname + '/service/event.data.sql'
      }], { reset: true }, async () => {
        const result = await events.list({}, 0, 1, { total: true });

        totalEvents = result.total;

        done();
      });
    });

    beforeEach(() => {
      service = Service(config);
    });

    describe('list evaluation', () => {

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
            eventsList: ( offset, limit) => new Promise( ( rs, rj ) => rj( new Error( 'crash!' ) ) )
          } );
        } catch(e) {
          err = e;
        }

        err.message.should.equal('provided list failed: crash!');
      });

    });

    describe('index generation', () => {

      it('generated index name is given in result details', async () => {
        const result = await service( 'test_alias' ).rebuild({
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
        })).should.equal(true);
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

  } );

  describe( 'extending the mapping', function() {

    let service;

    this.timeout( 10000 );

    function eventsList( offset, limit ) {

      return events.list( offset, limit, {
        internal: true,
        detailed: true,
        private: null
      } ).then( r => r.events );

    }

    before(done => {
      events.initAndLoad( config.eventService, [{
        table: 'event',
        src: __dirname + '/service/event.data.sql'
      }], { reset: true }, done);
    });

    beforeEach(() => {
      service = Service(config);
    });

    it( 'takes schema fields and uses it to extend mapping', async () => {

      const config = service.getConfig();

      await service( 'test_alias_extended' ).rebuild( {
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
      } );

      // look at mapping
      let result = await config.client.indices.getMapping( {
        index: 'test_alias_extended',
        type: config.type
      } );

      result[ Object.keys( result )[ 0 ] ].mappings.event.properties.custom

      .should.eql( { properties: {
        expectedParticipants: {
          type: 'integer'
        },
        inquiryEmail: {
          type: 'keyword'
        },
        search_internal_keywords: {
          type: 'keyword'
        }
      } } );

    } );

  } );

} );
