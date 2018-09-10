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


describe( 'images - unit (server): size', function() {

  let path, image;

  this.timeout( 20000 );

  before( () => imageSvc.init( testconfig ) );

  before( done => {

    imageSvc.test._download( { url: imageSrc } ).done( function( values ) {

      path = values.path;

      imageSvc.test._loadImageStream( { path: values.path } ).then( function( values ) {

        image = values.image;

        done();

      });

    } );

  });


  it( 'verify that image within size limit bounds passes check', function( done ) {

    imageSvc.test._checkSize( { 
      info: { filesize: '2000B' },
      image,
      sizeLimits: [ 2000, 10000000 ]
    }).then( function( values ) {

      'ok'.should.equal( 'ok' );

      done();

    }).catch( function( e ) {

      console.log( e );

      'image is caught'.should.not.equal( 'image is caught' );

      done();

    });

  });

  it( 'verify that image below size limit bounds fails check', function( done ) {

    imageSvc.test._checkSize( { 
      info: { filesize: '271000B' },
      image,
      sizeLimits: [ 300000, 10000000 ]
    }).then( function( values ) {

      'ok'.should.not.equal( 'ok' );

      done();

    }).catch( function( e ) {

      e.should.equal( 'image is too small: 271000' );

      done();

    });

  });

  it( 'verify that image above size limit bounds fails check', function( done ) {

    imageSvc.test._checkSize( { 
      info: { filesize: '271000B' },
      image,
      sizeLimits: [ 100000, 200000 ]
    }).then( function( values ) {

      'ok'.should.not.equal( 'ok' );

      done();

    }).catch( function( e ) {

      e.should.equal( 'image is too big: 271000' );

      done();

    });

  });


  after( function() {

    fs.unlinkSync( path );

  });

});
