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

describe( 'images - functional (server): main function', function() {

  this.timeout( 20000 );

  var files = [];

  before( () => imageSvc.init( testconfig ) );

  afterEach( function() {

    while( files.length ) {

      fs.unlinkSync( files.pop() );
      
    }

  });

  it( 'process single image from url', function( done ) {

    imageSvc( {
      url: imageSrc,
      name: 'testprocessedimage',
      format: {
        crop: true,
        width: 200,
        height: 200
      }
    }, function( err, resultPath ) {

      gm( resultPath ).size( function( err, size ) {

        size.width.should.equal( 200 );

        size.height.should.equal( 200 );

        files.push( resultPath );

        done();

      });

    });

  });


  it( 'process images from wobbly url', done => {

    imageSvc.multi( {
      url: 'http://admin-toulouse.cutm.nfrance.com/documents/10718111/10877026/Concert+d%27harmonie/699f1126-061d-4b4f-924b-52a83dfbf867?t=1521648413345'
    }, [ {
      name: 'url_orchestra_s.jpg',
      format: { width: 100 }
    }, {
      name: 'url_orchestra_o.jpg'
    } ], ( err, result ) => {

      files = files.concat( result );

      done();

    } );

  } );


  it( 'process image to multiple outputs from url', done => {

    var destOptions = [
      { name: 'processed1', format: { width: 300 } },
      { name: 'processed2', format: { crop: true, width: 200, height: 200 } }
    ];

    imageSvc.multi( {
      url: imageSrc
    }, destOptions, function( err, paths, infos ) {

      var destDatas = destOptions;

      infos.map( i => i.size ).forEach( ( size, i ) => {

        size.should.eql( [ { 
          width: 300, height: 206
        }, { 
          width: 200, height: 200
        } ][ i ] );

      } )

      for( var i in paths ) {

        destDatas[i].path = paths[ i ];

      }

      files = files.concat( paths );

      async.each( destDatas, function( destData, ecb ) {

        gm( destData.path ).size( function( err, size ) {

          size.width.should.equal( destData.format.width );

          if ( destData.format.height ) {

            size.height.should.equal( destData.format.height );

          }

          ecb();

        });

      }, function() {

        done();

      });

    });

  });

  it( 'process smallish image from url', function( done ) {

    imageSvc( {
      url: 'http://s3.eu-central-1.amazonaws.com/oastatic/testprocessedimage.jpg',
      //url: 'http://www.espace-sciences.org/sites/espace-sciences.org/files/images/evenements/festival-des-sciences/72-puceron-c-public-domain.jpg',
      name: 'testprocessedimage',
      format: {
        crop: true,
        width: 200,
        height: 200
      }
    }, ( err, resultPath ) => {

      should( err ).equal( null );
      
      resultPath.split( '/' ).pop().should.equal( 'testprocessedimage.jpg' );

      done();

    } );

  } );

} );
