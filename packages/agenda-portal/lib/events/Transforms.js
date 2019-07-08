"use strict";

const _ = require( 'lodash' );
const moment = require( 'moment' );

const applyContextLink = require( '../eventNavigation' ).applyContextLink;
const applySchemaJSONLD = require( './applySchemaJSONLD' );
const detailedTiming = require( '../timings/detailed' );
const flatten = require( './flattenMultilingual' );
const relativeTimings = require( '../timings/relative' );
const links = require( './links' );
const spreadPerMonthPerDay = require( './spreadPerMonthPerDay' );

module.exports = options => {

  const base = baseEventTransform.bind( null, options );

  return {
    listItem: ( event, req, res, context ) => {

      moment.locale( res.locals.lang );

      const transformed = base( event, req, res );

      return applyContextLink( {
        req, context
      }, transformed );
    },
    show: ( event, req, res ) => {

      moment.locale( res.locals.lang );

      const transformed = base( event, req, res );

      transformed.timings = transformed.timings.map(
        detailedTiming.bind( null, { event: transformed, req } )
      );

      transformed.months = spreadPerMonthPerDay(
        transformed.timings,
        transformed.timezone
      );

      if ( _.get( req, 'params.timing' ) ) {
        transformed.timing = _.find(
          transformed.timings,
          t => new Date( t.start ).getTime() + '' === req.params.timing
        );
      }

      return transformed;
    }
  }

}

function baseEventTransform( {
  eventsPerPage,
  eventHook,
  root
}, event, req, res, context = null ) {

  return [
    flatten.bind( null, [ 'range', 'title', 'description', 'html' ], res.locals.lang ),
    relativeTimings,
    links.bind( null, res.locals ),
    applySchemaJSONLD,
    eventHook ? _.partialRight( eventHook, res.locals ) : e => e
  ].reduce( ( e, fn ) => fn( e ), event );

}
