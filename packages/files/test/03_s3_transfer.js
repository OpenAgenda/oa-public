"use strict";

process.env.NODE_ENV = 'test';

// require( 'debug' ).enable( 'services/file/s3' );

var should = require( 'should' ),

svc = require( '../' ),

s3Svc = svc.s3,

fs = require( 'fs' ),

filePath = __dirname + '/files/testfiletoupload.txt',

filePath2 = __dirname + '/files/testfiletoupload2.txt',

srcPath = __dirname + '/files/src1.txt',

srcPath2 = __dirname + '/files/src2.txt',

config = require( '../testconfig.js' );

svc.init( config );

describe( 'files - functional ( server ): s3.transfer', function() {

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

  it( 'should transfer file from one bucket to the next', ( done ) => {

    s3Svc.store( filePath, ( err ) => {

      s3Svc.transfer( config.bucket, filePath.split('/').pop(), config.tmpBucket, filePath2.split('/').pop(), ( err ) => {

        s3Svc.exists( config.tmpBucketPath + filePath2.split('/').pop(), ( err, exists ) => {

          exists.should.equal( true );

          done();

        } );

      } );

    });

  } );

});