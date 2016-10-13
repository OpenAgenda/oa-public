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

  afterEach( () => {
    svc.init( config ); // reset interfaces
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
        image: 'review_programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016_00.jpg',
        url: 'http://www.salon-fromage.com/',
        settings: {
          contribution: {
            defaultState: 2,
            message: null,
            type: 0,
            useFields: false
          }
        },
        updatedAt: result.agenda.updatedAt,
        createdAt: result.agenda.createdAt,
        official: 0
      } );

      done();

    } );

  } );
  

  it( 'set by slug works too', done => {

    svc.set( { slug: 'programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016' }, {
      official: true
    }, ( err, result ) => {

      should( err ).equal( null );

      result.agenda.official.should.equal( 1 ); // because I don't clean at db read

      done();

    } );

  } );


  it( 'set without internal option returns an updated agenda that excludes internal fields', done => {

    svc.set( 4875, { title: 'Booyah' }, ( err, result ) => {

      should( result.agenda.id ).equal( undefined );

      done();

    } );

  } );


  it( 'set with internal option set to true returns an updated agenda that includes internal fields', done => {

    svc.set( 4875, { title: 'Boom.' }, { internal: true }, ( err, result ) => {

      should( result.agenda.id ).equal( 4875 );

      done();

    } );

  } );


  it( 'set with includeImagePath to true returns an updated agenda that includes image paths', done => {

    svc.set( 4875, { title: 'Le mur' }, { includeImagePath: true }, ( err, result ) => {

      result.agenda.image.should.equal( '//openagendatst.s3.amazonaws.com/review_programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016_00.jpg' );

      done();

    } );

  } );


  it( 'set slug', done => {

    svc.set( { slug: 'programme-des-animations-du-salon-du-fromage-et-des-produits-laitiers-2016' }, {
      slug: 'lait'
    }, ( err, result ) => {

      should( err ).equal( null );

      result.agenda.slug.should.equal( 'lait' );

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

      should( err ).equal( null )

      result.should.eql( { 
        agenda: { 
          id: 4887,
          ownerId: 7388,
          slug: 'agenda-culturel-auvergne',
          uid: 65903437,
          official: 0,
          title: 'Agenda culturel Auvergne',
          description: 'test ! :)',
          url: '',
          image: null,
          settings: {
            contribution: {
              defaultState: 2,
              message: null,
              type: 0,
              useFields: false
            }
          },
          updatedAt: result.agenda.updatedAt,
          createdAt: result.agenda.createdAt,
          credentials: {
            activatingInvitations: false,
            emailstrategie: false,
            moderators: true,
            tags: false,
            embedsHead: false,
            embedsTemplates: false,
            indesign: false
          } 
        },
        valid: true,
        success: true,
        errors: [] 
      } );


      done();

    } );

  } );


  it( 'onUpdate callbacks with agenda data before and after update', done => {

    svc.init( Object.assign( {}, config, {
      interfaces: {
        onUpdate: ( before, after ) => {

          before.settings.contribution.useFields.should.equal( false );

          after.settings.contribution.useFields.should.equal( true );

          done();

        }
      }
    } ) );

    svc.set( 4830, {
      settings: {
        contribution: {
          useFields: true
        }
      }
    }, () => {} );

  } );


  it( 'onUpdate callbacks with agenda data that includes internal fields', done => {

    svc.init( Object.assign( {}, config, {
      interfaces: {
        onUpdate: ( before, after ) => {

          should( before.id ).equal( 4830 );

          should( after.id ).equal( 4830 );

          done();

        }
      }
    } ) );

    svc.set( 4830, {
      title: 'Blaaargh'
    }, () => {} );

  } );

} );