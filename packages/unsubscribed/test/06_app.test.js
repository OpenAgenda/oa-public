"use strict";

const service = require( './service' ),

  config = require( '../testconfig' ),

  mysql = require( 'mysql' ),

  express = require( 'express' ),

  _ = require( 'lodash' ),

  sa = require( 'superagent' );

describe( 'unsubscribed - functional: express app', function () {

  let parentApp, server;

  // initialize service
  beforeAll( done => {

    service.initAndLoad( config, done );

  } );

  beforeAll( () => {

    parentApp = express();

    service.app.useBy( parentApp, '/unsubscribe' );

  } );

  describe( 'genUrl', () => {

    it( 'generate link based on values', () => {

      expect(service.app.genUrl( 'add', {
        userUid: 123,
        subject: 'agenda',
        identifier: 218,
        type: 'event_added'
      } )).toBe( '/unsubscribe/u/123/s/agenda/i/218/t/event_added' );

    } );

    it( 'generate link without type', () => {

      expect(service.app.genUrl( 'add', {
        userUid: 123,
        subject: 'agenda',
        identifier: 218
      } )).toBe( '/unsubscribe/u/123/s/agenda/i/218' );

    } );

    it( 'generate link without identifier', () => {

      expect(service.app.genUrl( 'add', {
        userUid: 123,
        subject: 'notifications',
        type: 'summary'
      } )).toBe( '/unsubscribe/u/123/s/notifications/t/summary' )

    } );

  } );

  describe( 'http calls', () => {

    // plug service app to parent app
    beforeAll( () => {

      // response is handled by parent app
      parentApp.use( '/unsubscribe', ( req, res, next ) => {

        // service app gives result in 'result' object
        res.send( req.result.success ? 'ok' : 'nok' );

      } );

    } )

    // launch server
    beforeEach( () => {

      server = parentApp.listen( 3000 );

    } );

    // stop server
    afterEach( () => {

      server.close();

    } );

    it( 'simple add reference', done => {

      sa.get( 'http://localhost:3000/unsubscribe/u/123/s/agenda/i/456/t/notif_published_event' )

        .end( ( err, res ) => {

          expect(res.text).toBe( 'ok' );

          done();

        } );

    } );

    it( 'simple unsuccessful remove', done => {

      sa.get( 'http://localhost:3000/unsubscribe/u/124/s/agenda/i/456/t/notif_published_event/remove' )

        .end( ( err, res ) => {

          expect(res.text).toBe( 'nok' );

          done();

        } );

    } );

    it( 'simple successful remove', done => {

      sa.get( 'http://localhost:3000/unsubscribe/u/123/s/agenda/i/456/t/notif_published_event' )

        .end( ( err, res ) => {

          sa.get( 'http://localhost:3000/unsubscribe/u/123/s/agenda/i/456/t/notif_published_event/remove' )

            .end( ( err, res ) => {

              expect(res.text).toBe( 'ok' );

              done();

            } );

        } );

    } );

    it( 'add without type', done => {

      sa.get( 'http://localhost:3000/unsubscribe/u/123/s/agenda/i/456' )

        .end( ( err, res ) => {

          expect(res.text).toBe( 'ok' )

          done();

        } )

    } );

    it( 'typeless remove', done => {

      sa.get( 'http://localhost:3000/unsubscribe/u/123/s/agenda/i/456' )

        .end( ( err, res ) => {

          sa.get( 'http://localhost:3000/unsubscribe/u/123/s/agenda/i/456/remove' )

            .end( ( err, res ) => {

              expect(res.text).toBe( 'ok' );

              done();

            } );

        } );

    } );

    it( 'typeless list', done => {

      sa.get( 'http://localhost:3000/unsubscribe/u/123/list' )

        .end( ( err, res ) => {

          expect(res.text).toBe( 'ok' );

          done();

        } );

    } );


    it( 'identifierless add', done => {

      sa.get( 'http://localhost:3000/unsubscribe/u/123/s/notifications/t/summary' )

        .end( ( err, res ) => {

          expect(res.text).toBe( 'ok' )

          done();

        } );

    } );

    it( 'identifierless remove', done => {

      sa.get( 'http://localhost:3000/unsubscribe/u/123/s/notifications/t/summary' )

        .end( err => {

          sa.get( 'http://localhost:3000/unsubscribe/u/123/s/notifications/t/summary/remove' )

            .end( ( err, res ) => {

              expect(res.text).toBe( 'ok' );

              done();

            } );

        } );

    } );

  } );

} );
