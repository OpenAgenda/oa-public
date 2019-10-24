"use strict";

const _ = require( 'lodash' );

const log = require( '@openagenda/logs' )( 'aggregator/associateSameTags' );

const loadAgendaTags = require( './loadAgendaTags' );

/**
 * tagsToMatch: list of labels of tags associated with event in source agenda, transformed as per aggregation rules
 */

module.exports = async options => {

  const {
    knex, aggregatorAgendaId, event, tagsToMatch
  } = Object.assign( {
    knex: null,
    aggregatorAgendaId: null,
    event: null,
    tagsToMatch: []
  }, options );

  log( 'there are %s tags in source to evaluate for correspondance', tagsToMatch.length );

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
    .filter( label => aggregatorTags.filter( at => at.label === label ).length )
    .filter( label => !existingTagLabels.includes( label ) )
    .map( label => aggregatorTags.filter( at => at.label === label )[ 0 ] );

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
