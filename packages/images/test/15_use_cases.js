"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const should = require( 'should' );

const gm = require( 'gm' ).subClass( { imageMagick: true } );

const imageSvc = require( '../' );

const config = require( '../testconfig.js' );

describe( 'images - unit (server): use cases', function() {

  this.timeout( 40000 );

  before( () => imageSvc.init( config ) );

  before( done => {

    fs.createReadStream( __dirname + '/use_cases/schwab.png' )

      .pipe( fs.createWriteStream( __dirname + '/use_cases/tmp.png' ) )

      .on( 'close', () => done() );

  } );

  it( 'resize transparent png', done => {

    imageSvc( {
      preSave: true, // save in dest format before resizing and cropping. avoids crash issues. May cause others.
      path: __dirname + '/use_cases/tmp.png',
      name: 'testprocessedimage',
      format: {
        crop: true,
        width: 200,
        height: 180
      }
    }, function( err, resultPath ) {

      should( err ).equal( null );

      gm( resultPath ).size( function( err, size ) {

        size.height.should.equal( 180 );

        done();

      });

    } );

  });  

} );
