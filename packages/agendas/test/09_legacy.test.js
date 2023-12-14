"use strict";

process.env.NODE_ENV = 'test';

const mysql = require( 'mysql' );
const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig
} = require( '../testconfig.sample.js' );
const legacy = require( '../service/legacy/index.js' );
const svc = require( '../service/index.js' );

describe( 'agendas - unit (server): legacy bridging', function() {

  beforeAll( () => svc.init( {
    ...config,
    Files: Files(dConfig.files)
  } ) );

  beforeEach( require( './fixtures/load.js' ).bind( null, {
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
      occurrence: 'occurrence',
      legacyCredential: 'legacy_credential_set'
    }
  } ) );

  describe( 'applyToLegacy', () => {

    it( 'contribution default state is written in store', done => {

      let con = mysql.createConnection( config.mysql );

      con.query( 'select store from agenda where id = 4818', ( err, rows ) => {

        let currentStore = JSON.parse( rows[ 0 ].store );

        expect(currentStore.moderated).toBe(false);

        legacy( 4818 ).applyToLegacy( {
          settings: {
            contribution: {
              defaultState: 0
            }
          }
        }, err => {

          con.query( 'select store from agenda where id = 4818', ( err, rows ) => {

            expect(JSON.parse( rows[ 0 ].store ).moderated).toBe(true);

            done();

          } );

        } );

      } );

    } );


  } )

} );
