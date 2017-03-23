"use strict";

const svc = require( './service' ),

  config = require( '../testconfig' ),

  should = require( 'should' ),

  mysql = require( 'mysql' );

describe( 'events - functional (server): remove', function() {

  this.timeout( 5000 );

  beforeEach( done => {

    svc.initAndLoad( config, done );

  } );

  afterEach( svc.shutdown );

  it( 'simple remove makes event innaccessible through get', done => {

    let identifier = { uid: 3564473 };

    svc.get( identifier, ( err, event ) => {

      event.uid.should.equal( identifier.uid );

      svc.remove( identifier, ( err, result ) => {

        should( err ).equal( null );

        result.success.should.equal( true );

        svc.get( identifier, ( err, event ) => {

          should( event ).equal( null );

          done();

        } );

      } );

    } );

  } );


  it( 'remove makes event uid appear on deleted list', done => {

    svc.remove( 145599, ( err, event ) => {

      svc.deleted( 0, 1, ( err, deleted ) => {

        deleted[ 0 ].uid.should.equal( 16319926 );

        done();

      } );

    } );

  } );

} );