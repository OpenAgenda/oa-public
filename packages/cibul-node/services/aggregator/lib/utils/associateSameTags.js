"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'aggregator/associateSameTags' );

const loadAgendaTags = require( './loadAgendaTags' );

module.exports = async ( knex, aggregatorAgendaId, event, tagsToMatch = [] ) => {

  const aggregatorTags = await loadAgendaTags( aggregatorAgendaId );

  if ( !aggregatorTags.length ) return;

  const reviewArticleId = _.get( await knex( 'review_article' ).first( 'id' ).where( {
    review_id: aggregatorAgendaId,
    event_id: event.id
  } ), 'id' );

  if ( !reviewArticleId ) {

    throw new Error( 'event has not been referenced on aggregator yet' );

  }

  const existingTagLabels = await loadEventTagLabels( knex, reviewArticleId );

  const matchingTags = tagsToMatch
    .filter( t => aggregatorTags.filter( at => at.label === t.label ).length )
    .filter( t => !existingTagLabels.includes( t.label ) )
    .map( t => aggregatorTags.filter( at => at.label === t.label )[ 0 ] );

  if ( !matchingTags.length ) return [];

  for ( const newTag of matchingTags ) {

    await knex( 'review_tag_article' ).insert( {
      review_article_id: reviewArticleId,
      review_tag_id: newTag.id,
      created_at: new Date,
      updated_at: new Date
    } );

  }

  return matchingTags;

}

function loadEventTagLabels( knex, reviewArticleId ) {

  return knex( 'review_tag as tg' )
    .select( [ 'tg.tag as label' ] )
    .leftJoin( 'review_tag_article as rta', 'tg.id', 'rta.review_tag_id' )
    .where( 'rta.review_article_id', reviewArticleId )
    .then( refs => refs.map( tg => tg.label ) );

}
