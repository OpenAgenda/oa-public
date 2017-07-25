"use strict";

const should = require( 'should' ),

  service = require( './service' ),

  config = require( '../testconfig' ),

  mysql = require( 'mysql' ),

  express = require( 'express' ),

  _ = require( 'lodash' ),

  sa = require( 'superagent' );

describe( 'unsubscribed - functional: express app', function () {

  this.timeout( 30000 ); // pour la bécane de course de kevin

  let parentApp, server;

  // initialize service
  before( done => {

    service.initAndLoad( config, done );

  } );

  before( () => {

    parentApp = express();

    service.app.useBy( parentApp, '/unsubscribe' );

  } );

  describe( 'genUrl', () => {

    it( 'generate link based on values', () => {

      service.app.genUrl( 'add', {
        userUid: 123,
        subject: 'agenda',
        identifier: 218,
        type: 'event_added'
      } )

        .should.equal( '/unsubscribe/u/123/s/agenda.218/t/event_added' );

    } );

    it( 'generate link without type', () => {

      service.app.genUrl( 'add', {
        userUid: 123,
        subject: 'agenda',
        identifier: 218
      } )

        .should.equal( '/unsubscribe/u/123/s/agenda.218' );

    } );

    it( 'generate link without identifier', () => {

      service.app.genUrl( 'add', {
        userUid: 123,
        subject: 'notifications',
        type: 'summary'
      } )

        .should.equal( '/unsubscribe/u/123/s/notifications/t/summary' )

    } );

  } );

  describe( 'http calls', () => {

    // plug service app to parent app
    before( () => {

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

      sa.get( 'http://localhost:3000/unsubscribe/u/123/s/agenda.456/t/notif_published_event' )

        .end( ( err, res ) => {

          res.text.should.equal( 'ok' );

          done();

        } );

    } );

    it( 'simple unsuccessful remove', done => {

      sa.get( 'http://localhost:3000/unsubscribe/u/124/s/agenda.456/t/notif_published_event/remove' )

        .end( ( err, res ) => {

          res.text.should.equal( 'nok' );

          done();

        } );

    } );

    it( 'simple successful remove', done => {

      sa.get( 'http://localhost:3000/unsubscribe/u/123/s/agenda.456/t/notif_published_event' )

        .end( ( err, res ) => {

          sa.get( 'http://localhost:3000/unsubscribe/u/123/s/agenda.456/t/notif_published_event/remove' )

            .end( ( err, res ) => {

              res.text.should.equal( 'ok' );

              done();

            } );

        } );

    } );

    it( 'add without type', done => {

      sa.get( 'http://localhost:3000/unsubscribe/u/123/s/agenda.456' )

        .end( ( err, res ) => {

          res.text.should.equal( 'ok' )

          done();

        } )

    } );

    it( 'typeless remove', done => {

      sa.get( 'http://localhost:3000/unsubscribe/u/123/s/agenda.456' )

        .end( ( err, res ) => {

          sa.get( 'http://localhost:3000/unsubscribe/u/123/s/agenda.456/remove' )

            .end( ( err, res ) => {

              res.text.should.equal( 'ok' );

              done();

            } );

        } );

    } );

    it( 'typeless list', done => {

      sa.get( 'http://localhost:3000/unsubscribe/u/123/list' )

        .end( ( err, res ) => {

          res.text.should.equal( 'ok' );

          done();

        } );

    } );


    it( 'identifierless add', done => {

      sa.get( 'http://localhost:3000/unsubscribe/u/123/s/notifications/t/summary' )

        .end( ( err, res ) => {

          res.text.should.equal( 'ok' )

          done();

        } );

    } );

    it( 'identifierless remove', done => {

      sa.get( 'http://localhost:3000/unsubscribe/u/123/s/notifications/t/summary' )

        .end( err => {

          sa.get( 'http://localhost:3000/unsubscribe/u/123/s/notifications/t/summary/remove' )

            .end( ( err, res ) => {

              res.text.should.equal( 'ok' );

              done();

            } );

        } );

    } );

  } );

} );