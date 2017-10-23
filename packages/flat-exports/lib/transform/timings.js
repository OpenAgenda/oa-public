"use strict";

const _ = require( 'lodash' );
const moment = require( 'moment' );
const possibleLanguages = [ 'fr', 'en', 'it', 'es', 'de' ];

module.exports = function ( { languages }, { target, isoTarget } ) {

  const source = 'timings';
  const targetLanguages = languages.filter( l => possibleLanguages ? possibleLanguages.includes( l ) : true );

  const targetColumnCodes = [ false ].concat( targetLanguages );

  return {
    source,
    target: [ isoTarget || 'ISO' ].concat( targetLanguages.map( l => ( target || source ) + ( languages.length > 1 ? ' - ' + l.toUpperCase() : '' ) ) ),
    transform: v => {

      const columns = [ [] ].concat( targetLanguages.map( l => [] ) );

      let cursor;

      v.forEach( t => {

        // pop out timezone info
        const begin = t.begin.replace( /(\+|\-)[0-9][0-9]\:[0-9][0-9]$/, '' );

        // check if there is a change in date

        let beginDate = moment( begin ).format( 'YYYYDDDD' );

        let dateChanged = cursor !== beginDate;

        cursor = beginDate;

        moment.locale[ possibleLanguages[ 0 ] ];

        // set iso values

        columns[ 0 ].push( [ t.begin, t.end ].join( ' -> ' ) );

        targetLanguages.forEach( ( l, i ) => {

          moment.locale( l );

          if ( dateChanged ) {

            columns[ i + 1 ].push( moment( begin ).format( 'dddd D MMMM YYYY - HH:mm' ) );  

          } else {

            columns[ i + 1 ][ columns[ i + 1 ].length - 1 ] += ', ' + moment( begin ).format( 'HH:mm' )

          }

        } );

      } );

      return columns.map( c => c.join( ' | ' ) );

    }
  }

}