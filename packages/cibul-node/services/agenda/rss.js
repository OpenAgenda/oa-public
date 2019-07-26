"use strict";

const _ = require( 'lodash' );

const src = require( './' ),

  rss = require( 'rss' ),

  eventSvc = require( '../event' ),

  async = require( 'async' ),

  utils = require( '@openagenda/utils' ),

  config = require( '../../config' ),

  moment = require( 'moment-timezone' );


/**
 * run search events middleware first,
 * then this
 */

module.exports = function( req, res ) {

  let feed = new rss( {
    title: req.agenda.title,
    description: req.agenda.description || req.agenda.title,
    feed_url: req.genUrl( 'agendaRssEvents', { uid: req.agenda.uid }, { abs: true } ),
    site_url: req.genUrl( 'agendaShow', { slug: req.agenda.slug }, { abs: true } ),
    generator: 'OpenAgenda',
    image_url: req.agenda.image ? config.aws.imageBucketPath + req.agenda.image : false,
    language: req.lang,
    ttl: 120,
    custom_namespaces: {
      'ev': 'http://purl.org/rss/1.0/modules/event/'
    }
  } );

  async.eachSeries( req.events.map( eventSvc.instanciate ), ( eInst, ecb ) => {

    eInst.exportable( ( err, exp ) => {

      if ( err ) {

        req.log( 'error', err );

        return ecb();

      }

      eInst.switchLanguage( req.lang );

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

      }

      feed.item( item );

      ecb();

    } );

  }, ( err ) => {

    if ( err ) return next( err );

    res.set( 'Content-Type', _.get( req, 'headers.user-agent', '' ).includes( 'Mozilla' ) ? 'text/xml' : 'application/rss+xml' );

    res.send( feed.xml() );

  } );



}

function _buildRssDescription( instance, exp, lang ) {

  let longDescription = utils.cleanString(
    exp.html && exp.html[ lang ] ? exp.html[ lang ] : ''
  );

   return [
    '<p>',
      instance.getDescription(),
    '</p>',
    '<p>',
      exp.range[ lang ],
    '</p>',
    longDescription
  ].join( '' );

}
