"use strict";

process.env.NODE_ENV = 'test';

var should = require( 'should' ),

config = require( '../testconfig' ),

fixtures = require( './fixtures' ),

dbUtils = require( '../service/dbUtils' ),

mysql = require( 'mysql' ),

knexLib = require( 'knex' ),

w = require( 'when' );

describe( 'agenda-stakeholders', function() {

  describe( 'dbUtils', function() {
    
    this.timeout( 30000 );

    before( done => {

      fixtures.init( config );

      fixtures( done );

    } );

    before( () => { 

      dbUtils.init( {
        knex: knexLib( {
          client: 'mysql',
          connection: config.mysql
        } ),
        schemas: config.schemas
      } );

    } );


    it( 'getStakeholder - finds', done => {

      w( {
        user: { id: 7744 },
        agenda: { id: 4608 },
        stakeholder: null
      } )

      .then( dbUtils.getStakeholder( 'agenda', 'user', 'stakeholder' ) )

      .done( v => {

        v.stakeholder.should.eql( {
          userId: 7744,
          agendaId: 4608,
          credential: 1,
          organization: 
           { label: 'Arboretum des Grandes Bruyères',
             slug: 'arboretum-des-grandes-bruyeres' },
          contactNumber: '0238571261',
          contactName: 'Marie DEGAEY',
          contactPosition: 'Chargée de développement touristique' 
        } );

        done();

      } );

    } );


    it( 'updateAgendaEvent - updates', done => {

      w( {
        event: { id: 82159 },
        agenda: { id: 4608 },
        stakeholder: {
          userId: 3333
        }
      } )

      .then( dbUtils.updateAgendaEvent( 'agenda', 'event', 'stakeholder' ) )

      .done( v => {

        let con = mysql.createConnection( config.mysql );

        con.query( 'select user_id from agenda_event where event_id = ? and review_id = ?', [ 82159, 4608 ], ( err, rows ) => {

          rows[ 0 ].user_id.should.equal( 3333 );

          con.end();

          done();

        } )

      } );

    } );


    it( 'getAgendaEvent - finds', done => {

      w( {
        event: { id: 81824 },
        agenda: { id: 4608 },
        agendaEvent: null
      } )

      .then( dbUtils.getAgendaEvent( 'agenda', 'event', 'agendaEvent' ) )

      .done( v => {

        v.agendaEvent.should.eql( {
          id: 436513,
          userId: 7349
        } );

        done();

      } );

    } );
    

    it( 'getEvent - does not find', done => {

      w( {
        eventId: { id: 320932 },
        event: null
      } )

      .then( dbUtils.getEvent( 'eventId', 'event' ) )

      .done( v => {

        should( v.event ).equal( null );

        done();

      } );

    } );


    it( 'getEvent - finds', done => {

      w( {
        eventId: { id: 81296 },
        event: null
      } )

      .then( dbUtils.getEvent( 'eventId', 'event' ) )

      .done( v => {

        v.event.should.eql( {
          id: 81296,
          ownerId: 3083,
          slug: 'visite-commentee-du-parc'
        } );

        done();

      } );

    } );

  } );


} );