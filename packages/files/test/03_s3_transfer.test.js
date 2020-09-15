"use strict";

process.env.NODE_ENV = 'test';

// require( 'debug' ).enable( 'services/file/s3' );

var svc = require( '../' ), s3Svc = svc.s3, fs = require( 'fs' ), filePath = __dirname + '/files/testfiletoupload.txt', filePath2 = __dirname + '/files/testfiletoupload2.txt', srcPath = __dirname + '/files/src1.txt', srcPath2 = __dirname + '/files/src2.txt', config = require( '../testconfig.js' );

svc.init( config );

describe( 'files - functional ( server ): s3.transfer', () => {

  jest.setTimeout( 30000 );

  beforeEach(done => {

    fs.createReadStream( srcPath ).pipe( fs.createWriteStream( filePath ) );

    fs.createReadStream( srcPath2 ).pipe( fs.createWriteStream( filePath2 ) );

    done();

  });

  beforeEach(done => {

    s3Svc.remove( [
      filePath.split('/').pop(),
      filePath2.split('/').pop()
    ], function( err ) {

      done();

    })

  });

  it('should transfer file from one bucket to the next', ( done ) => {

    s3Svc.store( filePath, ( err ) => {

      s3Svc.transfer( config.bucket, filePath.split('/').pop(), config.tmpBucket, filePath2.split('/').pop(), ( err ) => {

        s3Svc.exists( config.tmpBucketPath + filePath2.split('/').pop(), ( err, exists ) => {

          expect(exists).toBe(true);

          done();

        } );

      } );

    });

  });

});
