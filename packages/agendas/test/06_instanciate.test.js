"use strict";

process.env.NODE_ENV = 'test';

const async = require( 'async' );
const fs = require( 'fs' );
const mysql = require( 'mysql' );

const Files = require('@openagenda/files');

const {
  service: config,
  dependencies: dConfig
} = require( '../testconfig.sample.js' );
const svc = require( '../service/index.js' );

describe( 'agendas - functional (server): instanciate', function () {

  beforeAll( () => {

    svc.init( {
      ...config,
      Files: Files(dConfig.files)
    } );

  } );

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

  beforeEach( done => {

    fs.createReadStream( __dirname + '/files/rainfrog.jpg' )

      .pipe( fs.createWriteStream( __dirname + '/files/tmp.jpg' ) )

      .on( 'close', () => {

        done();

      } );

  } );


  it( '.getData - get public raw data', done => {

    svc.get( 4826, { instanciate: true, internal: true, private: true }, ( err, agenda ) => {

      expect( agenda.getData().id ).toBeUndefined();

      done();

    } );

  } );

  it( '.getData - get all raw data', done => {

    svc.get( 4826, { instanciate: true, internal: true, private: true }, ( err, agenda ) => {

      expect( agenda.getData( { internal: true } ).id ).toBe( 4826 );

      done();

    } );

  } );

  it( 'setImage - successful set saves image name in db', done => {

    let con = mysql.createConnection( config.mysql ),

      aId = 4922;

    async.series( [ wcb => {

      con.query( 'select * from agenda where id = ?', aId, ( err, rows ) => {

        expect( rows[ 0 ].image ).toBeNull();

        wcb();

      } );

    }, wcb => {

      svc.get( aId, { instanciate: true }, ( err, agenda ) => {

        svc.set( aId, { image: { path: __dirname + '/files/tmp.jpg' } }, wcb );

      } );

    }, wcb => {

      con.query( 'select * from agenda where id = ?', aId, ( err, rows ) => {

        expect( rows[ 0 ].image.split('?')[0] ).toBe( 'agenda' + rows[ 0 ].uid + '.jpg' );

        con.end();

        wcb();

      } );

    } ], done );

  } );


  it( 'getImage - default get is without path', done => {

    svc.get( 4820, { instanciate: true }, ( err, a ) => {

      expect(a.getImage().split('?')[0]).toBe( 'review_planning-intervenants_00.jpg' );

      done();

    } );

  } );


  it( 'getImage - get with true returns image name with path', done => {

    svc.get( 4820, { instanciate: true }, ( err, a ) => {

      expect(a.getImage( true )).toBe( '//openagendatst.s3.amazonaws.com/review_planning-intervenants_00.jpg' );

      done();

    } );

  } );

  it( 'getImage - no image returns null', done => {

    svc.get( 4832, { instanciate: true }, ( err, a ) => {

      expect( a.getImage() ).toBeNull();

      expect( a.getImage( true ) ).toBeNull();

      done();

    } );

  } );

  it( 'getImage - no image returns default path if config allows this', done => {

    svc.init( Object.assign( {}, config, { useDefaultImage: true, Files: Files(dConfig.files) } ) );

    svc.get( 4832, { instanciate: true }, ( err, a ) => {

      expect( a.getImage( false, true ) ).toBe( config.defaultImagePath );

      expect( a.getImage( true, true ) ).toBe( config.defaultImagePath );

      svc.init( {
        ...config,
        Files: Files(dConfig.files)
      } );

      done();

    } );

  } );

} );
