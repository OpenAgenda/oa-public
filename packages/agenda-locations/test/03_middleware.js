"use strict";

process.env.NODE_ENV = 'test';

var should = require( 'should' ),

fixtures = require( './fixtures' ),

svc = require( '../' ),

config = require( '../testconfig.js' ),

utils = require( '@openagenda/utils' );

describe( 'middleware', function() {

  let middleware;

  this.timeout( 10000 );

  beforeEach( done => fixtures( 123, done ) );

  beforeEach( done => svc.init( config, done ) );

  beforeEach( () => {

    middleware = svc.mw( 'agendaId' );

  } );

  it( 'generic get', done => {

    svc.set( { uid: 27330589, image: 'fdfdq.jpg' }, err => {

      let req = {
        params: {
          uid: 27330589
        }
      }

      svc.mw.get( req, {}, err => {

        should( err ).equal( undefined );

        req.location.image.should.equal( '//openagendatst.s3.amazonaws.com/fdfdq.jpg' );

        done();

      } );

    } );

  } );


  it( 'setToValidate forces state to to be controlled', done => {

    middleware.setToValidate( {
      xhr: true,
      query: {},
      agendaId: 123,
      params: {
        locationUid: 36091457
      },
      body: {
        name: 'La boutique',
        address: '29 passage ponceau',
        latitude: 1,
        longitude: 2
      }
    }, {
      json: function( data ) {

        data.location.state.should.equal( 0 );

        done();

      }
    }, err => {

      'not supposed to throw an error'.should.equal( false );

      done();

    } );

  } );


  it( 'remove with non null event count', done => {

    svc.init( utils.extend( {}, config, {
      interfaces: {
        getEventCount: ( l, cb ) => { cb( null, 4, 2 ); }
      }
    } ), () => {

      middleware.remove( {
        xhr: true,
        agendaId: 123,
        params: {
          locationUid: 36091457
        },
        body: {}
      }, {
        json: data => {

          data.should.eql( {
            success: false,
            eventCount: 4
          } );

          done();

        }
      }, err => { console.log( err );  'not here'.should.equal( false ); done(); } )

    } );

  } );


  it( 'remove with 0 event count', done => {

    svc.init( utils.extend( {}, config, {
      interfaces: {
        getEventCount: ( l, cb ) => { cb( null, 0, 0 ); }
      }
    } ), () => {

      middleware.remove( {
        xhr: true,
        agendaId: 123,
        params: {
          locationUid: 36091457
        },
        body: {}
      }, {
        json: data => {

          data.should.eql( {
            removed: true
          } );

          done();

        }
      }, err => { console.log( err );  'not here'.should.equal( false ); done(); } )

    } );

  } );

});
