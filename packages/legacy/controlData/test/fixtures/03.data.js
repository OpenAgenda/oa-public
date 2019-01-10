"use strict";

const fs = require( 'fs' );
const knex = require( 'knex' )( { client: 'mysql' } );

const rawSQL = [
  'reset.sql',
  'review.create.sql',
  'reviewer.create.sql',
  'review_article.create.sql',
  'review_category.create.sql',
  'review_tag_article.create.sql',
  'review_tag.create.sql',
  'agenda_event.create.sql'
].map( fx => fs.readFileSync( __dirname + '/sql/' + fx, 'utf-8' ).replace( /;(\n|)$/, '' ) );

rawSQL.push( knex( 'review' ).insert( [ {
  id: 1,
  uid: 123,
  title: 'test agenda 01'
} ] ) );

rawSQL.push( knex( 'review_article' ).insert( [ {
  id: 12,
  review_id: 1,
  event_id: 1,
  category_id: 1,
  user_id: 1
}, {
  id: 13,
  review_id: 1,
  event_id: 2,
  user_id: 2
} ] ) );

rawSQL.push( knex( 'agenda_event' ).insert( [ {
  event_uid: 1,
  agenda_uid: 123,
  legacy_id: '1.1',
  state: 2
} ] ) );

rawSQL.push( knex( 'reviewer' ).insert( [ {
  id: 123,
  user_id: 1,
  review_id: 1
}, {
  id: 124,
  user_id: 2,
  review_id: 1,
  organization: 'ville-de-bassens',
  store: '{"custom_fields":{"contact_name":"Communication Ville-bassens","email":"communication@ville-bassens.fr","contact_number":"05 57 80 81 46","organization":"Ville de Bassens"}}'
} ] ) );

rawSQL.push( knex( 'review_category' ).insert( [ {
  id: 1,
  category: 'Exposition',
  slug: 'exposition',
  review_id: 1
} ] ) );

rawSQL.push( knex( 'review_tag' ).insert( [ {
  id: 1,
  tag: 'Photographie',
  slug: 'photographie'
}, {
  id: 2,
  tag: 'Peinture',
  slug: 'peinture'
} ] ) );

rawSQL.push( knex( 'review_tag_article' ).insert( [ {
  id: 1,
  review_article_id: 12,
  review_tag_id: 1
}, {
  id: 2,
  review_article_id: 12,
  review_tag_id: 2
} ] ) );

const redisKeyContents = {
  '123' : JSON.stringify( { ev: [], l: [] } )
};

module.exports = {
  sql: rawSQL.join( ';\n' ) + ';',
  redisKeyContents
}
