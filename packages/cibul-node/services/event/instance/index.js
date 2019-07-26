"use strict";

const filterTimings = require( './filterTimings' );

var model = require( '../../model' ),

state = require( './state' ),

ics = require( './ics' ),

custom = require( './custom' ),

dispatcher = require( './dispatcher' ),

utils = require( '../../../lib/utils' ),

config = require( '../../../config' ),

imageSvc = require( '@openagenda/images' ),

moment = require( 'moment-timezone' ),

s3Svc = require( '@openagenda/files' ).s3,

fileSvc = require( '@openagenda/files' ).file,

exportable = require( './exportable' ),

onRefresh, // used for testing

range = require( '@openagenda/date-range' );

module.exports = instanciate;

module.exports.test = {
  setOnRefresh
}

function instanciate( data ) {

  var instance = model.events().instance( data ),

  svcInstance = utils.extend( {}, instance, {
    setImage: setImage,
    getImage: _imageGetter( 'getImage' ),
    getThumbnail: _imageGetter( 'getThumbnail' ),
    getFullImage: _imageGetter( 'getFullImage' ),
    transferOwnership: transferOwnership,
    refresh: refresh,
    getRange: getRange,
    getIcs
  }),

  dsp = dispatcher( svcInstance, instance );

  state( svcInstance, instance, [
    'setState',
    'getState',
    'setOnStateChange'
  ] );

  custom( svcInstance, instance, [
    'loadAgendaCustomContext', // load agenda context
    'setCustomFile',          // process custom image upload
    'unsetCustomFile',        // take a wild guess
    'evaluateCustomImageDuplication'
  ] );

  exportable( svcInstance, instance, [
    'exportable'
  ] );

  svcInstance.setOnStateChange( dsp.stateChange );

  instance.onSave = svcInstance.onSave = dsp.onSave;

  return svcInstance;

  // assuming for now that input is url
  function setImage( url, cb ) {

    // assuming event is created
    var name = 'event' + instance.uid;

    imageSvc.multi( {
      url: url
    }, [
      { name: name, format: { width: 600 } },
      { name: 'evf' + name },
      { name: 'evtb' + name, format: { width: 240, height: 320, crop: true } }
    ], function( err, imagePaths ) {

      if ( err ) return cb( err );

      s3Svc.store( imagePaths, function( err ) {

        if ( err ) return cb( err );

        if ( instance.getImage() === name + '.jpg' ) {

          return cb();

        }

        instance.setImage( name + '.jpg', function( err ) {

          if ( err ) return cb( err );

          instance.save( { image: name + '.jpg' }, cb );

        } );

      });

    } );

  }


  function transferOwnership( userId, cb ) {

    instance.save( { ownerId: userId }, cb );

  }

  function refresh( cb ) {

    if ( onRefresh ) onRefresh( parseInt( instance.id ) );

    instance.save( { updatedAt: new Date() }, err => {

      if ( err ) {

        log( 'error', 'could not clear timestamp of event %s', event.uid );

      } else {

        dsp.onRefresh();

      }

      if ( cb ) return cb( err );

    } );

  }


  function getIcs( agenda, lang, decorate, timingIndex ) {

    if ( timingIndex === undefined ) timingIndex = -1;

    return ( decorate ? ics.head( agenda ) + '\n' : '' )
    + ics( agenda, data, instance, lang, timingIndex )
    + ( decorate ? '\nEND:VCALENDAR' : '' );

  }


  function getRange( language, filter ) {

    if ( !language ) {

      language = instance.getCurrentLanguage();

    }

    let timezone = instance.getLocationDetails().timezone,

    timings = instance.getTimings();

    if ( filter && ( filter.from || filter.to ) ) {

      timings = filterTimings( timings, filter, timezone );

    }

    return range( timings.map( t => ( {
      start: new Date( t.start ),
      end: new Date( t.end )
    } ) ), language, timezone );

  }


  function _imageGetter( method ) {

    return function() {

      var image = instance[ method ]();

      if ( !image ) return image;

      return config.aws.imageBucketPath + image;

    }

  }

}


function setOnRefresh( cb ) {

  onRefresh = cb;

}
