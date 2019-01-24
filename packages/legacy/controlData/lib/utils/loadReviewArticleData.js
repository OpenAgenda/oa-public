"use strict";

const _ = require( 'lodash' );
const VError = require( 'verror' );
const log = require( '@openagenda/logs' )( 'controlData/utils/loadReviewArticleData' );

module.exports = async ( knex, legacyRefId ) => {

  const loaded = {
    t: [],
    c: null
    //org: null - undefined
  };

  if ( !_.isString( legacyRefId ) || ( legacyRefId.split( '.' ).length !== 2 ) ) {

    throw new VError( 'no valid legacy id was provided; %s', legacyRefId );

  }

  const [ reviewId, eventId ] = legacyRefId.split( '.' ).map( id => parseInt( id ) );

  const legacyReference = await knex.first(
    'id',
    'category_id',
    'user_id'
  ).from( 'review_article' ).where( {
    review_id: reviewId,
    event_id: eventId
  } );

  if ( !legacyReference ) {

    throw new VError( 'no entry was found for review_article id %s', legacyRefId );

  }

  loaded.t = await knex.select( 'slug' )
    .from( 'review_tag_article' )
    .leftJoin( 'review_tag', 'review_tag.id', 'review_tag_id' )
    .where( 'review_article_id', legacyReference.id )
    .then( rows => rows.map( r => r.slug ) );

  if ( legacyReference.category_id ) {

    loaded.c = await knex.first( 'slug' )
      .from( 'review_category' )
      .where( 'id', legacyReference.category_id )
      .then( r => r.slug );

  }

  if ( legacyReference.user_id ) {

    try {

      const member = await knex.first( 'organization', 'store' )
        .from( 'reviewer' )
        .where( _.pick( legacyReference, [ 'user_id', 'review_id' ] ) );

      if ( !member ) throw new Error( 'member not found' );

      if ( member.organization ) {

        const store = JSON.parse( member.store );

        loaded.org = {
          l: _.get( store, 'custom_fields.organization' ),
          s: member.organization
        };

      }

    } catch ( e ) {

      log( 'error', 'could not parse organization from %s', legacyRefId, e );

    }

  }

  return loaded;

}
