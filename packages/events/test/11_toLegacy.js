"use strict";

const _ = require( 'lodash' );
const mysql = require( 'mysql' );
const should = require( 'should' );
const knexLib = require( 'knex' );
const wn = require( 'when/node' );

const config = require( '../testconfig' );
const svc = require( './service' );

let knex;

describe( 'events - functional (server): legacy reverse bridge', function() {

  this.timeout( 60000 );

  before( done => {

    svc.initAndLoad( config, [
      config.schemas.event + '_few',
      config.legacy.schemas.event + '_few',
      config.legacy.schemas.occurrence,
      config.legacy.schemas.eventTranslation,
      config.legacy.schemas.location,
      config.legacy.schemas.eventLocation,
      config.legacy.schemas.eventLocationTranslation,
      config.legacy.schemas.agendaEvent,
      config.legacy.schemas.eventReferences,
      config.legacy.schemas.user,
      config.legacy.schemas.agenda,
      config.legacy.schemas.deleted
    ], { reset: true }, () => {

      knex = svc.getConfig().knex;

      done();

    } );

  } );

  after( done => svc.shutdown( done ) );


  describe( 'transfer create to legacy', () => {

    let result, legacyEventRecord;

    before( async () => {

      legacyEventRecord = await knex( config.legacy.schemas.event ).first( 'id' ).where( 'uid', 2875149 );

    } );

    before( async () => {

      result = await svc.legacy.update( { uid: 2875149 } );

    } );

    it( 'creates legacy event if previously non-existant', async () => {

      should( legacyEventRecord ).equal( undefined );

      const updatedLegacyRecord = await knex( config.legacy.schemas.event ).first( 'uid' ).where( 'uid', 2875149 );

      updatedLegacyRecord.uid.should.equal( 2875149 );

    } );

    it( 'created legacy record references same uid', () => {

      _.get( result, 'inserted.event.uid', {} ).should.equal( 2875149 );

    } );

    it( 'created legacy eventTranslation, eventLocation, occurrences are given in response', () => {

      const { inserted } = result;

      inserted.eventTranslations.length.should.equal( 1 );

      inserted.eventLocation.event_id.should.equal( inserted.event.id );

      inserted.occurrences.length.should.equal( 1 );

    } );

    it( 'created legacy event store keeps image details', () => {

      JSON.parse( _.get( result, 'inserted.event.store' ) ).images.should.eql( {
        filename: 'event_decouverte-du-pavillon-pedagogique-energies-renouvelables-du-rsma_877473.jpg',
        credits: null,
        size: { height: null, width: null },
        variants: [ {
          "type":"full",
          "filename":"evfevent_decouverte-du-pavillon-pedagogique-energies-renouvelables-du-rsma_877473.jpg",
          "size":{"height":null,"width":null}
        },{
          "type":"thumbnail",
          "filename":"evtbevent_decouverte-du-pavillon-pedagogique-energies-renouvelables-du-rsma_877473.jpg",
          "size":{"height":null,"width":null}
        } ],
        base: '//openagendatst.s3.amazonaws.com/'
      } );

    } );

    it( 'event references are added to legacy table', async () => {

      const entries = await knex( config.legacy.schemas.eventReferences ).select( 'event_id', 'agenda_id', 'ref_event_id' ).where( 'event_id', result.inserted.event.id );

      entries.map( e => _.omit( e, [] ) ).should.eql( _.get( result, 'inserted.eventReferences' ) );

    } );


  } );


  describe( 'transfer update to legacy', () => {

    const uid = 59481036;
    const eventId = 146447; // id of event in fixtures

    let result, legacyEventRecord;

    before( async () => {

      await svc.legacy.update( { uid } );

    } );

    before( async () => {

      legacyEventRecord = await knex( config.legacy.schemas.event ).first( 'id' ).where( 'uid', uid );

    } );

    it( 'transfer updates given values', async () => {

      await svc.update( { uid }, {
        title: {
          fr: 'Un nouveau titre',
          en: 'A new title'
        }
      } );

      await svc.legacy.update( { uid } );

      const eventTranslations = await knex( config.legacy.schemas.eventTranslation ).select().where( { id: legacyEventRecord.id } );

      eventTranslations.length.should.equal( 2 );

      _.head( eventTranslations.filter( t => t.lang === 'en' ) ).title.should.equal( 'A new title' );

    } );

    it( 'transfer updates base legacy event entry', async () => {

      await svc.update( { uid }, { slug: 'a-new-slug' } );

      await svc.legacy.update( { uid } );

      const eventEntry = await knex( config.legacy.schemas.event ).first().where( { uid } );

      eventEntry.slug.should.equal( 'a-new-slug' );

    } );

    it( 'transfer to legacy structure updates keywords', async () => {

      const newKeywords = [ 'un', 'deux', 'trois', 'nous allons', 'à la mort' ];

      await svc.update( { uid }, { keywords: {
        fr: newKeywords
      } } );

      await svc.legacy.update( { uid } );

      const eventEntry = await knex( config.legacy.schemas.event ).first().where( { uid } );

      const eventTranslationEntry = await knex( config.legacy.schemas.eventTranslation ).first().where( {
        id: eventEntry.id
      } );

      eventTranslationEntry.tags.should.equal( 'un, deux, trois, nous allons, à la mort' );

    } );

    it( 'transfer to legacy replaces occurrences', async () => {

      // these are the timings now.
      await svc.update( { uid }, { timings: [ {
        begin: new Date( '2017-12-26T03:00:00+0100' ),
        end: new Date( '2017-12-26T12:00:00+0100' )
      } ] } );

      const result = await svc.legacy.update( { uid } );

      const occurrenceEntries = await knex( config.legacy.schemas.occurrence ).where( { event_id: eventId } );

      occurrenceEntries.length.should.equal( 1 );

      _.pick( occurrenceEntries[ 0 ], [ 'time_start', 'time_end' ] )

        .should.eql( {
          time_start: '03:00:00',
          time_end: '12:00:00'
        } );

      JSON.stringify( occurrenceEntries[ 0 ].date ).should.eql( '"2017-12-26T00:00:00.000Z"' );

    } );

    it( 'update refreshes references', async () => {

      await svc.update( { uid }, { references: [ 39592710,85595460 ] } );

      await svc.legacy.update( { uid } );

      const agendaEventReferences = await knex( config.legacy.schemas.eventReferences )
        .select( 'agenda_id', 'event_id', 'ref_event_id' )
        .where( 'event_id', eventId );

      agendaEventReferences.map( r => _.omit( r, [] ) ).should.eql( [
        { event_id: 146447, agenda_id: 4917, ref_event_id: 147274 },
        { event_id: 146447, agenda_id: 4917, ref_event_id: 147289 }
      ] );

    } );

    it( 'update pushes links to legacy store', async () => {

      await svc.update( { uid }, {
        links: [ {
          link: "https://www.youtube.com/watch?v=c1kNwDfBrLY",
          data:{
            url:"https://www.youtube.com/watch?v=c1kNwDfBrLY",
            type: "video",
            version:"1.0",
            title:"Ultra Vomit - ÉVIER METAL - [Clip Eau-fficiel / Water-ficial Video]",
            author:"Ultra Vomit",
            author_url: "https://www.youtube.com/channel/UCT-_mRYXh-Kubtu_3WTXYhQ",
            provider_name:"YouTube",
            description:"Un évier légendaire. Une quête périlleuse. Un jeu de mot tout pourri. Le nouveau clip d'Ultra Vomit est là !\n\nExtrait de l'album \"Panzer Surprise !\" : http://ultravomit.lnk.to/PanzerSurprise\n\nOlympia COMPLET le 13 octobre 2018 ! \n\nPoke Ultra Vomit ici : http://www.facebook.com/ultravomitofficiel\n\nRetrouvez la version karaoké de ce tube de légende ici : https://youtu.be/YFT_yxtDsus\n\n*************************\n\nLes paroles :\n\nLe robinet\nFait couler l'eau\nL'évacuation\nÉvacue l'eau\nS'brosser les dents\nFaire sa toilette\nPisser dedans\nAvec sa quéquette\n\nAu beau milieu de la nuit\nQuand j'me réveille\nEt que j'veux boire\nIl est toujours là pour moi\nPour étancher mon désespoir\n\nIl m'éclaire quand il brille dans la nuit\nÉvier métal !\n\nIl m'éclaire quand il brille dans la nuit\n(Oooohooooohoooo)\nMon évier de minuit\n(Oooohooooohoooo)\n\nAu beau milieu de la nuit\nQuand j'me réveille et que j'veux boire\nIl est toujours là pour moi\nPour étancher mon désespoir\n\nAu beau milieu de la nuit\nQuand j'me réveille et que j'veux boire\nIl est toujours là pour moi\nÉvier métal\n\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier… métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier… métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier… métal\nÉvier métal\nÉvier métal\nÉvier…\n\nMétal !\n\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier mét… hé merde !\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\nÉvier métal\n…\n\nwww.ultra-vomit.com",
            thumbnail_url:"https://i.ytimg.com/vi/c1kNwDfBrLY/maxresdefault.jpg",
            thumbnail_width: 1280,
            thumbnail_height:720,
            html:"<div style=\"left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.2493%;\"><iframe src=\"https://www.youtube.com/embed/c1kNwDfBrLY?rel=0&amp;showinfo=0\" style=\"border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;\" allowfullscreen scrolling=\"no\"></iframe></div>",
            cache_age:86400
          },
          type:"oembed"
        } ]
      } );

      await svc.legacy.update( { uid } );

      const eventEntry = await knex( config.legacy.schemas.event ).first( 'store' ).where( { uid } );

      _.get( JSON.parse( eventEntry.store ).links, '0.link' ).should.equal( 'https://www.youtube.com/watch?v=c1kNwDfBrLY' );

      _.get( JSON.parse( eventEntry.store ).links, '0.code' ).should.equal( '<div style=\"left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.2493%;\"><iframe src=\"https://www.youtube.com/embed/c1kNwDfBrLY?rel=0&amp;showinfo=0\" style=\"border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;\" allowfullscreen scrolling=\"no\"></iframe></div>' );

    } );

    it( 'legacy event can be removed altogether', async () => {

      await svc.legacy.update( { uid: 2875149 } );

      const result = await svc.legacy.remove( { uid: 2875149 } );

      result.should.eql( {
        success: true,
        deleted: 1,
        insertedInDeletedLog: true
      } );

    } );

  } );

  describe( 'other', () => {

    it( 'deleted legacy event records entry in legacy deleted table', async () => {

      const uid = 2875149;

      await svc.legacy.update( { uid } );

      await svc.legacy.remove( { uid } );

      const deletedLog = await knex( config.legacy.schemas.deleted ).first().where( { type: 'Event', uid } );

      _.keys( deletedLog ).should.eql( [ 'id', 'uid', 'type', 'deleted_at', 'store', 'deleted_id' ] );

      _.pick( deletedLog, [ 'uid', 'type' ] ).should.eql( {
        uid,
        type: 'Event'
      } );

    } );


    it( 'transfer to legacy can be done after a create', async () => {

      const { event } = await svc.create( {
        title: { fr: 'Kevin fait de l\'install' },
        timings: [ {
          begin: new Date,
          end: new Date
        } ],
        locationUid: 67886698
      }, {
        transferToLegacy: true
      } );

      const legacyEvent = _.first( await wn.call( svc.legacy.get, { uid: event.uid } ) );

      legacyEvent.uid.should.equal( event.uid );

    } );


    it( 'transfer to legacy is not done after a create if option is not explicited', async () => {

      const { event } = await svc.create( {
        title: { fr: 'Kevin fait encore de l\'install' },
        timings: [ { begin: new Date, end: new Date } ],
        locationUid: 67886698
      } );

      const legacyEvent = _.first( await wn.call( svc.legacy.get, { uid: event.uid } ) );

      should( legacyEvent ).equal( undefined );

    } );


    it( 'transfer to legacy can be done after an update', async () => {

      const uid = 2875149;

      await svc.legacy.update( { uid } ); // ensure the event is updated in legacy

      await svc.update( { uid }, {
        title: {
          en: 'Naaaaa ssivenniaaaa ababi dimanaaa'
        }
      }, { transferToLegacy: true } );

      const legacyEvent = _.first( await wn.call( svc.legacy.get, { uid } ) );

      legacyEvent.title.en.should.equal( 'Naaaaa ssivenniaaaa ababi dimanaaa' );

    } );


    it( 'accessibility field is a stringified array in a legacy model', async () => {

      const uid = 2875149;

      await svc.legacy.update( { uid } ); // ensure the event is updated in legacy

      await svc.update( { uid }, {
        accessibility: {
          mi: true
        }
      }, { transferToLegacy: true } );

      const record = await knex( config.legacy.schemas.event ).first().where( { uid } );

      record.accessibility.should.equal( '["mi"]' );

    } );


    it( 'transfer to legacy is not done after an update by default', async () => {

      const uid = 2875149;

      await svc.legacy.update( { uid } ); // ensure the event is updated in legacy

      await svc.update( { uid }, {
        title: {
          en: 'When the sun rises high in the safire sky'
        }
      } );

      const legacyEvent = _.first( await wn.call( svc.legacy.get, { uid } ) );

      legacyEvent.title.should.not.eql( { en: 'When the sun rises high in the safire sky' } );

    } );


    it( 'a delete does not transfer to legacy unless option is set', async () => {

      const uid = 59481036;

      const result = await svc.legacy.update( { uid } ); // ensure event is present in legacy

      await svc.remove( { uid } );

      const deletedLog = await knex( config.legacy.schemas.deleted ).first().where( { type: 'Event', uid } );

      should( deletedLog ).equal( undefined );

    } );


    it( 'transfer to legacy can be done after a delete', async () => {

      const uid = 2875149;

      await svc.legacy.update( { uid } ); // ensure event is present in legacy

      await svc.remove( { uid }, { transferToLegacy: true } );

      const deletedLog = await knex( config.legacy.schemas.deleted ).first().where( { type: 'Event', uid } );

      deletedLog.uid.should.equal( uid );

    } );

  } );

} );
