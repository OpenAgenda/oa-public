"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' );

const should = require( 'should' );

const config = require( '../testconfig.js' );

const mysql = require( 'mysql' );

const _ = require( 'lodash' );


describe( 'transferLegacyData - sample', function() {

  this.timeout( 40000 );

  beforeEach( done => {

    svc.initAndLoad( _.extend( {}, config, {
      legacy: _.extend( {}, config.legacy, {
        interval: 1
      } ) } ), [
      'legacy_agenda_event',
      'legacy_agenda',
      'legacy_event',
      'legacy_user',
      'agenda_event_empty'
    ], {}, done )

  } );

  it( 'transfer of 1 event gives back type of operation', async () => {

    let result = await svc.legacyTransfer( 436064 );

    result.operation.should.equal( 'create' );

  } );

  it( 'transfer of 1 event stores user uid', async () => {

    let result = await svc.legacyTransfer( 436064 );

    result.created.userUid.should.equal( 40960233 )

  } );

  it( 'transfer of 1 event by event & agenda id works as well', async () => {

    let result = await svc.legacyTransfer( { agendaId: 4608, eventId: 81631 } );

    result.operation.should.equal( 'create' );

  } );

  it( 'transfer 20 events in empty target db reports 20 creates', done => {

    svc.tasks.transferLegacyData( { total: 20 }, ( err, result ) => {

      result.creates.should.equal( 20 );

      result.should.eql( {
        creates: 20,
        updates: 0,
        removes: 0,
        errors: 0
      } );

      done();

    } );

  } );


  it( 'transfer 20 events in empty target db effectively creates 20 records', done => {

    let con = mysql.createConnection( config.mysql );

    con.query( `select count(id) from ${config.schemas.agendaEvent}`, ( err, rows ) => {

      rows[ 0 ][ 'count(id)' ].should.equal( 0 );

      svc.tasks.transferLegacyData( { total: 20 }, ( err, result ) => {

        con.query( `select count(id) from ${config.schemas.agendaEvent}`, ( err, rows ) => {

          rows[ 0 ][ 'count(id)' ].should.equal( 20 );

          con.end();

          done();

        } );

      } );

    } );

  } );


  it( 'removed events in legacy data are removed in service data by transfer script', done => {

    svc.tasks.transferLegacyData( { total: 20 }, ( err, result ) => {

      let con = mysql.createConnection( config.mysql );

      con.query( `delete from ${config.legacy.schemas.agendaEvent} limit 1`, err => {

        svc.tasks.transferLegacyData( { total: 20 }, ( err, result ) => {

          should( err ).equal( null );

          result.should.eql( {
            creates: 1,
            updates: 0,
            removes: 1,
            errors: 0
          } );

          con.end();

          done();

        } );

      } );

    } );

  } );

} );
