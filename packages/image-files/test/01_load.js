"use strict";

const fs = require( 'fs' );
const should = require( 'should' );

const config = require( '../testconfig' );

const images = require( '@openagenda/images' );
const files = require( '@openagenda/files' );

const svc = require( '../' );

describe( 'image-files - functional - load', function() {

  this.timeout( 20000 );

  const testImageUrl = 'https://s3.eu-central-1.amazonaws.com/openagendatest/rainfrog.jpg';

  before( () => {

    files.init( config.files );

    images.init( {
      tmpPath: config.files.tmpPath
    } );

    svc.init( {
      images, files
    } );

  } );

  beforeEach( done => {

    svc.clear( [
      'rainfrog_s.jpg',
      'rainfrog_o.jpg',
      'url_orchestra_s.jpg',
      'url_orchestra_o.jpg',
      'orchestra_s.jpg',
      'orchestra_o.jpg'
    ], done );

  } );

  it( 'loads image from url in s3 bucket after reformatting', done => {

    svc.load( {
      url: testImageUrl,
      formats: [ {
        name: 'rainfrog_s.jpg',
        format: {
          width: 50,
          height: 50,
          crop: true
        }
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

  it( 'loads bmp from url to s3 bucket', done => {

    svc.load( {
      url: 'http://admin-toulouse.cutm.nfrance.com/documents/10718111/10877026/Concert+d%27harmonie/699f1126-061d-4b4f-924b-52a83dfbf867?t=1521648413345',
      formats: [ {
        name: 'url_orchestra_s.jpg',
        format: { width: 100 }
      }, {
        name: 'url_orchestra_o.jpg'
      } ]
    }, ( err, result ) => {

      should( err ).equal( null );

      result.uploadedPaths.should.eql( [
        'https://openagendatst.s3.amazonaws.com/url_orchestra_s.jpg',
        'https://openagendatst.s3.amazonaws.com/url_orchestra_o.jpg'
      ] );

      done();

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
