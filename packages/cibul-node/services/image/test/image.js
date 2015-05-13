"use strict";

process.env.NODE_ENV = 'test';

//require( 'debug' ).enable( '*' );

var should = require( 'should' ),

imageSvc = require( '../image' ),

fs = require( 'fs' ),

async = require( 'async' ),

gm = require( 'gm' ).subClass( { imageMagick: true } ),

imageSrc = 'https://s3-eu-west-1.amazonaws.com/cibulstatic/Galaxie-ESO-137-001.jpg',

fakeImage = 'https://s3-eu-west-1.amazonaws.com/cibulstatic/notanimage.jpg',

tmpTestFile = '/var/tmp/testfile';

describe( 'image service - download', function() {

  this.timeout( 20000 );

  afterEach( function() {

    imageSvc.test._setConfig({
      requestTimeout: 10000,
      maxSize: 12000000
    });

  });


  it( 'should send timeout error', function( done ) {

    imageSvc.test._setConfig( { requestTimeout: 1 } );

    imageSvc.test._download( { url: imageSrc } ).done( null, function( err ) {

      err.should.equal( 'timeout' );

      done();

    });

  } );


  it( 'should send max size error', function( done ) {

    imageSvc.test._setConfig( { maxSize: 10 } );

    imageSvc.test._download( { url: imageSrc } ).done( null, function( err ) {

      err.should.equal( 'maximum size exceeded' );

      done();

    });

  });


  it( 'should load image content', function( done ) {

    this.timeout( 10000 );

    imageSvc.test._download( { url: imageSrc } ).done( function( values ) {

      var stats = fs.statSync( values.path );

      stats.size.should.match(function(n) {
        return [ 260760, 270573 ].indexOf( n ) !== -1
      });

      fs.unlinkSync( values.path );

      done();

    });

  });

} );


describe( 'image service - loading stream', function() {

  this.timeout( 20000 );

  var path, notImagePath;

  before( function( done ) {

    imageSvc.test._download( { url: imageSrc } ).done( function( values ) {

      path = values.path;

      done();

    } );

  });

  before( function( done ) {

    imageSvc.test._download( { url: fakeImage } ).done( function( values ) {

      notImagePath = values.path;

      done();

    });

  })

  after( function() {

    if ( path ) fs.unlinkSync( path );

  });

  it( 'load wrong image stream', function( done ) {

    this.timeout( 10000 );

    imageSvc.test._loadImageStream( { path: notImagePath } ).done( null, function( err ) {

      err.should.equal( 'invalid image' );

      done();

    });

  });

  it( 'load image stream succeeds', function( done ) {

    this.timeout( 10000 );

    imageSvc.test._loadImageStream( { path: path } ).done( function( values ) {

      values.info.Filesize.should.equal( '271KB' );

      done();

    });

  } );

});

describe( 'image service - check image size', function() {

  this.timeout( 20000 );

  var path, image;

  before( function( done ) {

    imageSvc.test._download( { url: imageSrc } ).done( function( values ) {

      path = values.path;

      imageSvc.test._loadImageStream( { path: values.path } ).done( function( values ) {

        image = values.image;

        done();

      });

    } );

  });


  it( 'verify that image within size limit bounds passes check', function( done ) {

    imageSvc.test._checkSize( { 
      image: image,
      sizeLimits: [ 2000, 10000000 ]
    }).then( function( values ) {

      'ok'.should.equal( 'ok' );

      done();

    }).catch( function( e ) {

      'image is caught'.should.not.equal( 'image is caught' );

      done();

    });

  });

  it( 'verify that image below size limit bounds fails check', function( done ) {

    imageSvc.test._checkSize( { 
      image: image,
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
      image: image,
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

describe( 'image service - crop', function() {

  this.timeout( 20000 );

  var path, image, info;

  before( function( done ) {

    imageSvc.test._download( { url: imageSrc } ).done( function( values ) {

      path = values.path;

      done();

    } );

  });

  beforeEach( function( done ) {

    imageSvc.test._loadImageStream( { path: path } ).done( function( values ) {

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
      image: image, 
      info: info, 
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

describe( 'image service - resize', function() {

  this.timeout( 20000 );

  var path, image, info;

  before( function( done ) {

    imageSvc.test._download( { url: imageSrc } ).done( function( values ) {

      path = values.path;

      done();

    } );

  });

  beforeEach( function( done ) {

    imageSvc.test._loadImageStream( { path: path } ).done( function( values ) {

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
      image: image, 
      info: info,
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
      image: image, 
      info: info,
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

describe( 'complete process', function() {

  this.timeout( 20000 );

  var files = [];

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

  it( 'process image to multiple outputs from url', function( done ) {

    var destOptions = [
      { name: 'processed1', format: { width: 300 } },
      { name: 'processed2', format: { crop: true, width: 200, height: 200 } }
    ];

    imageSvc.multi( {
      url: imageSrc
    }, destOptions, function( err, paths ) {

      var destDatas = destOptions;

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

} );