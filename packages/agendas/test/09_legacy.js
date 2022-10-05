"use strict";

process.env.NODE_ENV = 'test';

const knex = require( 'knex' );
const mysql = require( 'mysql' );
const should = require( 'should' );
const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig
} = require( '../testconfig.sample' );
const legacy = require( '../service/legacy' );
const svc = require( '../' );

describe( 'agendas - unit (server): legacy bridging', function() {

  this.timeout( 30000 );

  before( () => svc.init( {
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

        currentStore.moderated.should.equal( false );

        legacy( 4818 ).applyToLegacy( {
          settings: {
            contribution: {
              defaultState: 0
            }
          }
        }, err => {

          con.query( 'select store from agenda where id = 4818', ( err, rows ) => {

            JSON.parse( rows[ 0 ].store ).moderated.should.equal( true );

            done();

          } );

        } );

      } );

    } );


  } )

} );
