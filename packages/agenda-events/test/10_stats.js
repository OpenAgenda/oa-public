"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' );
const config = require( '../testconfig' );
const should = require( 'should' );

describe( 'agendaEvents - functional (server): stats', function() {

  this.timeout( 5000 );

  before( done => {

    svc.initAndLoad( config, done );

  } );

  it( 'countByUserUid', async () => {

    const counts = await svc( 62792452 ).stats.countByUserUid();

    counts.should.eql( [ {
      count: 2287, userUid: null
    }, {
      count: 1, userUid: 12312312
    } ] );

  } );

} );
