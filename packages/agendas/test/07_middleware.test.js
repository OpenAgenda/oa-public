"use strict";

process.env.NODE_ENV = 'test';

const async = require( 'async' );
const Files = require('@openagenda/files');

const svc = require( '../service/index.js' );

const {
  service: config,
  dependencies: dConfig
} = require( '../testconfig.sample.js' );

describe( 'agendas - functional (server): middleware', function () {

  beforeAll( () => svc.init( {
    ...config,
    Files: Files(dConfig.files)
  } ) );

  beforeAll( require( './fixtures/load.js' ).bind( null, {
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

        expect(req.agenda.title).toBe( 'EPN "Espace Torcy"' );

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

        expect(req.a.title).toBe( 'EPN "Espace Torcy"' );

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

        expect(req.a).toBeInstanceOf( svc.Agenda );

        done();

      }

    } );

  } );

} );
