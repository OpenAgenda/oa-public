"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' ),

config = require( '../testconfig' ),

svc = require( '../' ),

fs = require( 'fs' );

describe( 'image-files - load', function() {

  this.timeout( 10000 );

  let testImageUrl = 'https://s3.eu-central-1.amazonaws.com/openagendatest/rainfrog.jpg';

  before( () => {

    svc.init( config );

  } );

  beforeEach( done => {

    svc.clear( [
      'rainfrog_s.jpg',
      'rainfrog_o.jpg'
    ], done );

  } );

  it( 'loads image from url in s3 bucket after reformatting', done => {

    svc.load( {
      url: testImageUrl,
      formats: [ {
        name: 'rainfrog_s.jpg',
        format: { width: 50, height: 50, crop: true }
      }, {
        name: 'rainfrog_o.jpg'
      } ]
    }, ( err, result ) => {

      result.uploadedPaths.should.eql( [
        'https://openagendatst.s3.amazonaws.com/rainfrog_s.jpg',
        'https://openagendatst.s3.amazonaws.com/rainfrog_o.jpg'
      ] );

      done();

    } );

  } );

  it( 'previous operation as a promise', async () => {

    const result = await svc.load( {
      url: testImageUrl,
      formats: [ {
        name: 'rainfrog_s.jpg',
        format: { width: 50, height: 50, crop: true }
      }, {
        name: 'rainfrog_o.jpg'
      } ]
    } );

    result.uploadedPaths.should.eql( [
      'https://openagendatst.s3.amazonaws.com/rainfrog_s.jpg',
      'https://openagendatst.s3.amazonaws.com/rainfrog_o.jpg'
    ] );

  } );


  it( 'include created image sizes in result', async () => {

    const result = await svc.load( {
      url: testImageUrl,
      formats: [ {
        name: 'rainfrog_s.jpg',
        format: { width: 250 }
      }, {
        name: 'rainfrog_o.jpg',
        format: { width: 20 }
      } ]
    } );

    result.infos.forEach( ( info, i ) => {

      info.size.should.eql( [ {
        width: 250, height: 144
      }, {
        width: 20, height: 12
      } ][ i ] );

    } );

  } );


  it( 'loads bmp from path to s3 bucket', done => {

    fs.createReadStream( __dirname + '/files/orchestra.bmp' )

    .pipe( fs.createWriteStream( __dirname + '/files/tmp.bmp' ) )

    .on( 'close', () => {

      svc.load( {
        path: __dirname + '/files/tmp.bmp',
        formats: [ {
          name: 'orchestra_s.jpg',
          format: { width: 100 }
        }, {
          name: 'orchestra_o.jpg'
        } ]
      }, ( err, result ) => {

        should( err ).equal( null );

        result.uploadedPaths.should.eql( [
          'https://openagendatst.s3.amazonaws.com/orchestra_s.jpg',
          'https://openagendatst.s3.amazonaws.com/orchestra_o.jpg'
        ] );

        done();

      } );

    } );

  } );


  it( 'loads image from path in s3 bucket', done => {

    fs.createReadStream( __dirname + '/files/rainfrog.png' )

    .pipe( fs.createWriteStream( __dirname + '/files/tmp.png' ) )

    .on( 'close', () => {

      svc.load( {
        path: __dirname + '/files/tmp.png',
        formats: [ {
          name: 'rainfrog_s.jpg',
          format: { width: 100 }
        }, {
          name: 'rainfrog_o.jpg'
        } ]
      }, ( err, result ) => {

        should( err ).equal( null );

        result.uploadedPaths.should.eql( [
          'https://openagendatst.s3.amazonaws.com/rainfrog_s.jpg',
          'https://openagendatst.s3.amazonaws.com/rainfrog_o.jpg'
        ] );

        done();

      } );

    } );

  } );

} );