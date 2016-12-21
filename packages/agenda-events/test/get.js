"use strict";

process.env.NODE_ENV = 'test';

const svc = require( '../' );

const config = require( '../testconfig' );

const should = require( 'should' );

const fixtures = require( './fixtures' );

const _ = require( 'lodash' );

describe( 'get references', function() {

  this.timeout( 5000 );

  before( () => {

    svc.init( config );

  } );

  before( done => {

    fixtures( config, done );

  } );

  it( 'simple get', done => {

    svc( 4608 ).get( 81751, ( err, data ) => {

      _.omit( data, [ 'createdAt', 'updatedAt' ] ).should.eql( {
        id: 5,
        agendaId: 4608,
        eventId: 81751,
        state: 1,
        featured: 0
      } )

      done();

    } );

  } );

} );