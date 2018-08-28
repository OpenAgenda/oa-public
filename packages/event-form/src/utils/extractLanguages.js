"use strict";

const _ = require( 'lodash' );

module.exports = ( values, defaultLang ) => {

  if ( !_.isObject( values ) ) {

    return [ defaultLang ];

  }

  return _.uniq( [ 
    'title', 
    'description', 
    'keywords', 
    'conditions' 
  ].reduce( ( languages, field ) => {

    return _.isObject( values[ field ] ) 
      ? languages.concat( _.keys( values[ field ] ) ) 
      : languages;

  } , []) );

}
