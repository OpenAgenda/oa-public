"use strict";

const _ = require( 'lodash' );

module.exports = function ( { languages }, { source, target, postParse, possibleLanguages } ) {

  const targetLanguages = languages.filter( l => possibleLanguages ? possibleLanguages.includes( l ) : true );

  return {
    source,
    target: targetLanguages.map( l => ( target || source ) + ( languages.length > 1 ? ' - ' + l.toUpperCase() : '' ) ),
    transform: v => targetLanguages
      .map( l => {

        if ( postParse ) {

          return postParse( _.get( v, l ) );

        }
       
        return _.get( v, l, '' );

      } )
  }

}