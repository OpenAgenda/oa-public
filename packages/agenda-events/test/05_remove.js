"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' );

const config = require( '../testconfig' );

const should = require( 'should' );

describe( 'agendaEvents - functional (server): remove', function() {

  this.timeout( 5000 );

  before( done => {

    svc.initAndLoad( config, done );

  } );

  it( 'simple remove', async () => {

    let before = await svc( 62792452 ).get( 10974548 );

    let result = await svc( 62792452 ).remove( 10974548 );

    let after = await svc( 62792452 ).get( 10974548 );

    result.success.should.equal( true );

    before.should.not.equal( null );

    should( after ).equal( null );

  } );

} );