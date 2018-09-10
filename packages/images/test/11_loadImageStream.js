"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );
const async = require( 'async' );
const fs = require( 'fs' );
const should = require( 'should' );

const fakeImage = 'https://s3-eu-west-1.amazonaws.com/cibulstatic/notanimage.jpg';
const gm = require( 'gm' ).subClass( { imageMagick: true } );
const imageSrc = 'https://s3-eu-west-1.amazonaws.com/cibulstatic/Galaxie-ESO-137-001.jpg';
const imageSvc = require( '../' );
const testconfig = require( '../testconfig.js' );
const tmpTestFile = '/var/tmp/testfile';

const unlinkTestFiles = require( './helpers/unlinkTestFiles' );

describe( 'images - unit (server): loadImageStream', function() {

  this.timeout( 20000 );

  let path, notImagePath;

  before( () => imageSvc.init( testconfig ) );

  before( done => {

    imageSvc.test._download( { url: imageSrc } ).done( values => {

      path = values.path;

      done();

    } );

  });

  before( done => {

    imageSvc.test._download( { url: fakeImage } ).done( values => {

      notImagePath = values.path;

      done();

    });

  })

  after( () => unlinkTestFiles( __dirname ) );

  it( 'load wrong image stream', async () => {

    try {

      await imageSvc.test._loadImageStream( { path: notImagePath } );

    } catch ( err ) {

      err.should.equal( 'invalid image' );

    }

  } );

  it( 'load image stream succeeds', async () => {

    const values = await imageSvc.test._loadImageStream( { path } );

    values.info.filesize.should.equal( '270573B' );

  } );

});
