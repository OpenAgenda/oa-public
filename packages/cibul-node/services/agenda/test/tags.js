"use strict";

process.env.NODE_ENV = 'test';

var should = require( 'should' ),

model = require( '../../model' ),

es = require( '../../elasticsearch' ),

eventSvc = require( '../../event' ),

agendaSvc = require( '../' );

describe( 'agenda service tags interface', function() {

  this.timeout( 20000 );

  var a = {}, events = [], tags, eventTags;

  before( model.fixtureSets.prepareOneAgendaInstance( a, 'la-gargouille' ) );

  before( done => {

    a.events.list( {}, ( err, e ) => {

      events = e;

      done();

    } );

  } );

  before( done => {

    // create a bunch of tags
    model.lib.query( 
      `insert into review_tag ( review_id, tag, slug ) values 
       ( ${a.id}, 'table', 'table' ),
       ( ${a.id}, 'shoe', 'shoe' ),
       ( ${a.id}, 'politics', 'politics' ),
       ( ${a.id}, 'lindsay', 'lohan' )
    `, ( err, result ) => {

      // associate them with events
      model.lib.query( 'select * from review_tag', ( err, rt ) => {

        tags = rt;

        model.lib.query( 'select * from review_article', ( err, ra ) => {

          eventTags = ra;

          model.lib.query( 
            `insert into review_tag_article ( review_tag_id, review_article_id ) values 
             ( ${rt[ 0 ].id}, ${ra[ 0 ].id} ),
             ( ${rt[ 1 ].id}, ${ra[ 1 ].id} ),
             ( ${rt[ 2 ].id}, ${ra[ 2 ].id} )
            `, ( err, result ) => {

            done();

          } );

        } );

      } );

    });

  });

  before( done => {

    es.resync( { reset: true }, done );

  } );

  afterEach( () => {

    eventSvc.instanciate.test.setOnRefresh( false );

    agendaSvc.instanciate.test.setOnRefresh( false );

  });

  it( 'if a tag is removed, events which were associated with it must be refreshed', done => {

    model.lib.query( 'delete from review_tag where id = ?', tags[ 1 ].id, err => {

      eventSvc.instanciate.test.setOnRefresh( eventId => {

        eventId.should.equal( eventTags[ 1 ].event_id );

        done();

      });

      agendaSvc.tags.agendaTagsChanged( a.id, {
        removed: [ { slug: 'shoe' } ]
      });

    } );

  } );

  it( 'if a tag is updated, events associated with this tag must be refreshed', done => {

    model.lib.query( 'update review_tag set slug = ?, tag = ? where id = ?', [ 'wetsock', 'wet sock', tags[ 0 ].id ], err => {

      eventSvc.instanciate.test.setOnRefresh( eventId => {

        eventId.should.equal( eventTags[ 0 ].event_id );

        done();

      } );

      agendaSvc.tags.agendaTagsChanged( a.id, {
        updated: [ { previousSlug: 'table' } ]
      });

    } );

  } );


  it( 'if a tag is whatever, agenda must be refreshed', done => {

    agendaSvc.instanciate.test.setOnRefresh( agendaId => {

      agendaId.should.equal( a.id );

      done();

    });

    agendaSvc.tags.agendaTagsChanged( a.id, {
      inserted: []
    } );

  } );

} );