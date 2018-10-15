"use strict";

module.exports = ( labels, lang ) => {

  return Object.keys( labels ).reduce( ( flat, key ) => {

    flat[ key ] = labels[ key ][ lang ];

    return flat;

  }, {} );

}