"use strict";

process.env.NODE_ENV = 'test';

const svc = require( '../' );

const config = require( '../testconfig' );

const should = require( 'should' );

const fixtures = require( './fixtures' );

const _ = require( 'lodash' );

describe( 'list references', function() {

  this.timeout( 5000 );

  before( () => {

    svc.init( config );

  } );

  before( done => {

    fixtures( config, [ 'agenda_event' ], done );

  } );

  it( 'simple list', done => {

    svc( 4608 ).list( 100, 10, ( err, items, total ) => {

      should( err ).equal( null );

      total.should.equal( 998 );

      items.length.should.equal( 10 );

      _.omit( items[ 0 ], [ 'updatedAt', 'createdAt' ] )

      .should.eql( {
        id: 101,
        agendaId: 4608,
        eventId: 82723,
        state: 1,
        featured: 0
      } );

      done();

    } );

  } );

} );