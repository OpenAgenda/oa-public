"use strict";

const _ = require( 'lodash' );
const mysql = require( 'mysql' );
const should = require( 'should' );
const knexLib = require( 'knex' );

const config = require( '../testconfig' );
const svc = require( './service' );

let knex;

describe( 'events - functional (server): legacy reverse bridge', function() {

  this.timeout( 60000 );

  before( done => {

    knex = knexLib( {
      client: 'mysql',
      connection: _.extend( config.mysql, {
        timezone: 'utc'
      } )
    } );

    svc.initAndLoad( config, [
      config.schemas.event + '_few',
      config.legacy.schemas.event + '_few',
      config.legacy.schemas.occurrence,
      config.legacy.schemas.eventTranslation,
      config.legacy.schemas.location,
      config.legacy.schemas.eventLocation,
      config.legacy.schemas.eventLocationTranslation,
      config.legacy.schemas.agendaEvent,
      config.legacy.schemas.user,
      config.legacy.schemas.agenda
    ], { reset: true }, done );

  } );

  after( svc.shutdown );

  //after( done => knex.destroy( done ) );


  it( 'transfer to legacy structure creates legacy event if non-existant', async () => {

    const { inserted } = await svc.legacy.transferToLegacy( { uid: 2875149 } );

    inserted.event.uid.should.equal( 2875149 );

    inserted.eventTranslations.length.should.equal( 1 );

    inserted.eventLocation.event_id.should.equal( inserted.event.id );

    inserted.occurrences.length.should.equal( 1 );

  } );


  it( 'transfer to legacy structure updates legacy event if existing with updated text field values', async () => {

    const uid = 59481036;

    await svc.update( { uid }, {
      title: {
        fr: 'Un nouveau titre',
        en: 'A new title'
      }
    } );

    await svc.legacy.transferToLegacy( { uid } );

    const legacyEventEntry = await knex( config.legacy.schemas.event ).first().where( { uid } );

    const eventTranslations = await knex( config.legacy.schemas.eventTranslation ).select().where( { id: legacyEventEntry.id } );

    eventTranslations.length.should.equal( 2 );

    _.head( eventTranslations.filter( t => t.lang === 'en' ) ).title.should.equal( 'A new title' );

  } );


  it( 'transfer to legacy structure updates base legacy event entry', async () => {

    const uid = 59481036;

    await svc.update( { uid }, { slug: 'a-new-slug' } );

    await svc.legacy.transferToLegacy( { uid } );

    const eventEntry = await knex( config.legacy.schemas.event ).first().where( { uid } );

    eventEntry.slug.should.equal( 'a-new-slug' );

  } ); 


  it( 'transfer to legacy replaces occurrences', async () => {

    const uid = 59481036;
    const eventId = 146447; // id of event in fixtures

    // these are the timings now.
    await svc.update( { uid }, { timings: [ {
      begin: new Date( '2017-12-26T03:00:00+0100' ),
      end: new Date( '2017-12-26T12:00:00+0100' )
    } ] } );

    const result = await svc.legacy.transferToLegacy( { uid } );

    const occurrenceEntries = await knex( config.legacy.schemas.occurrence ).where( { event_id: eventId } ); 

    occurrenceEntries.length.should.equal( 1 );

    _.pick( occurrenceEntries[ 0 ], [ 'time_start', 'time_end' ] )

      .should.eql( {
        time_start: '03:00:00',
        time_end: '12:00:00'
      } );

    JSON.stringify( occurrenceEntries[ 0 ].date ).should.eql( '"2017-12-26T00:00:00.000Z"' );


  } );

} );