"use strict";

const _ = require( 'lodash' );

const distributeByLanguage = require( './_distributeByLanguage' ).bind( null, [ 'title', 'description', 'keywords' ] );

const fieldMap = {
  keywords: 'search_internals_keywords_text',
  title: 'search_internals_title',
  description: 'search_internals_description'
};

const getMLTField = field => _.get( fieldMap, field );

const getMLTLocationValue = location => [ 'address', 'city', 'department', 'region' ]
  .filter( f => !!location[ f ] )
  .map( f => location[ f ] )
  .join( ' ' );

/**
 * keywords -> generic 'like' on search_internals_keywords
 */

module.exports = mltQuery => {

  const { like, fields } = distributeByLanguage( mltQuery ).reduce( ( { like, fields }, [ lang, query ] ) => {

    const mltDoc = _.mapKeys( _.pick( query, _.keys( fieldMap ) ), ( v, k ) => getMLTField( k ) );

    if ( mltQuery.location ) {

      mltDoc.search_internals_full_address_text = getMLTLocationValue( mltQuery.location );

    }

    if ( mltQuery.custom ) {

      const mltCustom = {};

      const optionedValues = _.flatten( _.keys( mltQuery.custom )
        .filter( field => _.isArray( mltQuery.custom[ field ] ) || _.isInteger( mltQuery.custom[ field ] ) )
        .map( field => [].concat( mltQuery.custom[ field ] ) ) );

      if ( optionedValues.length ) {

        fields.push( 'custom.search_internals_keywords' );

        mltCustom[ 'search_internals_keywords' ] = optionedValues.map( o => 'key' + o );

      }

      _.keys( mltQuery.custom )
        .filter( field => _.isString( mltQuery.custom[ field ] ) )
        .filter( field => mltQuery.custom[ field ].length )
        .forEach( field => {

          mltCustom[ field ] = mltQuery.custom[ field ];

          fields.push( 'custom.' + field );

        } );


      if ( _.keys( mltCustom ).length ) {

        mltDoc.custom = mltCustom;

      }

    }

    const flattenedMLTDoc = _.mapValues( mltDoc, v => _.isArray( v ) ? v.join( ' ' ) : v );

    const nonEmptyMLTDoc = _.omitBy( flattenedMLTDoc, v => !v );

    return _.keys( nonEmptyMLTDoc ).length ? {
      like: like.concat( nonEmptyMLTDoc ),
      fields: _.uniq( fields.concat( _.keys( nonEmptyMLTDoc ).filter( k => k !== 'custom' ) ) )
    } : { like, fields };

  }, {
    like: [],
    fields: []
  } );

  return {
    fields,
    min_word_length: 3,
    min_term_freq: 1,
    min_doc_freq: 1,
    like: like.map( l => ( { doc: l } ) )
  }

}
