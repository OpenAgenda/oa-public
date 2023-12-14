"use strict";

process.env.NODE_ENV = 'test';

const mysql = require( 'mysql' );
const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig
} = require( '../testconfig.sample.js' );
const svc = require( '../service/index.js' );

describe( 'agendas - functional (server): remove', function() {

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

  beforeAll( () => svc.init( {
    ...config,
    Files: Files(dConfig.files)
  } ) );

  afterEach( () => svc.init( {
    ...config,
    Files: Files(dConfig.files)
  } ) );

  it( 'agenda remove removes db entry', done => {

    let con = mysql.createConnection( config.mysql );

    con.query( `select id from ${config.schemas.agenda} where id = ?`, 4875, ( err, rows ) => {

      expect(rows.length).toBe( 1 );

      svc.remove( 4875, ( err, result ) => {

        expect(err).toBeNull();

        con.query( `select id from ${config.schemas.agenda} where id = ?`, 4875, ( err, rows ) => {

          expect(rows.length).toBe( 0 );

          con.end();

          done();

        } );

      } );

    } );

  } );

  it( 'agenda remove with private option set removes private db entry', done => {

    let con = mysql.createConnection( config.mysql );

    con.query( `select id from ${config.schemas.agenda} where id = ?`, 4826, ( err, rows ) => {

      expect(rows.length).toBe( 1 );

      svc.remove( 4826, ( err, result ) => {

        expect(err).toBeNull();

        con.query( `select id from ${config.schemas.agenda} where id = ?`, 4826, ( err, rows ) => {

          expect(rows.length).toBe( 0 );

          con.end();

          done();

        } );

      } );

    } );

  } );


  it( 'agenda remove calls interface callback beforeRemove and onRemove', done => {

    // do this as part of unique init
    svc.init( Object.assign( {}, config, {
      Files: Files(dConfig.files),
      interfaces: {
        beforeRemove: ( agenda, cb ) => {

          expect(agenda.id).toBe( 4830 );

          cb();

        },
        onRemove: agenda => {

          expect(agenda.id).toBe( 4830 );

          done();

        }
      }
    } ) );

    svc.remove( 4830, () => {} );

  } );

} );
