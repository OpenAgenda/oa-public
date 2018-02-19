"use strict";

const k = require( 'knex' )( { client: 'mysql', connection: require( '../mysql.config.js' ) } );

const config = require( './config' );

const _ = require( 'lodash' );

run();

async function run() {

  for ( let slug of config.agendaSlugs ) await _transferAgendaCategories( slug );

}

async function _transferAgendaCategories( slug ) {

  console.log( 'transferring %s', slug );

  const agenda = await k( 'review' ).first( 'id' ).where( { slug } );

  if ( !agenda ) return console.log( 'no agenda found for %s', slug );

  const tags = await k( 'review_tag' ).where( 'review_id', agenda.id );

  const categories = await k( 'review_category' ).where( 'review_id', agenda.id );

  // loop over all references
  
  let offset = 0, ras = [], limit = 20;

  while ( ( ras = await k( 'review_article' ).where( 'review_id', agenda.id ).offset( offset ).limit( limit ) ).length ) {

    for ( let ra of ras ) {

      let category = _.head( categories.filter( c => ra.category_id === c.id ) );

      if ( category ) {

        let tag = await _getMatchingFreeTag( tags, category.category, ra.id );

        if ( tag ) {

          let result = await k( 'review_tag_article' ).insert( {
            created_at: new Date,
            updated_at: new Date,
            review_tag_id: tag.id,
            review_article_id: ra.id
          } );

        }

      }

    }

    offset += limit;

  }  

  console.log( 'done transferring %s', slug );

}

async function _getMatchingFreeTag( tags, label, raId ) {

  let tag = _.head( tags.filter( t => t.tag === label ) );

  if ( !tag ) return;

  const association = await k( 'review_tag_article' ).first().where( { 
    review_article_id: raId, 
    review_tag_id: tag.id 
  } );

  if ( association ) return;

  return tag;

}