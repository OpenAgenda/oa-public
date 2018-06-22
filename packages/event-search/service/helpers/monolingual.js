"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );

module.exports = ( fields, languages = [], event ) => {

  let update = {};

  if ( !languages.length ) return event;

  fields.forEach( field => {

    const current = _.get( event, field, null );

    if ( !_.isObject( current ) ) return;

    const language = _.first( [].concat( languages ).filter( language => current[ language ] ) );

    update = _.set( update, field, { $set: current[ language ] } );

  } );

  return ih( event, update );

}