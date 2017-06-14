"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' );

const config = require( '../testconfig' );

const _ = require( 'lodash' );

const should = require( 'should' );

describe( 'agendaEvents - functional (server): get', function() {

  this.timeout( 5000 );

  before( done => {

    svc.initAndLoad( config, done );

  } );

  it( 'simple get', async () => {

    let ref = await svc( 62792452 ).get( 10974548 );

    _.omit( ref, [ 'updatedAt', 'createdAt' ] ).should.eql( {
      agendaUid: 62792452,
      eventUid: 10974548,
      state: config.eventStates.VALIDATED,
      featured: false
    } );

  } );

} );