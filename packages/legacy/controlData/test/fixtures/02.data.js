"use strict";

const fs = require( 'fs' );
const knex = require( 'knex' )( { client: 'mysql' } );

const rawSQL = [
  'reset.sql',
  'review.create.sql',
  'review_article.create.sql',
  'review_category.create.sql',
  'review_tag_article.create.sql',
  'review_tag.create.sql',
  'agenda_event.create.sql'
].map( fx => fs.readFileSync( __dirname + '/sql/' + fx, 'utf-8' ).replace( /;(\n|)$/, '' ) );

rawSQL.push( knex( 'review' ).insert( [ {
  id: 2,
  uid: 456,
  title: 'test agenda 02'
} ] ) );

rawSQL.push( knex( 'review_article' ).insert( [ {
  id: 13,
  review_id: 2,
  event_id: 3,
  category_id: 2
} ] ) );

rawSQL.push( knex( 'agenda_event' ).insert( [ {
  event_uid: 4,
  agenda_uid: 456,
  legacy_id: '2.3',
  state: 2
} ] ) );

rawSQL.push( knex( 'review_category' ).insert( [ {
  id: 2,
  category: 'Marché',
  slug: 'marche',
  review_id: 2
}, {
  id: 3,
  category: 'Manifestation',
  slug: 'manifestation',
  review_id: 2
} ] ) );

rawSQL.push( knex( 'review_tag' ).insert( [ {
  id: 3,
  tag: 'Court-métrages',
  slug: 'courtmetrages'
}, {
  id: 4,
  tag: 'Bazar',
  slug: 'bazar'
} ] ) );

rawSQL.push( knex( 'review_tag_article' ).insert( [ {
  id: 1,
  review_article_id: 12,
  review_tag_id: 4
} ] ) );

const redisKeyContents = {
  '456' : JSON.stringify( {
    ev: [ {
      u: 3,
      l: 2,
      c: null,
      t: []
    }, {
      u: 4,
      l: 2,
      c: 'manifestation',
      t: [ 'bazar' ]
    } ],
    l: [ {
      u: 2,
      lt: 44.874237,
      lg: -0.676821
    } ]
  } )
};

module.exports = {
  sql: rawSQL.join( ';\n' ) + ';',
  redisKeyContents
}
