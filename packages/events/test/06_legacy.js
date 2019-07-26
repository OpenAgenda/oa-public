"use strict";

const _ = require( 'lodash' );
const mysql = require( 'mysql' );
const should = require( 'should' );

const svc = require( './service' );
const config = require( '../testconfig' );

describe( 'events - functional (server): legacy bridge', function() {

  this.timeout( 60000 );

  before( done => {

    svc.initAndLoad( config, [
      config.schemas.event + '_empty', // load empty event data set
      config.legacy.schemas.event,
      config.legacy.schemas.occurrence,
      config.legacy.schemas.eventTranslation,
      config.legacy.schemas.location,
      config.legacy.schemas.eventLocation,
      config.legacy.schemas.eventLocationTranslation,
      config.legacy.schemas.agendaEvent,
      config.legacy.schemas.eventReferences,
      config.legacy.schemas.user,
      config.legacy.schemas.agenda
    ], { reset: true }, done );

  } );

  after( svc.shutdown );

  describe( 'get', () => {

    let event, result, err;

    before( done => {

      svc.legacy.get( 147621, ( e, ev, r ) => {

        err = e;
        event = ev;
        result = r;

        done();

      } );

    } );

    it( 'error is null', () => {

      should( err ).equal( null );

    } );

    it( 'third arg gives valid bool', () => {

      result.valid.should.equal( true );

    } );

    it( 'image is given as deep structure with variants', () => {

      event.image.should.eql( {
        filename: 'event_indoor-de-paris-cso-pro-1_563851.jpg',
        credits: '@gaetan 2017',
        size: {
          height: null,
          width: null
        },
        variants: [ {
          "filename": "evfevent_indoor-de-paris-cso-pro-1_563851.jpg",
          "size": {
            "height": null,
            "width": null
          },
          "type": "full"
        }, {
          "filename": "evtbevent_indoor-de-paris-cso-pro-1_563851.jpg",
          "size": {
            "height": null,
            "width": null
          },
          "type": "thumbnail"
        } ]
      } );

    } );

    it( 'id, uid, ownerUid, creatorUid, agendaUid, slug, locationUid, private and draft values are fetched', () => {

      _.pick( event, [
        'id', 'uid', 'ownerUid', 'creatorUid', 'agendaUid', 'slug', 'locationUid', 'private', 'draft'
      ] ).should.eql( {
        id: 147621,
        uid: 27434489,
        ownerUid: 63492667,
        creatorUid: 63492667,
        agendaUid: 48959239,
        slug: 'indoor-de-paris-cso-pro-1',
        locationUid: 46785382,
        private: true,
        draft: false
      } );

    } );

    it( 'title, description, longDescription, keywords and conditions are fetched', () => {

      _.pick( event, [
        'title', 'description', 'longDescription', 'keywords', 'conditions'
      ] ).should.eql( {
        title: { fr: 'Indoor de Paris - CSO Pro 1' },
        description: { fr: 'Epreuve de Saut d\'Obstacles Pro 1' },
        longDescription: { fr: 'Lors de cette épreuve **50 couples de cavaliers professionnel **prendront le départ de deux parcours d\'obstacles de 1m40 et 1m45.\n\nL\'objectif pour les concurrents est d\'effectuer deux parcours sans faute et le plus rapidement possible.\n\nVous ne connaissez pas la compétition de saut d\'obstacles? Pas de panique le règlement est simple, vous vous prendrez au jeu facilement !\n\nVous pourrez apprécier **la franchise, la puissance, l\'adresse, la rapidité **et le respect du cheval ainsi que la qualité d\'équitation du cavalier.\n\nLa compétition se déroulera en deux manches:\n\n*   **Etape 1** :\n\nBarème A au chrono sans barrage\n\nHauteur : 1,40 m\n\n50 partants\n\nLundi 28/11: 14h30 - 16h30\n\n*   **Etape 2** : Finale\n\nSuper 10, option B\n\nHauteur : 1,45 m\n\n50 partants\n\nMardi 29/11: 10h00 - 12h00\n\n**Secteur**\n\nHall 5a - Carrière Fédérale' },
        keywords: { fr: [ 'CSO', 'epreuves', 'indoor de paris', 'pro' ] },
        conditions: { fr: 'Entrée pas chère', en: 'Cheap entrance' }
      } );

    } );

    it( 'registration, accessibility, fileKey, timezone are fetched', () => {

      _.pick( event, [
        'registration', 'accessibility', 'fileKey', 'timezone'
      ] ).should.eql( {
        registration: [
          'email@website.com',
          '0123456789'
        ],
        accessibility: {
          hi: true,
          mi: true,
          pi: false,
          sl: true,
          vi: false
        },
        fileKey: 'reai4iufo57yuqo3fdy6qqoi5fy3iqo',
        timezone: 'Europe/Paris'
      } );
    } );

    it( 'references are fetched', () => {

      event.references.should.eql( [ 8896333, 31259734 ] );

    } );

    it( 'oembed links are assembled', () => {

      event.links.should.eql( [ {
        link: 'http://vimeo.com/24043834',
        data: {
          html: '<div style="left: 0; width: 100%; height: 0; position: relative; padding-bottom: 56.6669%;"><iframe src="https://player.vimeo.com/video/24043834?byline=0&amp;badge=0&amp;portrait=0&amp;title=0" style="border: 0; top: 0; left: 0; width: 100%; height: 100%; position: absolute;" allowfullscreen scrolling="no"></iframe></div>',
          url: 'http://vimeo.com/24043834'
        },
        type: 'oembed'
      } ] );

    } );

  } );


  it( 'legacy event with multilingual field including null values is cleaned and transferred', done => {

    svc.legacy.transfer( { uid: 31937842 }, ( err, result ) => {

      result.transferred.should.equal( true );

      result.errors.length.should.equal( 0 );

      should( result.event.keywords.fr ).eql( [] );

      done();

    } );

  } );


  it( 'get - a slug with a * is accepted ( but discouraged )', done => {

    svc.legacy.get( { uid: 14186767 }, ( err, event, result ) => {

      result.valid.should.equal( true );

      done();

    } );

  } );


  it( 'get - invalid registration entry is filtered out', done => {

    svc.legacy.get( { uid: 13340145 }, ( err, event, result ) => {

      result.valid.should.equal( true );

      event.registration.should.eql( [] );

      done();

    } );

  } );


  describe( 'transfer from legacy to event service', () => {

    before( async () => {

      await svc.remove( 147601 );

    } );

    it( 'transfer of event with title of length 1 is possible', done => {

      svc.legacy.transfer( { uid: 63838043 }, ( err, result ) => {

        should( err ).equal( null );

        result.transferred.should.equal( true );

        done();

      } );

    } );


    it( 'uid is maintained during transfer', done => {

      svc.legacy.transfer( { uid: 27434489 }, ( err, result ) => {

        result.transferred.should.equal( true );

        result.event.uid.should.equal( 27434489 );

        result.created.should.equal( true );

        done();

      } );

    } );


    it( 'transfer of an unpublished event does not impact draft state of event', done => {

      svc.legacy.transfer( 147601, ( err, result ) => {

        result.created.should.equal( true );

        result.event.draft.should.equal( 0 );

        done();

      } );

    } );


    it( 'transfer of an event from a private agenda sets a private event', done => {

      svc.legacy.transfer( 147621, ( err, result ) => {

        result.event.private.should.equal( 1 );

        done();

      } );

    } );

    it( 'transfer of an event with file_key set sets the fileKey', done => {

      svc.legacy.transfer( 147621, ( err, result ) => {

        result.event.fileKey.should.equal( 'reai4iufo57yuqo3fdy6qqoi5fy3iqo' );

        done();

      } );

    } );


    it( 'transfer of an event from a public agenda sets a public event', done => {

      svc.legacy.transfer( 147618, ( err, result ) => {

        result.event.private.should.equal( 0 );

        done();

      } );

    } );


    // 147598 has no title
    it( 'transfer of an incomplete published event sets a draft event', done => {

      svc.legacy.transfer( 147598, ( err, result ) => {

        result.event.draft.should.equal( 1 );

        done();

      } );

    } );

    it( 'transfer provides draft evaluation in complete key of result object', done => {

      svc.legacy.transfer( 147598, ( err, result ) => {

        result.event.draft.should.equal( 1 );

        result.complete.should.eql( {
          isComplete: false,
          errors: [ {
            field: 'title',
            code: 'required',
            message: 'at least one language entry is required',
            origin: {}
          } ] }
        );

        done();

      } );

    } );


    it( 'transfer of a complete published event sets an undrafted (published) event', done => {

      svc.legacy.transfer( 147580, ( err, result ) => {

        result.event.draft.should.equal( 0 );

        done();

      } );

    } );


    it( 'transfer of an event updates the ownerUid', done => {

      svc.legacy.transfer( 147580, ( err, result ) => {

        let con = mysql.createConnection( config.mysql );

        // change owner
        con.query( 'update legacy_event set owner_id = ?, updated_at = ? where id = ?', [ 2537, new Date(), 147580 ], ( err, rows ) => {

          svc.legacy.transfer( 147580, ( err, result ) => {

            con.query( 'select * from event where uid = ?', 10932458, ( err, rows ) => {

              rows[ 0 ].owner_uid.should.equal( 21815784 );

              con.end();

              done();

            } );

          } );

        } );

      } );

    } );


    it( 'transfer adds a record in new schema', done => {

      const con = mysql.createConnection( config.mysql );

      con.query( 'select * from event', ( err, rows ) => {

        const before = rows.length;

        svc.legacy.transfer( 147612, ( err, result ) => {

          result.transferred.should.equal( true );
          result.valid.should.equal( true );

          con.query( 'select * from event', ( err, rows ) => {

            con.end();

            rows.length.should.equal( before + 1 );

            done();

          } );

        } );

      } );

    } );

    it( 'second transfer is an update', done => {

      svc.legacy.transfer( 147621, ( err, result ) => {

        svc.update( { uid: result.event.uid }, { title: { fr: 'Changed!' } }, err => {

          svc.get( { uid: result.event.uid }, { private: null }, ( err, event ) => {

            event.title.fr.should.equal( 'Changed!' );

            svc.legacy.transfer( 147621, { force: true }, ( err, result ) => {

              result.transferred.should.equal( true );

              result.created.should.equal( false );

              result.event.title.fr.should.equal( 'Indoor de Paris - CSO Pro 1' );

              done();

            } );

          } );

        } );

      } );

    } );

    it( 'second transfer does not add an additional entry in db', done => {

      svc.legacy.transfer( 147605, ( err, result ) => {

        result.created.should.equal( true );

        const con = mysql.createConnection( config.mysql );

        con.query( 'select * from event', ( err, rows ) => {

          const before = rows.length;

          svc.legacy.transfer( 147605, { force: true }, ( err, result ) => {

            result.created.should.equal( false );

            con.query( 'select * from event'  , ( err, rows ) => {

              rows.length.should.equal( before );

              con.end();

              done();

            } );

          } );

        } );

      } );

    } );

    it( 'second transfer does not occur unless forced or legacy has a later updatedAt value', done => {

      svc.legacy.transfer( 147621, ( err, result ) => {

        const eventUid = result.event.uid;

        svc.update( { uid: eventUid }, { title: { fr: 'Changed!' } }, ( err, result ) => {

          svc.get( { uid: eventUid }, { private: null }, ( err, event ) => {

            event.title.fr.should.equal( 'Changed!' );

            svc.legacy.transfer( 147621, ( err, result ) => {

              result.success.should.equal( true );

              result.transferred.should.equal( false );

              result.created.should.equal( false );

              done();

            } );

          } );

        } );

      } );

    } );

  } );

} );
