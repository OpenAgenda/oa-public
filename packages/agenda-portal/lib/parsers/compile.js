"use strict";

const _ = require( 'lodash' );
const moment = require( 'moment' );

const flatten = require( './flattenMultilingual' );
const relativeTimings = require( './relativeTimings' );
const applyContextLink = require( '../eventNavigation' ).applyContextLink;
const links = require( './eventLinks' );

/**
 * event is parsed by parsers listed here before being provided to views
 */

module.exports = ( {
  eventsPerPage,
  lang, // language in which the event is to be flattened
  eventParser, // project-specific parser
  root, // root path for portal
  agenda // agenda of portal
} ) => {

  moment.locale( lang );

  return ( e, req = null, context ) => [
    flatten.bind( null, [ 'range', 'title', 'description', 'html' ], lang ),
    _.partialRight( relativeTimings, { lang, moment } ),
    _.partialRight( links, { lang, root, agenda } ),
    req ? applyContextLink.bind( null, { req, context } ) : e => e,
    eventParser ? _.partialRight( eventParser, { lang, moment } ) : e => e
  ].reduce( ( e, fn ) => fn( e ), e );

}
