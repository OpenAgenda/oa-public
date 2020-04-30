"use strict";

process.env.NODE_ENV = 'test';

const async = require( 'async' );
const fs = require( 'fs' );
const should = require( 'should' );

const files = require( '@openagenda/files' );
const fixtures = require( './fixtures' );
const images = require( '@openagenda/images' );

const config = require( '../testconfig' );
const inst = require( '../lib/instanciate' );
const svc = require( '../' );


describe( 'agenda location instanciate', function() {

  describe( 'image handlings - unit', function() {

    this.timeout( 20000 );

    var srcFilePath = __dirname + '/tmp/srcfile';

    before( () => {

      images.init( {
        tmpPath: config.tmpFolderPath
      });

    });

    before( () => {

      files.init( {
        bucket: config.files.bucket,
        accessKeyId: config.files.accessKeyId, // required
        secretAccessKey: config.files.secretAccessKey, // required too
      } );

    } );

    beforeEach( done => _copy( __dirname + '/tmp/creep.jpg', srcFilePath, done ) );

    beforeEach( done => {

      files.s3.remove( [
        'location123new.jpg',
        'location123new_o.jpg',
        'location123new_sm.jpg'
      ], () => done() );

    } );

    it( '_setNewLocationImage', done => {

      inst.test._setNewLocationImage( {
        path: srcFilePath,
        userUid: '123'
      }, ( err, url ) => {

        should( err ).equal( null );

        url.should.equal( 'https://openagendatst.s3.eu-west-1.amazonaws.com/location123new.jpg' );

        async.eachSeries( [
          'location123new.jpg',
          'location123new_o.jpg',
          'location123new_sm.jpg'
        ], ( expectedName, ecb ) => {

          files.s3.exists( expectedName, ( err, exists ) => {

            exists.should.equal( true );

            ecb();

          } );

        }, () => done() );

      } );

    } );

    inst( '_setLocationImage', done => {

      inst.test._setLocationImage( {
        path: srcFilePath,
        uid: '123'
      }, ( err, url ) => {

        should( err ).equal( null );

        url.should.equal( 'https://openagendatst.s3.eu-west-1.amazonaws.com/location123.jpg' );

        async.eachSeries( [
          'location123.jpg',
          'location123_o.jpg',
          'location123_sm.jpg'
        ], ( expectedName, ecb ) => {

          files.s3.exists( expectedName, ( err, exists ) => {

            exists.should.equal( true );

            ecb();

          } );

        }, () => done() );

      } );

    } );

    it( '_setLocationImage from url', done => {

      inst.test._setLocationImage( {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/02/Nacktmull.jpg/1280px-Nacktmull.jpg',
        uid: '123'
      }, ( err, url ) => {

        should( err ).equal( null );

        url.should.equal( 'https://openagendatst.s3.eu-west-1.amazonaws.com/location123.jpg' );

        async.eachSeries( [
          'location123.jpg',
          'location123_o.jpg',
          'location123_sm.jpg'
        ], ( expectedName, ecb ) => {

          files.s3.exists( expectedName, ( err, exists ) => {

            exists.should.equal( true );

            ecb();

          } );

        }, () => done() );

      } );

    } );

    it( '_removeNewLocationImage', done => {

      inst.test._setNewLocationImage( {
        path: srcFilePath,
        userUid: '123'
      }, err => {

        inst.test._removeNewLocationImage( {
          userUid: '123'
        }, err => {

          should( err ).equal( null );

          async.eachSeries( [
            'location123new.jpg',
            'location123new_o.jpg',
            'location123new_sm.jpg'
          ], ( expectedName, ecb ) => {

            files.s3.exists( expectedName, ( err, exists ) => {

              exists.should.equal( false );

              ecb();

            } );

          }, () => done() );

        } );

      } );

    } );

    it( '_removeNewLocationImage', done => {

      inst.test._setLocationImage( {
        path: srcFilePath,
        uid: '123'
      }, ( err ) => {

        inst.test._removeLocationImage( {
          uid: '123'
        }, err => {

          should( err ).equal( null );

          async.eachSeries( [
            'location123.jpg',
            'location123_o.jpg',
            'location123_sm.jpg'
          ], ( expectedName, ecb ) => {

            files.s3.exists( expectedName, ( err, exists ) => {

              exists.should.equal( false );

              ecb();

            } );

          }, () => done() );

        } );

      } );

    } );

  } );

  describe( 'image handlers', function() {

    this.timeout( 20000 );

    var location, srcFilePath = __dirname + '/tmp/srcfile.jpg';

    before( done => fixtures( 123, done ) );

    before( done => svc.init( config, done ) );

    before( done => svc.rebuild( done ) );

    beforeEach( done => _copy( __dirname + '/tmp/creep.jpg', srcFilePath, done ) );

    before( done => {

      svc.list( {}, 0, 1, ( err, locations, total ) => {

        svc.get( { uid: locations[ 0 ].uid }, ( err, instance ) => {

          location = instance;

          done();

        } );

      } );

    } );

    it( 'setImage - updates object', done => {

      location.setImage( {
        path: srcFilePath
      }, ( err, url ) => {

        should( err ).equal( null );

        url.should.equal( 'https://openagendatst.s3.eu-west-1.amazonaws.com/location' + location.uid + '.jpg' );

        should( err ).equal( null );

        svc.get( { uid: location.uid }, ( err, location ) => {

          location.image.should.equal( 'location' + location.uid + '.jpg' );

          done();

        } );

      } );

    } );

    it( 'setImage - uploads image', done => {

      location.setImage( {
        path: srcFilePath
      }, ( err ) => {

        files.s3.exists( 'location' + location.uid + '.jpg', ( err, exists ) => {

          should( exists ).equal( true );

          done();

        } );

      } );

    } );

    it( 'clearImage - updates the object', done => {

      location.setImage( {
        path: srcFilePath
      }, err => {

        location.clearImage( err => {

          svc.get( { uid: location.uid }, ( err, location ) => {

          should( location.image ).equal( null );

          done();

        } );

        } );

      } );

    } );

    it( 'clearImage - removes image from store', done => {

      location.setImage( {
        path: srcFilePath
      }, ( err ) => {

        location.clearImage( ( err ) => {

          files.s3.exists( 'location' + location.uid + '.jpg', ( err, exists ) => {

            should( exists ).equal( false );

            done();

          } );

        } );

      } );

    } );

  } );

} );





function _copy( srcPath, dstPath, done ) {

  let testFile = fs.createReadStream( srcPath ),

  srcFile = fs.createWriteStream( dstPath );

  testFile.pipe( srcFile );

  testFile.on( 'end', () => done() );

}
