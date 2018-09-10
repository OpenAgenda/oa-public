"use strict";

//process.env.DEBUG = '*';

const svc = require( './service' ),

  config = require( '../testconfig' ),

  should = require( 'should' ),

  mysql = require( 'mysql' ),

  ih = require( 'immutability-helper' )

describe( 'events - functional (server): remove', function() {

  this.timeout( 30000 );

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

  it( 'remove works as a promise', async () => {

    let result = await svc.remove( 145599 );

    result.success.should.equal( true );

  } );

  describe( 'interfaces', () => {

    beforeEach( done => {

      svc.initAndLoad( config, done );

    } );

    afterEach( svc.shutdown );

    it( 'if userUid is specified in options, it is given back in beforeRemove interface', done => {

      svc.init( ih( config, {
        interfaces: {
          beforeRemove: {
            $set: ( event, context, cb ) => {

              context.should.eql( {
                userUid: 12345678,
                agendaUid: null,
                tranferToLegacy: false
              } );

              cb();

            }
          }
        }
      } ) );

      svc.remove( 145599, { context: { userUid: 12345678 } }, () => {

        done();

      } );

    } );

    it( 'if userUid is specified in options, it is given back in onRemove interface', done => {

      svc.init( ih( config, {
        interfaces: {
          onRemove: {
            $set: ( event, context ) => {

              context.should.eql( {
                userUid: 12345678,
                agendaUid: null,
                transferToLegacy: false,
                deletion: null // ?
              } );

              done();

            }
          }
        }
      } ) );

      svc.remove( 145599, { context: { userUid: 12345678 } }, () => {} );

    } );

    it( 'if nothing is specified in context, userUid is null', done => {

      svc.init( ih( config, {
        interfaces: {
          onRemove: {
            $set: ( event, context ) => {

              should( context.userUid ).equal( null );

              done();

            }
          }
        }
      } ) );

      svc.remove( 145599, () => {} );      

    } );


  } );



} );
