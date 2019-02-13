"use strict";

process.env.NODE_ENV = 'test';

// require( 'debug' ).enable( 'services/file/s3' );

const _ = require( 'lodash' );
const config = require( '../testconfig.js' );
const fs = require( 'fs' );
const prefixList = require( '../s3/prefixList' );
const should = require( 'should' );
const svc = require( '../' );

const filePath = __dirname + '/files/testfiletoupload.txt';
const filePath2 = __dirname + '/files/testfiletoupload2.txt';
const srcPath = __dirname + '/files/src1.txt';
const srcPath2 = __dirname + '/files/src2.txt';

describe( 'files - unit ( server ): s3/prefixList', function() {

  this.timeout( 30000 );

  svc.init( config );

  // copy test files ( they are removed when stored on s3 by default )
  before( done => {

    fs.createReadStream( srcPath ).pipe( fs.createWriteStream( filePath ) );

    fs.createReadStream( srcPath2 ).pipe( fs.createWriteStream( filePath2 ) );

    done();

  } );

  // store test files on s3
  before( done => svc.s3.store( [ filePath, filePath2 ], done ) );

  after( done => {

    svc.s3.remove( [
      filePath.split('/').pop(),
      filePath2.split('/').pop()
    ], done );

  });

  it( 'prefixList lists files by their given prefix', () => {

    return prefixList( _.pick( config, [ 'accessKeyId', 'secretAccessKey', 'bucket' ] ), 'testfiletoupload' ).then( filenames => {

      filenames.should.eql( [ 'testfiletoupload.txt', 'testfiletoupload2.txt' ] );

    } );

  } );

});