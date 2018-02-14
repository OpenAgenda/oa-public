"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );

const transform = require( '../transform' );

const render = _.template( fs.readFileSync( __dirname + '/event.tpl', 'utf-8' ) );

module.exports = ( { genUrl, lang }, data ) => {

  return render( {
    title: get( data.title, lang ),
    link: genUrl( data ),
    description: get( data.description, lang ),
    dateRange: get( data.dateRange, lang ),
    location: data.location,
    longDescription: get( data.longDescription, lang )
  } );

}

function get( value, preferredLang ) {

  const existing = _.keys( value );

  if ( !existing || !existing.length ) return '';

  return _.get( value, preferredLang, value[ existing[ 0 ] ] );

}