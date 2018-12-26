"use strict";

const _ = require( 'lodash' );
const moment = require( 'moment' );

const flatten = require( './flattenMultilingual' );
const relativeTimings = require( './relativeTimings' );
const links = require( './eventLinks' );

/**
 * event is parsed by parsers listed here before being provided to views
 */

module.exports = ( { lang, eventParser, root, agenda } ) => {

  moment.locale( lang );

  return e => [
    flatten.bind( null, [ 'range', 'title', 'description', 'html' ], lang ),
    _.partialRight( relativeTimings, { lang, moment } ),
    _.partialRight( links, { lang, root, agenda } ),
    eventParser ? _.partialRight( eventParser, { lang, moment } ) : e => e
  ].reduce( ( e, fn ) => fn( e ), e );

}
