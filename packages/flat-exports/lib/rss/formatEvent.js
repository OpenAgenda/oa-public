"use strict";

const _ = require( 'lodash' );
const moment = require( 'moment' );
const schema = require( '@openagenda/validators/schema' );
const cleanString = require( '@openagenda/utils' ).cleanString;

schema.register( {
  text: require( '@openagenda/validators/text' ),
  pass: require( '@openagenda/validators/pass' )
} );

module.exports = ( event, options = {} ) => {

  const cleanOptions = validateOptions( options );
  const lang = _pickLanguage( event, cleanOptions.lang );

  return _.extend( {
    title: _.get( event, 'title.' + lang, '' ),
    description: _formatDescription( 
      _.get( event.description, lang, '' ),
      _.get( event.dateRange, lang, event.dateRange.fr ),
      _.get( event.html, lang, '' )
    ),
    url: cleanOptions.genUrl( event ),
    guid: [
      _.get( event, 'agenda.uid', null ),
      event.uid
    ].filter( v => !!v ).join( '/' ),
    date: event.updatedAt,
    lat: _.get( event, 'location.latitude', null ),
    long: _.get( event, 'location.longitude', null ),
    custom_elements: [ {
      'ev:startdate' : moment( _.first( event.timings ).begin ).format( 'YYYY-MM-DDTHH:mm:ss' )
    }, {
      'ev:enddate' : moment( _.last( event.timings ).end ).format( 'YYYY-MM-DDTHH:mm:ss' )
    }, {
      'ev:location' : [ _.get( event, 'location.name' ), _.get( event, 'location.address' ) ].filter( v => v ).join( ' - ' )
    } ]
  }, event.image ? {
    enclosure: {
      url: ( event.image.base + event.image.filename ).replace( 'https://', 'http://' ),
      type: 'image/jpeg'
    }
  } : {} );

}

const validateOptions = schema( {
  lang: {
    type: 'text',
    default: 'fr'
  },
  genUrl: {
    type: 'pass',
    default: data => `https://openagenda.com/events/${data.uid}`
  }
} );

function _pickLanguage( event, lang ) {

  if ( event.title[ lang ] ) return lang;

  return Object.keys( event.title )[ 0 ];

}

function _formatDescription( description, dateRange, html = '' ) {

  return `<p>${description}</p><p>${dateRange}</p>${cleanString( html )}`;

}


/*
 let item = {
        title: eInst.getTitle(),
        description: _buildRssDescription( eInst, exp, req.lang ),
        url: req.genUrl( 'agendaEventShow', { slug: req.agenda.slug, eventSlug: eInst.slug, lang: req.lang }, { abs: true } ),
        guid: req.agenda.uid + '/' + eInst.uid,
        date: eInst.createdAt,
        lat: exp.latitude,
        long: exp.longitude,
        custom_elements: [ {
          'ev:startdate' : moment.tz( exp.timings[ 0 ].start, exp.location.timezone ).format( 'YYYY-MM-DDTHH:mm:ss' )
        }, {
          'ev:enddate' : moment.tz( exp.timings[ exp.timings.length - 1 ].end, exp.location.timezone ).format( 'YYYY-MM-DDTHH:mm:ss' )
        }, {
          'ev:location' : exp.location.name + ' - ' + exp.location.address
        } ]
      }

      if ( exp.image ) {

        item.enclosure = {
          url: exp.image,
          type: 'image/jpeg'
        }

      }*/