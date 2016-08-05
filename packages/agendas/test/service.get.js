"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' ),

svc = require( '../service/test' ),

config = require( '../testconfig' );

describe( 'get', function() {

  this.timeout( 30000 );

  before( () => {
    svc.init( config );
  } );

  before( svc.test.fixtures );

  it( 'get gets an agenda by id', done => {

    svc.get( 4875, ( err, agenda ) => {

      should( err ).equal( null );

      agenda.should.eql( {
        slug: 'programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016',
        uid: 52084961,
        title: 'Programme des animations du Salon du Fromage et des Produits Laitiers 2016',
        description: 'Des animations pour des expériences autour du goût et des savoir-faire / Numerous events to have experiences around taste and know-how',
        url: 'http://www.salon-fromage.com/',
        image: 'review_programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016_00.jpg',
        settings: null,
        createdAt: agenda.createdAt,
        updatedAt: agenda.updatedAt,
        verified: 0
      } );

      done();

    } );

  } );

  it( 'get gets an agenda with details', done => {

    svc.get( 4848, { detailed: true }, ( err, agenda ) => {

      should( err ).equal( null );

      agenda.publishedEvents.should.equal( 10 );
      agenda.upcomingPublishedEvents.should.equal( 8 );

      done();

    } );

  } );

  it( 'get gets an agenda by slug', done => {

    svc.get( { slug: 'epn-espace-torcy' }, ( err, agenda ) => {

      should( err ).equal( null );

      agenda.should.eql( { 
        slug: 'epn-espace-torcy',
        uid: 94345899,
        title: 'EPN "Espace Torcy"',
        description: 'Agenda de l\'EPN "Espace Torcy"\r\n2 rue de Torcy 75018 Paris\r\nTél : 01 40 38 67 00\r\nEmail : epn@ensparis.fr',
        url: 'http://www.ensparis.fr',
        settings: null,
        image: 'review_epn-espace-torcy_00.jpg',
        createdAt: agenda.createdAt,
        updatedAt: agenda.updatedAt,
        verified: 0
      } );

      done();

    } );

  } );

  it( 'get with internal option gets internal data like credentials and id', done => {

    svc.get( { uid: 94345899 }, { internal: true }, ( err, agenda ) => {

      should( err ).equal( null );

      agenda.should.eql( {
        id: 4830,
        ownerId: 7228,
        slug: 'epn-espace-torcy',
        uid: 94345899,
        title: 'EPN "Espace Torcy"',
        description: 'Agenda de l\'EPN "Espace Torcy"\r\n2 rue de Torcy 75018 Paris\r\nTél : 01 40 38 67 00\r\nEmail : epn@ensparis.fr',
        url: 'http://www.ensparis.fr',
        image: 'review_epn-espace-torcy_00.jpg',
        settings: null,
        credentials: null,
        createdAt: agenda.createdAt,
        updatedAt: agenda.updatedAt,
        verified: 0
      } );

      done();

    } );

  } );

} );