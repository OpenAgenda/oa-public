"use strict";

const _ = require( 'lodash' );
const moment = require( 'moment-timezone' );
const ih = require( 'immutability-helper' );
const validateLink = require( '@openagenda/validators/link' )( { optional: false } );

/**
 * Event service follows a deep schema that form-schema cannot emulate.
 * In particular, image information is stored in an image key in the event service event
 * whereas it is dispatched at the root of the object for the form schema event
 *
 * These functions allow parsing from one format to the other
 */

module.exports = {
  fromEventServiceFormat,
  toEventServiceFormat
}


function fromEventServiceFormat( eventServiceEvent, options = {} ) {

  const { location } = _.assign( {
    location: null
  }, options );

  if ( !eventServiceEvent ) return {};

  const update = {
    image: { $unset: [ 'credits' ] },
    $unset: [ 'locationUid' ]
  };

  if ( _.get( eventServiceEvent, 'image.credits' ) ) {

    update[ 'imageCredits' ] = { $set: _.get( eventServiceEvent, 'image.credits' ) };

  }

  if ( _.get( eventServiceEvent, 'image.url' ) ) {

    update[ 'image' ] = { $set: {
      url: _.get( eventServiceEvent, 'image.url' )
    } };

  } else if ( !_.get( eventServiceEvent, 'image.filename' ) ) {

    update[ 'image' ] = { $set: null };

  }

  const timezone = eventServiceEvent.timezone || _.get( location, 'timezone' ) || 'Europe/Paris';

  // expliciting the timezone is important as it is then
  // used to convert back un-timezoned timings to event service format
  if ( eventServiceEvent.locationUid ) {

    update.location = { $set: {
      uid: eventServiceEvent.locationUid,
      timezone
    } };

  }

  update.timings = {
    $set: _.get( eventServiceEvent, 'timings', [] ).map( t => ( {
      begin: _transformTimingToFormSchema( t.begin, timezone ),
      end: _transformTimingToFormSchema( t.end, timezone )
    } ) )
  };

  return ih( eventServiceEvent, update );

}

function toEventServiceFormat( formSchemaEvent, files = {}, rawData = null ) {

  if ( !formSchemaEvent ) return null;

  const update = {
    '$unset': [ 'imageCredits', 'locationUid' ]
  };


  // new image is loaded
  if ( _.get( rawData, 'image.path' ) ) {

    update.image = {
      $set: {
        path: _.get( rawData, 'image.path' ),
        credits: _.get( formSchemaEvent, 'imageCredits' )
      }
    };

  } else if ( _isURL( _.get( rawData, 'image.url' ) ) ) {

    update.image = {
      $set: {
        url: _.get( rawData, 'image.url' ),
        credits: _.get( formSchemaEvent, 'imageCredits' )
      }
    };

  // image has been removed
  } else if ( !formSchemaEvent.image ) {

    update[ '$unset' ].push( 'image' );

  // image is maintained
  } else {

    update.image = {
      credits: { $set: _.get( formSchemaEvent, 'imageCredits' ) },
      variants: { $set: _.get( rawData, 'image.variants' ) },
      size: { $set: _.get( rawData, 'image.size' ) }
    };

  }

  update.locationUid = { $set: _.get( formSchemaEvent, 'location.uid' ) };

  const timezone = _.get( formSchemaEvent, 'timezone' ) || _.get( formSchemaEvent, 'location.timezone' ) || 'Europe/Paris';

  update.timezone = {
    $set: timezone
  };

  update.timings = {
    $set: _.get( formSchemaEvent, 'timings', [] ).map( t => ( {
      begin: _transformFormSchemaTimingsToService( t.begin, timezone ),
      end: _transformFormSchemaTimingsToService( t.end, timezone )
    } ) )
  }

  return ih( formSchemaEvent, update );

}


function _transformFormSchemaTimingsToService( t, timezone ) {

  return moment.tz(
    t.date + ' ' + _fZ( t.hours ) + ':' + _fZ( t.minutes ),
    timezone
  ).format();

}

function _fZ( n ) {

  return ( ( n + '' ).length === 1 ? '0' : '' ) + n;

}


/**
 * timings is set as entered by the user in the timezone of the browser
 * yet those timings should apply for timezone of the location rather.
 *
 * This function transforms the timings
 */
function _transformTimingToFormSchema( d, timezone ) {

  const tz = moment( d ).tz( timezone );

  return {
    date: tz.format( 'YYYY-MM-DD' ),
    hours: tz.format( 'HH' ),
    minutes: tz.format( 'mm' )
  }

}


function _isURL( value ) {

  try {

    validateLink( value );

    return true;

  } catch ( e ) {}

  return false;

}
