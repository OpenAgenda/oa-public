"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' ),

  svc = require( '../service/test' ),

  config = require( '../testconfig' ),

  async = require( 'async' );

describe( 'agendas - functional (server): middleware', function () {

  this.timeout( 30000 );

  before( () => {
    svc.init( config );
  } );

  before( svc.test.fixtures );

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

    it( '.load optionally loads agenda instance in req', done => {

      const req = {
          agendaUid: 94345899
        },

        res = {};

      svc.middleware.load( { instanciate: true } )( req, res, next );

      function next() {

        req.agenda.getRoles( ( err, roles ) => {

          roles.should.eql( [
            { value: 1, code: 'contributor' },
            { value: 2, code: 'administrator' }
          ] );

          done();

        } );

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

    it( '.loadRoles with a preloaded agenda as instance load roles in req', done => {

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
      } )( req, res, () => {

        svc.middleware.loadRoles( {
          namespaces: {
            agenda: 'a' ,
            result: 'r'
          },
          instanciate: true
        } )( req, res, next );

      } );

      function next( err ) {

        req.r.should.eql( [
          { code: 'contributor', value: 1 },
          { code: 'administrator', value: 2 }
        ] );

        done();

      }

    } );

    it( '.loadRoles with a preloaded agenda as object load roles in req', done => {

      const req = {
          uid: 94345899
        },

        res = {};

      svc.middleware.load( {
        namespaces: {
          identifiers: { uid: 'uid' },
          result: 'a'
        }
      } )( req, res, () => {

        svc.middleware.loadRoles( {
          namespaces: {
            agenda: 'a' ,
            result: 'r'
          },
          instanciate: true
        } )( req, res, next );

      } );

      function next( err ) {

        req.r.should.eql( [
          { code: 'contributor', value: 1 },
          { code: 'administrator', value: 2 }
        ] );

        done();

      }

    } );

  } );

} );