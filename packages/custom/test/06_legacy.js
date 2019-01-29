"use strict";

const _ = require( 'lodash' );
const fs = require( 'fs' );
const ih = require( 'immutability-helper' );
const mysql = require( 'mysql' );
const should = require( 'should' );

const config = require( '../testconfig' );
const legacy = require( '../service/legacy' );
const svc = require( './service' );

const bordeauxSchemaFields = JSON.parse( fs.readFileSync( __dirname + '/fixtures/bordeaux-fields.json' , 'utf-8' ) );
const reedSchemaFields = JSON.parse( fs.readFileSync( __dirname + '/fixtures/reed-fields.json' , 'utf-8' ) );

describe( 'custom - functional (server): legacy', function() {

  this.timeout( 4000 );

  before( async () => {

    await svc.initAndLoad( ih( config, {
      legacy: {
        interfaces: {
          getFormSchemaFields: { $set: formSchemaId => {

            if ( formSchemaId === 42 ) return reedSchemaFields;

            return bordeauxSchemaFields;

          } }
        }
      },
      interfaces: {
        getValidator: { $set: formSchemaId => {

          return v => v; // its all good for these tests

        } }
      }
    } ) );

  } );

  after( async () => {

    await svc.shutdown();

  } );


  it( 'legacy set updates legacy event store with updated customField values', async () => {

    await legacy( 123 /*formSchemaId*/, 27434489 /*eventUid*/, {
      custom_description : 'Une description personnalisée',
      intermunicipal_interest : 1,
      recurring: 2
    } );

    const config = svc.getConfig();

    const { custom_fields } = await config.knex( config.legacy.schemas.event ).first( 'custom_fields' ).where( { uid: 27434489 } );

    JSON.parse( custom_fields ).should.eql( {
      custom_description: 'Une description personnalisée',
      intermunicipal_interest: true,
      recurring: true
    } );

  } );


  it( 'legacy set does not overwrite customField values that are already present in event data', async () => {

    await legacy( 123 /*formSchemaId*/, 27434489 /*eventUid*/, {
      custom_description: 'Quelques petites notes'
    } );


    const config = svc.getConfig();

    let legacyCustomFields = await config.knex( config.legacy.schemas.event )
      .first( 'custom_fields' )
      .where( { uid: 27434489 } )
      .then( r => r.custom_fields );

    legacyCustomFields.should.eql( '{"custom_description":"Quelques petites notes"}' );

    await legacy( 42 /*formSchemaId*/, 27434489 /*eventUid*/, {
      nomenclature: 'Le champ de bordeaux ne disparait pas'
    } );

    legacyCustomFields = await config.knex( config.legacy.schemas.event )
      .first( 'custom_fields' )
      .where( { uid: 27434489 } )
      .then( r => r.custom_fields );

    legacyCustomFields.should.eql( '{"custom_description":"Quelques petites notes","nomenclature":"Le champ de bordeaux ne disparait pas"}' );


  } );


  it( 'legacy set updates tag references based on given custom values', async () => {

    await legacy( 123 /* formSchemaId */, 27434489 /*eventUid*/, {
      'thematiques-bordeaux-metropole': [ 5 /*9663*/, 6 /*9664*/],
      'bordeaux-metropole' : [ 45 ]
    } );

    const config = svc.getConfig();

    const legacyEventTags = await config.knex( config.legacy.schemas.agendaEventTag ).where( 'review_article_id', 111 );

    legacyEventTags.map( t => t.review_tag_id ).should.eql( [ 9663, 9664 ] );

  } );


  it( 'legacy set updates category reference base on given custom values', async () => {

    await legacy( 123 /* formSchemaId */, 27434489 /*eventUid*/, {
      'thematiques-bordeaux-metropole': [ 5 /*9663*/, 6 /*9664*/],
      'categories-agenda-metropolitain' : 45  /*3457*/
    } );

    const config = svc.getConfig();

    const legacyAgendaEvent = await config.knex( config.legacy.schemas.agendaEvent )
      .where( 'review_id', 1010101 )
      .first();

    legacyAgendaEvent.category_id.should.equal( 3457 );

  } );


  it( 'legacy remove deletes legacy agenda_event reference', async () => {

    await legacy.remove( 123, 27434489 );

    const config = svc.getConfig();

    const legacyAgendaEvents = await config.knex( config.legacy.schemas.agendaEvent ).select().where( {
      review_id: 1010101,
      event_id: 147621
    } );

    // this works as long as there is only one ref in fixtures.
    // tag refs will be removed by cascade
    legacyAgendaEvents.length.should.equal( 0 );

  } );


  it( 'if transferToLegacy option is set, create triggers legacy set', async () => {

    const config = svc.getConfig();

    await svc( 123 ).create( 31259734, {
      'custom_description': 'Witness me!'
    }, { transferToLegacy: true } );

    const { custom_fields } = await config.knex( config.legacy.schemas.event ).first( 'custom_fields' ).where( { uid: 31259734 } );

    custom_fields.should.equal( '{"custom_description":"Witness me!"}' );

  } );

} );
