"use strict";

const fs = require( 'fs' );
const knex = require( 'knex' )( { client: 'mysql' } );

const rawSQL = [
  'reset.sql',
  'review.create.sql',
  'reviewer.create.sql',
  'user.create.sql',
  'user.bordeaux.sql',
  'reviewer.bordeaux.sql',
  'review_article.create.sql',
  'review_article.bordeaux.sql',
  'review_category.create.sql',
  'category_set.create.sql',
  'category_set.bordeaux.sql',
  'tag_set.create.sql',
  'tag_set.bordeaux.sql',
  'review_category.bordeaux.sql',
  'review_tag_article.create.sql',
  'review_tag_article.bordeaux.sql',
  'review_tag.create.sql',
  'review_tag.bordeaux.sql',
  'agenda_event.create.sql',
  'agenda_event.bordeaux.sql',
  'event_2.create.sql',
  'event_2.bordeaux.sql',
  'location.create.sql',
  'location.bordeaux.sql'
].map( fx => fs.readFileSync( __dirname + '/sql/' + fx, 'utf-8' ).replace( /;(\n|)$/, '' ) );

rawSQL.push( knex( 'review' ).insert( [ {
  id: 7796,
  uid: 83549053,
  title: 'Bordeaux Métropole',
  settings: '{"contribution":{"type":0,"defaultState":2,"message":null,"useFields":false,"authorizedIPAddresses":[]},"translation":{"enabled":false,"source":"fr","sets":[],"service":"reverso","options":null}}'
} ] ) );

module.exports = {
  sql: rawSQL.join( ';\n' ) + ';',
  redisKeyContents: {}
}
