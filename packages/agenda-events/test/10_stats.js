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

  it( 'countByUserUid (unrestricted)', async () => {

    const counts = await svc( 62792452 ).stats.countByUserUid();

    counts.should.eql( [ {
      count: 2282, userUid: null
    }, {
      count: 1, userUid: 1
    }, {
      count: 2, userUid: 123
    }, {
      count: 2, userUid: 456
    }, {
      count: 1, userUid: 12312312
    } ] );

  } );

  it( 'countByUserUid (for specific user uids)', async () => {

    const counts = await svc( 62792452 ).stats.countByUserUid( [ 12312312 ] );

    counts.should.eql( [ {
      count: 1, userUid: 12312312
    } ] );

  } );

} );
