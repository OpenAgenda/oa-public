"use strict";

const fs = require( 'fs' );
const knex = require( 'knex' )( { client: 'mysql' } );

const rawSQL = [
  'reset.sql',
  'review.create.sql',
  'review_article.create.sql',
  'review_tag_article.create.sql',
  'event.create.sql',
  'tag_set.create.sql',
  'category_set.create.sql',
  'review_category.create.sql'
].map( fx => fs.readFileSync( __dirname + '/sql/' + fx, 'utf-8' ).replace( /;(\n|)$/, '' ) );


// JEP

rawSQL.push( knex( 'review' ).insert( {
  id: 20062,
  uid: 3167596,
  title: 'JEP 2019 - Bretagne'
} ) );

rawSQL.push( knex( 'event' ).insert( {
  id: 566205,
  uid: 50492247
} ) );

rawSQL.push( knex( 'tag_set' ).insert( {
  id: 20062,
  store: fs.readFileSync( __dirname + '/tagSets/jep2019.json' )
} ) );

rawSQL.push( knex( 'review_article' ).insert( {
  id: 2169179,
  review_id: 20062,
  event_id: 566205
} ) );


// REED

rawSQL.push( knex( 'review' ).insert( {
  id: 2935,
  uid: 47863189,
  title: 'Reed Expositions France'
} ) );

rawSQL.push( knex( 'event' ).insert( {
  id: 564703,
  uid: 2457306
} ) );

rawSQL.push( knex( 'tag_set' ).insert( {
  id: 2935,
  store: fs.readFileSync( __dirname + '/tagSets/reedexpo.json' )
} ) );

rawSQL.push( knex( 'category_set' ).insert( {
  id: 2935,
  store: fs.readFileSync( __dirname + '/categorySets/reedexpo.json' )
} ) );

rawSQL.push( knex( 'review_article' ).insert( {
  id: 2169179,
  review_id: 2935,
  event_id: 564703
} ) );

rawSQL.push( knex( 'review_category' ).insert( {
  id: 498,
  category: 'Santé',
  review_id: 2935
} ) );


// VDG

rawSQL.push( knex( 'review' ).insert( {
  id: 17492,
  uid: 94755812,
  title: 'Test Agenda - VdG - Institutions'
} ) );

rawSQL.push( knex( 'event' ).insert( {
  id: 498043,
  uid: 77648603
} ) );

rawSQL.push( knex( 'tag_set' ).insert( {
  id: 17492,
  store: fs.readFileSync( __dirname + '/tagSets/vdg.json' )
} ) );

rawSQL.push( knex( 'review_article' ).insert( {
  id: 2010405,
  review_id: 17492,
  event_id: 498043
} ) );

module.exports = {
  sql: rawSQL.join( ';\n' ) + ';',
  formSchemas: {
    jep2019: require( './schemas/jep2019.json' ),
    jep2019bretagne: require( './schemas/jep2019bretagne.json' ),
    reedexpo: require( './schemas/reedexpo.json' ),
    vdg: require( './schemas/vdg.json' ),
    vdginstitutions: require( './schemas/vdginstitutions.json' )
  }
}
