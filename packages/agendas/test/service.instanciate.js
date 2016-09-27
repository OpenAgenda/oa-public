"use strict";

const should = require( 'should' ),

svc = require( '../service/test' ),

config = require( '../testconfig' ),

mysql = require( 'mysql' ),

fs = require( 'fs' ),

async = require( 'async' );

describe( 'instantiate', function() {

  this.timeout( 30000 );

  before( () => {
    svc.init( config );
  } );

  beforeEach( svc.test.fixtures );

  beforeEach( done => {

    fs.createReadStream( __dirname + '/files/rainfrog.jpg' )

    .pipe( fs.createWriteStream( __dirname + '/files/tmp.jpg' ) )

    .on( 'close', () => {

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

        agenda.setImage( { path: __dirname + '/files/tmp.jpg' }, wcb );

      } );

    }, wcb => {

      con.query( 'select * from agenda where id = ?', aId, ( err, rows ) => {

        should( rows[ 0 ].image ).equal( 'agenda' + rows[ 0 ].uid + '.jpg' );

        con.end();

        wcb();

      } );

    } ], done );

  } );

  it( 'setImage - successful set gives list of image paths', done => {

    svc.get( 4922, { instanciate: true }, ( err, agenda ) => {

      agenda.setImage( { path: __dirname + '/files/tmp.jpg' }, ( err, result ) => {

        should( err ).equal( null );

        result.should.eql( [ 
          'https://openagendatst.s3.amazonaws.com/agenda93716628.jpg',
          'https://openagendatst.s3.amazonaws.com/rwtbagenda93716628.jpg',
          'https://openagendatst.s3.amazonaws.com/agenda93716628_o.jpg' 
        ] );

        done();

      } );

    } );

  } );

  it( 'clearImage - successful clear empties image field', done => {

    async.waterfall( [ wcb => {

      svc.get( 4922, { instanciate: true }, ( err, a ) => {

        wcb( null, a );

      } );

    }, ( agenda, wcb ) => {

      agenda.setImage( { path: __dirname + '/files/tmp.jpg' }, () => wcb( null, agenda ) );

    }, ( agenda, wcb ) => {

      agenda.clearImage( err => {

        should( err ).equal( null );

        wcb();

      } );

    }, wcb => {

      let con = mysql.createConnection( config.mysql );

      con.query( 'select image from agenda where id = ?', 4922, ( err, rows ) => {

        should( rows[ 0 ].image ).equal( null );

        con.end();

        wcb();

      } );

    } ], done );

  } );

  
  it( 'getImage - default get is without path', done => {

    svc.get( 4820, { instanciate: true }, ( err, a ) => {

      a.getImage().should.equal( 'review_planning-intervenants_00.jpg' );

      done();

    } );

  } );


  it( 'getImage - get with true returns image name with path', done => {

    svc.get( 4820, { instanciate: true }, ( err, a ) => {

      a.getImage( true ).should.equal( 'https://openagendatst.s3.amazonaws.com/review_planning-intervenants_00.jpg' );

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

} );