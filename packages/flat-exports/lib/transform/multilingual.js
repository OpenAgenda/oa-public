"use strict";

const _ = require( 'lodash' );
const getTargetField = require( './getTargetField' );

module.exports = function ( { languages, lang }, { source, target, post, possibleLanguages } ) {

  const targetLanguages = languages.filter( l => possibleLanguages ? possibleLanguages.includes( l ) : true );

  //const targetField = getTargetField( labels, field, labelKey, lang );

  return {
    source,
    target: targetLanguages.map( l => ( target || source ) + ( languages.length > 1 ? ' - ' + l.toUpperCase() : '' ) ),
    transform: v => targetLanguages
      .map( l => {

        if ( post ) {

          return post( _.get( v, l ) );

        }
       
        return _.get( v, l, '' );

      } )
  }

}