"use strict";

const _ = require( 'lodash' );

module.exports = ( multilingualFields = [], obj ) => {

  const languages = _.keys( obj ).filter( k => multilingualFields.includes( k ) ).reduce( ( languages, field ) => {

    if ( !obj[ field ] || !_.isObject( obj[ field ] ) ) return languages;

    return _.uniq( languages.concat( _.keys( obj[ field ] ) ) );

  }, [] );

  if ( !languages.length ) languages.push( null );

  return languages.map( lang => {

    const langObj = _.keys( obj ).reduce( ( langObj, field ) => {

      const path = [ field ].concat( multilingualFields.includes( field ) ? lang : [] );

      const value = _.get( obj, path, undefined );

      if ( value !== undefined ) {

        langObj[ field ] = value;

      }

      return langObj;

    }, {} );

    return [
      lang,
      langObj
    ]

  } );

}