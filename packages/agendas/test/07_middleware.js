"use strict";

process.env.NODE_ENV = 'test';

const async = require( 'async' );
const should = require( 'should' );

const svc = require( '../' );

const config = require( '../testconfig' );

describe( 'agendas - functional (server): middleware', function () {

  this.timeout( 30000 );

  before( () => svc.init( config ) );

  before( require( './fixtures/load.js' ).bind( null, {
    mysql: config.mysql,
    files: [
      __dirname + '/fixtures/resetDb.sql',
      __dirname + '/../model.sql',
      __dirname + '/fixtures/agenda.data.sql',
      __dirname + '/fixtures/agendaEvent.data.sql',
      __dirname + '/fixtures/occurrence.data.sql'
    ],
    map: {
      database: config.mysql.database,
      agenda: 'agenda',
      agendaEvent: 'agenda_event',
      occurrence: 'occurrence'
    }
  } ) );

  describe( '.load', () => {

    it( '.load loads agenda data in req', done => {

      const req = {
          agendaSlug: 'epn-espace-torcy',
        },

        res = {};

      svc.middleware.load()( req, res, next );

      function next() {

        req.agenda.title.should.equal( 'EPN "Espace Torcy"' );

        done();

      }

    } );

    it( '.load namespaces can be specified', done => {

      const req = {
          uid: 94345899
        },

        res = {};

      svc.middleware.load( { namespaces: { identifiers: { uid: 'uid' }, result: 'a' } } )( req, res, next );

      function next( err ) {

        req.a.title.should.equal( 'EPN "Espace Torcy"' );

        done();

      }

    } );

    it( '.load with instanciate returns an instance of Agenda', done => {

      const req = {
          uid: 94345899
        },

        res = {};

      svc.middleware.load( {
        namespaces: {
          identifiers: { uid: 'uid' },
          result: 'a'
        },
        instanciate: true
      } )( req, res, next );

      function next( err ) {

        req.a.should.instanceOf( svc.Agenda );

        done();

      }

    } );

  } );

  describe( '.evaluateIPAddress', () => {

    describe( 'IP-protected agenda', () => {

      it( 'use middleware after load to verify IP and redirect if not authorized', done => {

        const req = {
          agendaSlug: 'agenda-protege',
          header: ns => ( ( { // simulate express req.header() function
            'x-forwarded-for' : '111.111.111.111'
          } )[ ns ] )
        },

          res = {};

        const evaluateIPAddress = svc.middleware.evaluateIPAddress( {
          onUnauthorizedIPAddress: ( req, res, next ) => {

            should( req ).be.ok;

            done();

          }
        } );

        svc.middleware.load()( req, res, () => {

          // loaded, we can use evaluateIPAddress now

          evaluateIPAddress( req, res, () => {

            throw new Error( 'should not reach here' );

          } );

        } );

      } );

      it( 'escape function is not called if IP is authorized', done => {

        const req = {
          agendaSlug: 'agenda-protege',
          header: ns => ( ( { // simulate express req.header() function
            'x-forwarded-for' : '123.123.123.101'
          } )[ ns ] )
        },

          res = {};

        const evaluateIPAddress = svc.middleware.evaluateIPAddress( {
          onUnauthorizedIPAddress: ( req, res, next ) => {

            throw new Error( 'should not reach here' );

            done();

          }
        } );

        svc.middleware.load()( req, res, () => {

          // loaded, we can use evaluateIPAddress now

          evaluateIPAddress( req, res, () => {

            should( req ).be.ok;

            done();

          } );

        } );

      } );

    } );


    describe( 'IP-Unprotected agenda', () => {

      it( 'escape function is not called if no authorized IP are defined', done => {

        const req = {
          agendaSlug: 'agenda-pas-protege',
          header: ns => ( ( { // simulate express req.header() function
            'x-forwarded-for' : '123.456.789.101' // any ip goes
          } )[ ns ] )
        },

          res = {};

        const evaluateIPAddress = svc.middleware.evaluateIPAddress( {
          onUnauthorizedIPAddress: ( req, res, next ) => {

            throw new Error( 'should not reach here' );

            done();

          }
        } );

        svc.middleware.load()( req, res, () => {

          // loaded, we can use evaluateIPAddress now

          evaluateIPAddress( req, res, () => {

            should( req ).be.ok;

            done();

          } );

        } );

      } );

    } );

  } );

} );
