"use strict";

const should = require( 'should' );
const config = require( '../testconfig' );
const events = require( '@openagenda/events/test/service' );
const Service = require( '../' );

describe( 'event search - functional: remove', function() {

  let service;

  this.timeout( 10000 );

  before( done => {

    events.initAndLoad( config.eventService, [ {
      table: 'event',
      src: __dirname + '/service/event.data.sql'
    } ], { reset: true }, done );

  } );

  before( async () => {
    service = Service(config);

    function eventsList( offset, limit ) {

      return events.list( offset, limit, {
        internal: true,
        detailed: true
      } ).then( r => r.events );

    }

    await service( 'test_index' ).rebuild({ eventsList });
  } );

  it('remove an event from index by uid', async () => {

    let result = await service('test_index').remove({ uid: 1 }, { refresh: true });

    result.success.should.equal( true );

  });

} );
