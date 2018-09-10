"use strict";

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


describe( 'images - unit (server): resize', function() {

  this.timeout( 20000 );

  var path, image, info;

  before( () => imageSvc.init( testconfig ) );

  before( function( done ) {

    imageSvc.test._download( { url: imageSrc } ).done( function( values ) {

      path = values.path;

      done();

    } );

  });

  beforeEach( function( done ) {

    imageSvc.test._loadImageStream( { path } ).then( function( values ) {

      image = values.image;

      info = values.info;

      done();

    });

  });

  after( function() {

    fs.unlinkSync( path );

  });

  it( 'resize in a cinema canvas', function( done ) {

    this.timeout( 10000 );

    imageSvc.test._resize( { 
      image, 
      info,
      format: {
        width: 800,
        height: 450
      }
    } ).done( function( values ) {

      values.image.write( tmpTestFile, function( err ) {

        gm( tmpTestFile ).size( function( err, size ) {

          size.height.should.equal( 450 );

          done();

        });

      });

    });

  });

  it( 'resize in a portrait canvas', function( done ) {

    this.timeout( 10000 );

    imageSvc.test._resize( { 
      image, 
      info,
      format: {
        width: 450,
        height: 800
      }
    } ).done( function( values ) {

      values.image.write( tmpTestFile, function( err ) {

        gm( tmpTestFile ).size( function( err, size ) {

          size.width.should.equal( 450 );

          done();

        });

      });

    });

  });

} );
