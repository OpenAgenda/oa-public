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

    const fieldValue = _.get( mltRequest, scoredField );

    if ( [ undefined, null ].includes( fieldValue ) ) return null;

    return getQuery( baseQuery, {}, {
      mlt: ih( getMoreLikeThis( _.set( {}, scoredField, fieldValue ) ), {
        boost: { $set: scores[ scoredField ] },
        fields: { $set: [ scoredField ] }
      } )
    } );

  } ).filter( q => !!q ).concat( getQuery( baseQuery, {}, {
    mlt: getMoreLikeThis( mltRequest )
  } ) );

}
