"use strict";

const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const getMoreLikeThis = require( './getMoreLikeThis' );
const getQuery = require( './getQuery' );
const getSource = require( './getSource' );

module.exports = ( mltRequest, mltOptions = {}, baseQuery = {} ) => {

  const boostScores = _.get( mltOptions, 'boost' );

  if ( boostScores ) {

    return {
      query: {
        dis_max: {
          queries: _spreadByBoostScores( mltRequest, boostScores, baseQuery )
        }
      },
      _source: getSource()
    }

  } else {

    return {
      query: getQuery( baseQuery, {}, {
        mlt: getMoreLikeThis( mltRequest )
      } ),
      _source: getSource()
    }

  }

}


function _spreadByBoostScores( mltRequest, scores, baseQuery = {} ) {

  return _.keys( scores ).map( scoredField => {

    const scoredFieldPath = ( _mustAddCustomPrefix( scoredField ) ? 'custom.' : '' ) + scoredField;

    const fieldValue = _.get( mltRequest, scoredFieldPath );

    const boostedField = _isIntegerLike( fieldValue ) ? ( ( _isCustom( scoredFieldPath ) ? 'custom.' : '' ) + 'search_internals_keywords' ) : scoredFieldPath;

    if ( [ undefined, null ].includes( fieldValue ) ) return null;

    return getQuery( baseQuery, {}, {
      mlt: ih( getMoreLikeThis( _.set( {}, scoredFieldPath, fieldValue ) ), {
        boost: { $set: scores[ scoredField ] },
        fields: { $set: [ boostedField ] }
      } )
    } );

  } ).filter( q => !!q ).concat( getQuery( baseQuery, {}, {
    mlt: getMoreLikeThis( mltRequest )
  } ) );

}

function _isCustom( field ) {

  return field.split( '.' )[ 0 ] === 'custom';

}

function _mustAddCustomPrefix( field ) {

  if ( _isCustom( field ) ) return false;

  return ![ 'title', 'description', 'longDescription', 'conditions', 'keywords', 'location' ].includes( field.split( '.' )[ 0 ] );

}

function _isIntegerLike( value ) {

  return !isNaN( parseInt( value ) );

}
