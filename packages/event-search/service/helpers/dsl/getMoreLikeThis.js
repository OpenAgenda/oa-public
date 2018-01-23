"use strict";

const _ = require( 'lodash' );

const distributeByLanguage = require( './_distributeByLanguage' ).bind( null, [ 'title', 'description', 'keywords' ] );

const getMLTField = field => _.get( {
  keywords: 'search_internals_keywords_text',
  title: 'search_internals_title',
  description: 'search_internals_description'
}, field );

/**
 * keywords -> generic 'like' on search_internals_keywords
 */

module.exports = mltQuery => {

  const { like, fields } = distributeByLanguage( mltQuery ).reduce( ( { like, fields }, [ lang, query ] ) => {

    const mltDoc = _.mapKeys( query, ( v, k ) => getMLTField( k ) );

    const flattenedMLTDoc = _.mapValues( mltDoc, v => _.isArray( v ) ? v.join( ' ' ) : v );

    const nonEmptyMLTDoc = _.omitBy( flattenedMLTDoc, v => !v );

    return _.keys( nonEmptyMLTDoc ).length ? { 
      like: like.concat( nonEmptyMLTDoc ),
      fields: _.uniq( fields.concat( _.keys( nonEmptyMLTDoc ) ) )
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