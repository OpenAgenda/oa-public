"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );

const transform = require( '../transform' );

const txtRender = _.template( fs.readFileSync( __dirname + '/txtEvent.tpl', 'utf-8' ) );

const mdRender = _.template( fs.readFileSync( __dirname + '/mdEvent.tpl', 'utf-8' ) );

module.exports = ( format, { genUrl, lang }, data ) => {

  return ( format === 'md' ? mdRender : txtRender )( {
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