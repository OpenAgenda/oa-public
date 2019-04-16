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


describe( 'images - unit (server): download', function() {

  beforeEach( () => {

    imageSvc.init( testconfig );

  } );

  afterEach( () => unlinkTestFiles( __dirname ) );

  this.timeout( 20000 );

  it( 'should send timeout error', function( done ) {

    imageSvc.init( _.extend( {}, testconfig, { timeout: 1 } ) );

    imageSvc.test._download( { url: imageSrc } ).done( null, function( err ) {

      err.should.equal( 'timeout' );

      done();

    });

  } );


  it( 'should send max size error', done => {

    imageSvc.init( _.extend( {}, testconfig, { maxSize: 1 } ) );

    imageSvc.test._download( { url: imageSrc } ).done( null, err => {

      err.should.eql( {
        code: 'image.toobig',
        max: 1,
        message: 'maximum size exceeded'
      } );

      done();

    });

  });

  it( 'should send error with wrong status code', done => {

    imageSvc.init( testconfig );

    imageSvc.test._download( {
      url: 'https://s3.eu-central-1.amazonaws.com/openagendatest/myevents.jpg'
    } ).done( null, err => {

      err.should.eql( {
        code: 'invalid.status',
        message: 'invalid status code',
        statusCode: 403
      } );

      done();

    } );

  } );


  it( 'should load image content', function( done ) {

    this.timeout( 10000 );

    imageSvc.test._download( { url: imageSrc } ).done( function( values ) {

      var stats = fs.statSync( values.path );

      stats.size.should.match(function(n) {
        return [ 260760, 270573 ].indexOf( n ) !== -1
      });

      fs.unlinkSync( values.path );

      done();

    });

  });

} );
