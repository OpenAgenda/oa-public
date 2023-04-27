"use strict";

const filterTimings = require( './filterTimings' );

var model = require( '../../model' ),

state = require( './state' ),

ics = require( './ics' ),

utils = require( '../../../lib/utils' ),

config = require( '../../../config' ),

exportable = require( './exportable' ),

range = require( '@openagenda/date-range' );

const getTimings = require('../lib/getTimings');
const getClosestDate = require('../lib/getClosestDate');
const extractAttendanceMode = require('../lib/extractAttendanceMode');
module.exports = instanciate;

function instanciate( data ) {

  var instance = model.events().instance( data ),

  svcInstance = utils.extend( {}, instance, {
    getImage: _imageGetter( 'getImage' ),
    getThumbnail: _imageGetter( 'getThumbnail' ),
    getFullImage: _imageGetter( 'getFullImage' ),
    transferOwnership: transferOwnership,
    getRange,
    getClosestDate: getClosestDate.bind(null, instance),
    getIcs
  });

  Object.assign(svcInstance, extractAttendanceMode(data));

  state( svcInstance, instance, [
    'setState',
    'getState',
    'setOnStateChange'
  ] );

  exportable( svcInstance, instance, [
    'exportable'
  ] );

  return svcInstance;

  function transferOwnership( userId, cb ) {

    instance.save( { ownerId: userId }, cb );

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

    let timezone = instance.getLocationDetails()?.timezone || 'Europe/Paris',

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
