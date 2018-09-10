"use strict";

process.env.DEBUG = '*';

const fs = require( 'fs' );
const should = require( 'should' );

const config = require( '../testconfig' );

const svc = require( '../' );

describe( 'image-files - functional: use cases', function() {

  this.timeout( 20000 );

  before( () => {

    svc.init( config );

  } );

  it( 'processes transparent background png', done => {

    // copy the file
    fs.createReadStream( __dirname + '/files/schwab.png' )

      .pipe( fs.createWriteStream( __dirname + '/files/tmp.png' ) )

      .on( 'close', () => {

        svc.load( {
          preSave: true,
          path: __dirname + '/files/tmp.png',
          formats: [ {
            name: 'shchab.jpg',
            format: { width: 100 }
          }, {
            name: 'shchab_o.jpg'
          } ]
        }, ( err, result ) => {

          result.should.eql( {
            "uploadedPaths": [
              "https://openagendatst.s3.amazonaws.com/shchab.jpg",
              "https://openagendatst.s3.amazonaws.com/shchab_o.jpg"
            ],
            "infos": [
              {
                "size": {
                  "width": 100,
                  "height": 100
                },
                "filesize": "644558B"
              },
              {
                "size": {
                  "width": 11220,
                  "height": 11220
                },
                "filesize": "644558B"
              }
            ]
          } );

          done();

      } );

    } );

  } );

} );
