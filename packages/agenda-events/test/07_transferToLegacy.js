"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );
const should = require( 'should' );

const config = require( '../testconfig.js' );
const svc = require( './service' );

const knex = require( 'knex' )( { client: 'mysql', connection: config.mysql } );


describe( 'transferLegacyData - transfer to legacy', function() {

  before( done => {

    svc.initAndLoad( config, [
      'legacy_agenda_event',
      'legacy_agenda',
      'legacy_event',
      'legacy_user',
      'agenda_event'
    ], {}, done );

  } );

  it( 'creates record when not existing', async () => {

    const { created } = await svc( 62792452 /* id: 4608 */ ).create( 43393864 /* id: 190092 */ );

    const before = await knex( 'legacy_agenda_event' ).first( 'id' ).where( { event_id: 190092, review_id: 4608 } );

    await svc.legacyTransfer.to( created );

    const after = await knex( 'legacy_agenda_event' ).first().where( { event_id: 190092, review_id: 4608 } );

    should( before ).not.ok;

    after.should.be.ok;

    _.pick( after, [ 'state', 'is_published' ] ).should.eql( {
      state: 2,
      is_published: 1
    } );

  } );


  it( 'adds user reference when specified', async () => {

    const { created } = await svc( 62792452 /* id: 4608 */ ).create( 43393865 /* id: 190093 */, { userUid: 98842070 } );

    await svc.legacyTransfer.to( created );

    const after = await knex( 'legacy_agenda_event' ).first().where( { event_id: 190093, review_id: 4608 } );

    after.user_id.should.equal( 1909 );

  } );


  it( 'updates record when existing', async () => {

    const { updated } = await svc( 62792452 ).update( 53117383, { state: 2 } );

    const before = await knex( 'legacy_agenda_event' ).first().where( { event_id: 81631, review_id: 4608 } );

    await svc.legacyTransfer.to( updated );    

    const after = await knex( 'legacy_agenda_event' ).first().where( { event_id: 81631, review_id: 4608 } );

    _.pick( before, [ 'is_published', 'state' ] ).should.eql( {
      state: 1,
      is_published: 0
    } );

    _.pick( after, [ 'is_published', 'state' ] ).should.eql( {
      state: 2,
      is_published: 1
    } );

  } );

  it( 'removes record', async () => {

    const before = await knex( 'legacy_agenda_event' ).first().where( { event_id: 81631, review_id: 4608 } );

    await svc.legacyTransfer.remove( { eventUid: 53117383, agendaUid: 62792452 } );

    const after = await knex( 'legacy_agenda_event' ).first().where( { event_id: 81631, review_id: 4608 } );

  } );

  it( 'updates featured value', async () => {

    await svc( 62792452 ).remove( 43393865 );

    const { created } = await svc( 62792452 ).create( 43393865, { userUid: 98842070, featured: true } );

    await svc.legacyTransfer.to( created );

    const after = await knex( 'legacy_agenda_event' ).first().where( { event_id: 190093, review_id: 4608 } );

    after.featured.should.equal( 1 );

  } );

} );
