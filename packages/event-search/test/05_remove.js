"use strict";

const fs = require('fs');
const should = require( 'should' );
const config = require( '../testconfig' );
const Service = require( '../' );

describe( 'event search - functional: remove', function() {

  let service;

  this.timeout( 20000 );

  before( async () => {
    service = Service(config);

    await service( 'test_index' ).rebuild({
      eventsList: async function( offset, limit ) {
        return JSON.parse(fs.readFileSync(`${__dirname}/fixtures/05_events.${offset}.${limit}.json`));
      }
    });
  } );

  it('remove an event from index by uid', async () => {

    let result = await service('test_index').remove({ uid: 1 }, { refresh: true });

    result.success.should.equal( true );

  });

} );
