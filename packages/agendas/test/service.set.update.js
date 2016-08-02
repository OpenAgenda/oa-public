"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' ),

svc = require( '../service/test' ),

config = require( '../testconfig' );

describe( 'service.set: update an agenda', function() {

  this.timeout( 30000 );

  before( () => {
    svc.init( config );
  } );

  before( svc.test.fixtures );

  it( 'set sets a pre-exisiting agenda if identifier is given as first parameter', done => {

    svc.set( 4875, {
      title: 'Le Frometon'
    }, ( err, result ) => {

      should( err ).equal( null );

      result.agenda.should.eql( {
        slug: 'programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016',
        uid: 52084961,
        title: 'Le Frometon',
        description: 'Des animations pour des expériences autour du goût et des savoir-faire / Numerous events to have experiences around taste and know-how',
        url: 'http://www.salon-fromage.com/',
        settings: null,
        updatedAt: result.agenda.updatedAt,
        createdAt: result.agenda.createdAt
      } );

      done();

    } );

  } );

  it( 'set credentials on pre-exisiting agenda', done => {

    svc.set( { uid: 65903437 }, {
      credentials: {
        moderators: true
      }
    }, {
      internal: true // to retrieve credentials after update
    }, ( err, result ) => {

      should( err ).equal( null );

      result.should.eql( { 
        agenda: { 
          id: 4887,
          ownerId: 7388,
          slug: 'agenda_culturel_auvergne',
          uid: 65903437,
          title: 'Agenda culturel Auvergne',
          description: 'test ! :)',
          url: '',
          settings: null,
          updatedAt: result.agenda.updatedAt,
          createdAt: result.agenda.createdAt,
          credentials: { 
            moderators: true,
            tags: false,
            embedsHead: false,
            embedsTemplates: false 
          } 
        },
        valid: true,
        success: true,
        errors: [] 
      } );


      done();

    } );

  } );

} );