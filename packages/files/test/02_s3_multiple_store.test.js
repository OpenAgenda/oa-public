"use strict";

process.env.NODE_ENV = 'test';

// require( 'debug' ).enable( 'services/file/s3' );

const svc = require( '../' );
const s3Svc = svc.s3;
const fs = require( 'fs' );
const filePath = __dirname + '/files/testfiletoupload.txt';
const filePath2 = __dirname + '/files/testfiletoupload2.txt';
const srcPath = __dirname + '/files/src1.txt';
const srcPath2 = __dirname + '/files/src2.txt';
const config = require( '../testconfig.js' );

svc.init( config );

describe( 'files - functional ( server ): s3.store multiple files', () => {

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

  it('uploads multiple files', done => {

    s3Svc.store( [ filePath, filePath2 ], function( err ) {

      s3Svc.exists( filePath.split('/').pop(), function( err, exists ) {

        expect(exists).toBe(true);

        s3Svc.exists( filePath2.split('/').pop(), function( err, exists ) {

          expect(exists).toBe(true);

          done();

        });

      });

    });

  });

});
