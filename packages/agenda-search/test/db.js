"use strict";

var should = require( 'should' ),

db = require( '../service/db' ),

config = require( '../testconfig' ),

fixtures = require( './fixtures' );

describe( 'db', () => {

  before( fixtures );

  before( () => {

    db.init( config );

  } );

  it( 'list', done => {

    db.list( 0, 10, ( err, agendas ) => {

      agendas.length.should.equal( 10 );

      done();

    } );

  })

} );