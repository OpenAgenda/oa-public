"use strict";

process.env.NODE_ENV = 'test';

// require( 'debug' ).enable( 'services/file/s3' );

const _ = require( 'lodash' );
const config = require( '../testconfig.js' );
const fs = require( 'fs' );
const prefixList = require( '../s3/prefixList' );
const svc = require( '../' );

const filePath = __dirname + '/files/testfiletoupload.txt';
const filePath2 = __dirname + '/files/testfiletoupload2.txt';
const srcPath = __dirname + '/files/src1.txt';
const srcPath2 = __dirname + '/files/src2.txt';

describe( 'files - functional ( server ): s3.generateUniquePrefix', () => {

  jest.setTimeout( 30000 );

  svc.init( config );

  // copy test files ( they are removed when stored on s3 by default )
  beforeAll(done => {

    fs.createReadStream( srcPath ).pipe( fs.createWriteStream( filePath ) );

    fs.createReadStream( srcPath2 ).pipe( fs.createWriteStream( filePath2 ) );

    done();

  });

  // store test files on s3
  beforeAll(done => svc.s3.store( [ filePath, filePath2 ], done ));

  afterAll(done => {

    svc.s3.remove( [
      filePath.split('/').pop(),
      filePath2.split('/').pop()
    ], done );

  });

  it('generateUniquePrefix generates a prefix unused in s3 bucket', () => {

    return svc.s3.generateUniquePrefix().then( prefix => {

      return prefixList( config, prefix ).then( filenames => {

        expect(filenames.length).toBe(0);

      } );

    } );

  });

});
