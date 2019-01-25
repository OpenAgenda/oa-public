"use strict";

process.env.NODE_ENV = 'test';

const knex = require( 'knex' );
const mysql = require( 'mysql' );
const should = require( 'should' );

const config = require( '../testconfig' );
const legacy = require( '../service/legacy' );
const svc = require( '../' );

describe( 'agendas - unit (server): legacy bridging', function() {

  this.timeout( 30000 );

  before( () => svc.init( config ) );

  beforeEach( require( './fixtures/load.js' ).bind( null, {
    mysql: config.mysql,
    files: [
      __dirname + '/fixtures/resetDb.sql',
      __dirname + '/../model.sql',
      __dirname + '/fixtures/agenda.data.sql',
      __dirname + '/fixtures/agendaEvent.data.sql',
      __dirname + '/fixtures/occurrence.data.sql',
      __dirname + '/fixtures/legacyCredentialSet.data.sql'
    ],
    map: {
      database: config.mysql.database,
      agenda: 'agenda',
      agendaEvent: 'agenda_event',
      occurrence: 'occurrence',
      legacyCredential: 'legacy_credential_set'
    }
  } ) );

  describe( 'loadFromLegacy', () => {

    it( 'loads settings information from legacy data structure', done => {

      legacy( 4878 ).loadFromLegacy( ( err, data ) => {

        data.should.eql( {
          settings: {
            contribution: {
              type: 0,
              moderateOnChangeBy: [],
              defaultState: 2,
              message: null
            }
          },
          credentials: {
            indesign: 0,
            activatingInvitations: 0,
            eventOwnershipTransfer: 0,
            embedsTemplates: 1,
            moderators: 0,
            embedsHead: 0,
            emailstrategie: 0,
            tags: 1,
            aggregator: 0
          }
        } );

        done();

      } );

    } );

  } );

  describe( 'applyToLegacy', () => {

    it( 'credentials are written in legacy credentials table', done => {

      let con = mysql.createConnection( config.mysql );

      con.query( 'select * from ' + config.schemas.legacyCredentialSet + ' where review_id = ?', 4828, ( err, rows ) => {

        rows[ 0 ].indesign.should.equal( 0 );
        rows[ 0 ].custom_templates.should.equal( 0 );

        legacy( 4828 ).applyToLegacy( {
          credentials: {
            indesign: 1,
            embedsTemplates: 1
          }
        }, err => {

          con.query( 'select * from ' + config.schemas.legacyCredentialSet + ' where review_id = ?', 4828, ( err, rows ) => {

            rows[ 0 ].indesign.should.equal( 1 );
            rows[ 0 ].custom_templates.should.equal( 1 );

            done();

          } );

        } );

      } );

    } );


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
