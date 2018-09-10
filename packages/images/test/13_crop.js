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

describe( 'images - unit (server): crop', function() {

  this.timeout( 20000 );

  var path, image, info;

  before( function( done ) {

    imageSvc.test._download( {url: imageSrc } ).done( function( values ) {

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


  it( 'crop in height', function( done ) {

    imageSvc.test._crop( { 
      image, 
      info, 
      format: { crop: true, width: 20, height: 200 }
    }).done( function( values ) {

      values.image.write( tmpTestFile, function( err ) {

        gm( tmpTestFile ).size( function( err, size ) {

          size.width.should.equal( 82 );
          size.height.should.equal( 821 );

          done();

        });


      } );


    });

  } );

  it( 'crop in width', function( done ) {

    imageSvc.test._crop( { 
      image: image, 
      info: info, 
      format: { crop: true, width: 1000, height: 200 }
    }).done( function( values ) {

      values.image.write( tmpTestFile, function( err ) {

        gm( tmpTestFile ).size( function( err, size ) {

          size.width.should.equal( 1200 );
          size.height.should.equal( 240 );

          done();

        });

      } );

    });

  } );

});
