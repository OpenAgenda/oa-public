"use strict";

process.env.NODE_ENV = 'test';

// require( 'debug' ).enable( 'services/file/s3' );

const svc = require( '../' ), s3Svc = svc.s3, fs = require( 'fs' ), filePath = __dirname + '/files/testfiletoupload.txt', filePath2 = __dirname + '/files/testfiletoupload2.txt', srcPath = __dirname + '/files/src1.txt', srcPath2 = __dirname + '/files/src2.txt', config = require( '../testconfig.js' );

svc.init( config );

describe( 'files - functional ( server ): s3.store', () => {

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

  it('should not exist', done => {

    s3Svc.exists( filePath.split('/').pop(), function( err, exists ) {

      expect(exists).toBe(false);

      done();

    });

  });

  it('should upload without trouble', done => {

    s3Svc.store( filePath, function( err, url ) {

      expect( err ).toBeNull();

      expect(url).toBe('https://cibultest.s3.eu-west-1.amazonaws.com/testfiletoupload.txt');

      s3Svc.exists( filePath.split('/').pop(), function( err, exists ) {

        expect(exists).toBe(true);

        done();

      } );

    });

  });

  it('should delete origin once stored', done => {

    s3Svc.store( filePath, function( err ) {

      fs.exists( filePath, function( localExists ) {

        expect(localExists).toBe(false);

        done();

      });

    });

  });

  it('should not delete origin once stored', done => {

    s3Svc.store( filePath, { clearOrigin: false }, function( err ) {

      fs.exists( filePath, function( localExists ) {

        expect(localExists).toBe(true);

        done();

      });

    });

  });

});
