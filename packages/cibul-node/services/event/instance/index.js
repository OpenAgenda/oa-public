"use strict";

const filterTimings = require( './filterTimings' );

var model = require( '../../model' ),

state = require( './state' ),

ics = require( './ics' ),

dispatcher = require( './dispatcher' ),

utils = require( '../../../lib/utils' ),

config = require( '../../../config' ),

exportable = require( './exportable' ),

onRefresh, // used for testing

range = require( '@openagenda/date-range' );

const getTimings = require('../lib/getTimings');

module.exports = instanciate;

module.exports.test = {
  setOnRefresh
}

function instanciate( data ) {

  var instance = model.events().instance( data ),

  svcInstance = utils.extend( {}, instance, {
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

  exportable( svcInstance, instance, [
    'exportable'
  ] );

  svcInstance.setOnStateChange( dsp.stateChange );

  instance.onSave = svcInstance.onSave = dsp.onSave;

  return svcInstance;

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

    timings = getTimings(instance);

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
