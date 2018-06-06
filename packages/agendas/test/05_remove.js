"use strict";

process.env.NODE_ENV = 'test';

const mysql = require( 'mysql' );
const should = require( 'should' );

const config = require( '../testconfig' );
const svc = require( '../' );

describe( 'agendas - functional (server): remove', function() {

  this.timeout( 30000 );

  before( require( './fixtures/load.js' ).bind( null, {
    mysql: config.mysql,
    files: [
      __dirname + '/fixtures/resetDb.sql',
      __dirname + '/../agenda.sql',
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

  before( () => svc.init( config ) );

  afterEach( () => svc.init( config ) );

  it( 'agenda remove removes db entry', done => {

    let con = mysql.createConnection( config.mysql );

    con.query( `select id from ${config.schemas.agenda} where id = ?`, 4875, ( err, rows ) => {

      rows.length.should.equal( 1 );

      svc.remove( 4875, ( err, result ) => {

        should( err ).equal( null );

        con.query( `select id from ${config.schemas.agenda} where id = ?`, 4875, ( err, rows ) => {

          rows.length.should.equal( 0 );

          con.end();

          done();

        } );

      } );

    } );

  } );

  it( 'agenda remove with private option set removes private db entry', done => {

    let con = mysql.createConnection( config.mysql );

    con.query( `select id from ${config.schemas.agenda} where id = ?`, 4826, ( err, rows ) => {

      rows.length.should.equal( 1 );

      svc.remove( 4826, ( err, result ) => {

        should( err ).equal( null );

        con.query( `select id from ${config.schemas.agenda} where id = ?`, 4826, ( err, rows ) => {

          rows.length.should.equal( 0 );

          con.end();

          done();

        } );

      } );

    } );

  } );


  it( 'agenda remove calls interface callback beforeRemove and onRemove', done => {

    // do this as part of unique init
    svc.init( Object.assign( {}, config, {
      interfaces: {
        beforeRemove: ( agenda, cb ) => {

          agenda.id.should.equal( 4830 );

          cb();

        },
        onRemove: agenda => {

          agenda.id.should.equal( 4830 );

          done();

        }
      }
    } ) );

    svc.remove( 4830, () => {} );

  } );

} );