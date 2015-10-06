"use strict";

process.env.NODE_ENV = 'test';

// require( 'debug' ).enable( 'services/file/s3' );

var should = require( 'should' ),

s3Svc = require( '../s3' ),

fs = require( 'fs' ),

filePath = __dirname + '/testfiletoupload.txt',

filePath2 = __dirname + '/testfiletoupload2.txt',

srcPath = __dirname + '/src1.txt',

srcPath2 = __dirname + '/src2.txt',

config = require( '../../../config' );

describe( 's3 store', function() {

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

    s3Svc.store( filePath, function( err ) {

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

  it( 'should upload multiple without trouble', function( done ) {

    s3Svc.store( [ filePath, filePath2 ], function( err ) {

      s3Svc.exists( filePath.split('/').pop(), function( err, exists ) {

        exists.should.equal( true );

        s3Svc.exists( filePath2.split('/').pop(), function( err, exists ) {

          exists.should.equal( true );

          done();

        });

      });

    });

  } );

  it( 'should transfer file from one bucket to the next', ( done ) => {

    s3Svc.store( filePath, ( err ) => {

      s3Svc.transfer( config.aws.bucket, filePath.split('/').pop(), config.aws.tmpBucket, filePath2.split('/').pop(), ( err ) => {

        s3Svc.exists( config.aws.tmpBucketPath + filePath2.split('/').pop(), ( err, exists ) => {

          exists.should.equal( true );

          done();

        } );

      } );

    });

  } );

});