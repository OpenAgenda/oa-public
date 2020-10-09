"use strict";

process.env.NODE_ENV = 'test';

const async = require( 'async' );
const fs = require( 'fs' );
const mysql = require( 'mysql' );
const should = require( 'should' );
const Files = require('@openagenda/files/v3');

const {
  service: config,
  dependencies: dConfig
} = require( '../testconfig.sample' );
const svc = require( '../' );

describe( 'agendas - functional (server): instanciate', function () {

  this.timeout( 30000 );

  before( () => {

    svc.init( {
      ...config,
      Files: Files(dConfig.files)
    } );

  } );

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

  beforeEach( done => {

    fs.createReadStream( __dirname + '/files/rainfrog.jpg' )

      .pipe( fs.createWriteStream( __dirname + '/files/tmp.jpg' ) )

      .on( 'close', () => {

        done();

      } );

  } );


  it( '.getData - get public raw data', done => {

    svc.get( 4826, { instanciate: true, internal: true, private: true }, ( err, agenda ) => {

      should( agenda.getData().id ).equal( undefined )

      done();

    } );

  } );

  it( '.getData - get all raw data', done => {

    svc.get( 4826, { instanciate: true, internal: true, private: true }, ( err, agenda ) => {

      should( agenda.getData( { internal: true } ).id ).equal( 4826 );

      done();

    } );

  } );

  it( 'setImage - successful set saves image name in db', done => {

    let con = mysql.createConnection( config.mysql ),

      aId = 4922;

    async.series( [ wcb => {

      con.query( 'select * from agenda where id = ?', aId, ( err, rows ) => {

        should( rows[ 0 ].image ).equal( null );

        wcb();

      } );

    }, wcb => {

      svc.get( aId, { instanciate: true }, ( err, agenda ) => {

        svc.set( aId, { image: { path: __dirname + '/files/tmp.jpg' } }, wcb );

      } );

    }, wcb => {

      con.query( 'select * from agenda where id = ?', aId, ( err, rows ) => {

        should( rows[ 0 ].image.split('?')[0] ).equal( 'agenda' + rows[ 0 ].uid + '.jpg' );

        con.end();

        wcb();

      } );

    } ], done );

  } );


  it( 'getImage - default get is without path', done => {

    svc.get( 4820, { instanciate: true }, ( err, a ) => {

      a.getImage().split('?')[0].should.equal( 'review_planning-intervenants_00.jpg' );

      done();

    } );

  } );


  it( 'getImage - get with true returns image name with path', done => {

    svc.get( 4820, { instanciate: true }, ( err, a ) => {

      a.getImage( true ).should.equal( '//openagendatst.s3.amazonaws.com/review_planning-intervenants_00.jpg' );

      done();

    } );

  } );

  it( 'getImage - no image returns null', done => {

    svc.get( 4832, { instanciate: true }, ( err, a ) => {

      should( a.getImage() ).equal( null );

      should( a.getImage( true ) ).equal( null );

      done();

    } );

  } );

  it( 'getImage - no image returns default path if config allows this', done => {

    svc.init( Object.assign( {}, config, { useDefaultImage: true, Files: Files(dConfig.files) } ) );

    svc.get( 4832, { instanciate: true }, ( err, a ) => {

      should( a.getImage( false, true ) ).equal( config.defaultImagePath );

      should( a.getImage( true, true ) ).equal( config.defaultImagePath );

      svc.init( {
        ...config,
        Files: Files(dConfig.files)
      } );

      done();

    } );

  } );

} );
