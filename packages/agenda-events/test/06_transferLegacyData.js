"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );
const mysql = require( 'mysql' );
const should = require( 'should' );

const queue = require( '@openagenda/queue' );

const config = require( '../testconfig.js' );
const svc = require( './service' );


describe( 'transferLegacyData - sample', function() {

  let q;

  this.timeout( 40000 );

  beforeEach( done => {

    svc.initAndLoad( _.extend( {}, config, {
      legacy: _.extend( {}, config.legacy, {
        interval: 1
      } ) } ), [
      'legacy_agenda_event',
      'legacy_event_editor',
      'legacy_agenda',
      'legacy_event',
      'legacy_user',
      'agenda_event_empty'
    ], {}, done );

  } );

  beforeEach( done => {

    q = queue( 'agendaEventTransfer', { redis: config.redis } );

    q.test.clear( done );

  } );

  it( 'transfer of 1 event gives back type of operation', async () => {

    const result = await svc.legacyTransfer( 436064 );

    result.operation.should.equal( 'create' );

  } );

  it( 'transfer of 1 event stores user uid', async () => {

    const result = await svc.legacyTransfer( 436064 );

    result.created.userUid.should.equal( 40960233 )

  } );

  it( 'transfer of 1 event by event & agenda id works as well', async () => {

    const result = await svc.legacyTransfer( { agendaId: 4608, eventId: 81631 } );

    result.operation.should.equal( 'create' );

  } );

  it( 'transfer of 1 event transfers event edition rights when they exist on legacy struct', async () => {

    const result = await svc.legacyTransfer( {
      agendaId: 4608,
      eventId: 81824,
    } );

    result.created.canEdit.should.equal( true );

  } );

  it( 'transfer of 1 event transfers event edition rights when they exist on legacy struct', async () => {

    const result = await svc.legacyTransfer( {
      agendaId: 4608,
      eventId: 82159,
    } );

    result.created.canEdit.should.equal( false );

  } );

  it( 'transfer 20 events in empty target db reports 20 creates', done => {

    svc.tasks.transferLegacyData( { total: 20, interval: 0, queueOnly: true } ).then( () => {

      q.test.flush( ( err, items ) => {

        items.length.should.equal( 20 );

        done();

      } );

    } );

  } );


  it( 'transfer 20 events in empty target db effectively creates 20 records', done => {

    const con = mysql.createConnection( config.mysql );

    con.query( `select count(id) from ${config.schemas.agendaEvent}`, ( err, rows ) => {

      rows[ 0 ][ 'count(id)' ].should.equal( 0 );

      svc.tasks.transferLegacyData( { total: 20, interval: 0 } );

      setTimeout( () => {

        con.query( `select count(id) from ${config.schemas.agendaEvent}`, ( err, rows ) => {

          rows[ 0 ][ 'count(id)' ].should.equal( 20 );

          con.end();

          done();

        } );

      }, 2000 );

    } );

  } );

  it( 'removed events in legacy data are removed in service data by transfer script', done => {

    svc.tasks.transferLegacyData( { total: 20, interval: 0 } );

    setTimeout( () => {

      const con = mysql.createConnection( config.mysql );

      con.query( `delete from ${config.legacy.schemas.agendaEvent} limit 1`, err => {

        svc.tasks.transferLegacyData( { total: 19, interval: 0 } );

        setTimeout( () => done(), 500 );

      } );

    }, 500 );

  } );

  describe( 'transferUserUids', function() {

    it( 'set userUid on 20 events', done => {

      svc.tasks.transferLegacyData( { total: 20, interval: 0 } );

      setTimeout( () => {

        const con = mysql.createConnection( config.mysql );

        con.query( `update ${config.schemas.agendaEvent} set user_uid = null limit 10`, err => {

          svc.tasks.transferUserUids().then( report => {

            report.updated.should.equal( 10 );

            con.query( `select count( event_uid ) as null_count from ${config.schemas.agendaEvent} where user_uid is null`, ( err, rows ) => {

              rows[ 0 ].null_count.should.equal( 0 );

              con.end();

              done();

            } );

          } );

        } );

      }, 500 );

    } );

  } );

} );
