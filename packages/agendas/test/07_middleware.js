"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' ),

  svc = require( '../service/test' ),

  config = require( '../testconfig' ),

  async = require( 'async' );

describe( 'agendas - functional (server): middleware', function() {

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

  } );

} );