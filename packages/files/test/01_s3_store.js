"use strict";

process.env.NODE_ENV = 'test';

// require( 'debug' ).enable( 'services/file/s3' );

const should = require( 'should' ),

svc = require( '../' ),

s3Svc = svc.s3,

fs = require( 'fs' ),

filePath = __dirname + '/files/testfiletoupload.txt',

filePath2 = __dirname + '/files/testfiletoupload2.txt',

srcPath = __dirname + '/files/src1.txt',

srcPath2 = __dirname + '/files/src2.txt',

config = require( '../testconfig.js' );

svc.init( config );

describe( 'files - functional ( server ): s3.store', function() {

  this.timeout( 30000 );

  beforeEach( function( done ) {

    fs.createReadStream( srcPath ).pipe( fs.createWriteStream( filePath ) );

    fs.createReadStream( srcPath2 ).pipe( fs.createWriteStream( filePath2 ) );

    done();

  });

  beforeEach( function( done ) {

    s3Svc.remove( [
      filePath.split('/').pop(),
      filePath2.split('/').pop()
    ], function( err ) {

      done();

    })

  });

  it( 'should not exist', function( done ) {

    s3Svc.exists( filePath.split('/').pop(), function( err, exists ) {

      exists.should.equal( false );

      done();

    });

  });

  it( 'should upload without trouble', function( done ) {

    s3Svc.store( filePath, function( err, url ) {

      should( err ).equal( null );

      url.should.equal( 'https://cibultest.s3.amazonaws.com/testfiletoupload.txt' );

      s3Svc.exists( filePath.split('/').pop(), function( err, exists ) {

        exists.should.equal( true );

        done();

      } );

    });

  } );

  it( 'should delete origin once stored', function( done ) {

    s3Svc.store( filePath, function( err ) {

      fs.exists( filePath, function( localExists ) {

        localExists.should.equal( false );

        done();

      });

    });

  } );

  it( 'should not delete origin once stored', function( done ) {

    s3Svc.store( filePath, { clearOrigin: false }, function( err ) {

      fs.exists( filePath, function( localExists ) {

        localExists.should.equal( true );

        done();

      });

    });

  } );

});