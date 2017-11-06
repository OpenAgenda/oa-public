"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );
const async = require( 'async' );
const fs = require( 'fs' );
const fakeImage = 'https://s3-eu-west-1.amazonaws.com/cibulstatic/notanimage.jpg';
const gm = require( 'gm' ).subClass( { imageMagick: true } );
const imageSrc = 'https://s3-eu-west-1.amazonaws.com/cibulstatic/Galaxie-ESO-137-001.jpg';
const imageSvc = require( '../' );
const should = require( 'should' );
const testconfig = require( '../testconfig.js' );
const tmpTestFile = '/var/tmp/testfile';

describe( 'images - unit (server): loadImageStream', function() {

  this.timeout( 20000 );

  var path, notImagePath;

  before( function( done ) {

    imageSvc.test._download( { url: imageSrc } ).done( function( values ) {

      path = values.path;

      done();

    } );

  });

  before( function( done ) {

    imageSvc.test._download( { url: fakeImage } ).done( function( values ) {

      notImagePath = values.path;

      done();

    });

  })

  after( function() {

    if ( path ) fs.unlinkSync( path );

  });

  it( 'load wrong image stream', function( done ) {

    this.timeout( 10000 );

    imageSvc.test._loadImageStream( { path: notImagePath } ).done( null, function( err ) {

      err.should.equal( 'invalid image' );

      done();

    });

  });

  it( 'load image stream succeeds', function( done ) {

    this.timeout( 10000 );

    imageSvc.test._loadImageStream( { path: path } ).done( function( values ) {

      values.info.Filesize.should.equal( '271KB' );

      done();

    });

  } );

});