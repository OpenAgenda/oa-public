# Overview

Handle uploaded images, resize, crop and do that to multiple destination formats if need be.

Run init of module before anything. Init inits module, so works for all subsequent requires.

# Use case

    var imageSvc = require( 'images' );

    imageSvc.init( { tmpPath: '/var/tmp' } ); // this is where images are picked and stored

    imageSvc.multi( {
      url: url
    }, [
      { name: name, format: { width: 600 } },
      { name: 'evf' + name },
      { name: 'evtb' + name, format: { width: 120, height: 160, crop: true } }
    ], function( err, imagePaths, infos ) {

     // do what you want here

     // infos gives size info on reformatted images

    } );
