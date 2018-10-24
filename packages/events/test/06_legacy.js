"use strict";

const mysql = require( 'mysql' );
const should = require( 'should' );

const svc = require( './service' );
const config = require( '../testconfig' );

describe( 'events - functional (server): legacy bridge', function() {

  this.timeout( 60000 );

  beforeEach( done => {

    svc.initAndLoad( config, [
      config.schemas.event + '_empty', // load empty event data set
      config.legacy.schemas.event,
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

  afterEach( svc.shutdown );

  it( 'get', done => {

    svc.legacy.get( 147621, ( err, event, result ) => {

      should( err ).equal( null );

      result.valid.should.equal( true );

      event.should.eql( { 
        id: 147621,
        uid: 27434489,
        ownerUid: 63492667,
        creatorUid: 63492667,
        agendaUid: 48959239,
        image: {
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
        },
        private: true,
        slug: 'indoor-de-paris-cso-pro-1',
        locationUid: 46785382,
        title: { fr: 'Indoor de Paris - CSO Pro 1' },
        description: { fr: 'Epreuve de Saut d\'Obstacles Pro 1' },
        longDescription: { fr: 'Lors de cette épreuve **50 couples de cavaliers professionnel **prendront le départ de deux parcours d\'obstacles de 1m40 et 1m45.\n\nL\'objectif pour les concurrents est d\'effectuer deux parcours sans faute et le plus rapidement possible.\n\nVous ne connaissez pas la compétition de saut d\'obstacles? Pas de panique le règlement est simple, vous vous prendrez au jeu facilement !\n\nVous pourrez apprécier **la franchise, la puissance, l\'adresse, la rapidité **et le respect du cheval ainsi que la qualité d\'équitation du cavalier.\n\nLa compétition se déroulera en deux manches:\n\n*   **Etape 1** :\n\nBarème A au chrono sans barrage\n\nHauteur : 1,40 m\n\n50 partants\n\nLundi 28/11: 14h30 - 16h30\n\n*   **Etape 2** : Finale\n\nSuper 10, option B\n\nHauteur : 1,45 m\n\n50 partants\n\nMardi 29/11: 10h00 - 12h00\n\n**Secteur**\n\nHall 5a - Carrière Fédérale' },
        keywords: { fr: [ 'CSO', 'epreuves', 'indoor de paris', 'pro' ] },
        conditions: {
          fr: 'Entrée pas chère',
          en: 'Cheap entrance'
        },
        draft: false,
        registration: [
          'email@website.com',
          '0123456789'
        ],
        references: [],
        accessibility: {
          hi: true,
          mi: true,
          pi: false,
          sl: true,
          vi: false
        },
        fileKey: 'reai4iufo57yuqo3fdy6qqoi5fy3iqo',
        timezone: 'Europe/Paris',
        timings: [ { 
          begin: event.timings[ 0 ].begin,
          end: event.timings[ 0 ].end 
        }, {
          begin: event.timings[ 1 ].begin,
          end: event.timings[ 1 ].end
        } ],
        age: { min: null, max: null },
        updatedAt: event.updatedAt,
        createdAt: event.createdAt,
        deletedAt: null
      } );

      done();

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

    svc.legacy.transfer( 147621, ( err, result ) => {

      result.transferred.should.equal( true );
      result.valid.should.equal( true );

      let con = mysql.createConnection( config.mysql );

      con.query( 'select * from event', ( err, rows ) => {

        con.end();

        // there is only one event
        rows.length.should.equal( 1 );

        [ 'uid', 'slug' ].forEach( f => {

          rows[ 0 ][ f ].should.equal( result.event[ f ] );

        } );

        done();

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

    svc.legacy.transfer( 147621, ( err, result ) => {

      result.created.should.equal( true );

      svc.legacy.transfer( 147621, { force: true }, ( err, result ) => {

        result.created.should.equal( false );

        let con = mysql.createConnection( config.mysql );

        con.query( 'select * from event', ( err, rows ) => {

          rows.length.should.equal( 1 );

          con.end();

          done();

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
