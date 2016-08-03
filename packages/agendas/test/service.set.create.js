"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' ),

svc = require( '../service/test' ),

config = require( '../testconfig' );

describe( 'service.set: create an agenda', function() {

  this.timeout( 30000 );

  before( () => {
    svc.init( config );
  } );

  before( svc.test.fixtures );

  it( 'simplest create is with a title and an owner', done => {

    svc.set( {
      ownerId: 12,
      title: 'Hello World'
    }, ( err, result ) => {

      should( err ).equal( null );

      result.should.eql( { 
        agenda: { 
          slug: 'hello-world',
          image: null,
          uid: result.agenda.uid, // that 
          title: 'Hello World',
          description: null,
          url: null,
          settings: null,
          verified: 0,
          createdAt: result.agenda.createdAt,
          updatedAt: result.agenda.updatedAt
        },
        valid: true,
        success: true,
        errors: [] 
      } );

      done();

    } );

  } );


  it( 'title is mandatory', done => {

    svc.set( {
      ownerId: 3
    }, ( err, result ) => {

      should( err ).equal( null );

      result.valid.should.equal( false );

      result.errors.should.eql( [ { 
        field: 'title',
        code: 'string.tooshort',
        message: 'the string is too short',
        values: { min: 2, max: 255 },
        origin: undefined
      }, { 
        field: 'slug',
        code: 'string.tooshort',
        message: 'the string is too short',
        values: { min: 2, max: 255 },
        origin: '' } 
      ] );

      done();

    } );

  } );


  it( 'set creates an agenda if no identifier is specified in first param', done => {

    svc.set( {
      ownerId: 1,
      title: 'Courbevoie',
      description: 'Que faire à Courbevoie',
      url: 'www.ville-courbevoie.fr/lagenda-de-vos-evenements.htm'
    }, ( err, result ) => {

      should( err ).equal( null );

      result.should.eql( { 
        agenda: {
          slug: 'courbevoie',
          uid: result.agenda.uid,
          title: 'Courbevoie',
          description: 'Que faire à Courbevoie',
          url: 'http://www.ville-courbevoie.fr/lagenda-de-vos-evenements.htm',
          settings: null,
          image: null,
          verified: 0,
          createdAt: result.agenda.createdAt,
          updatedAt: result.agenda.updatedAt
        },
        valid: true,
        success: true,
        errors: [] 
      } );

      done();

    } );

  } );


  it( 'set in create mode returns internal values if internal option is true', done => {

    svc.set( {
      ownerId: 1,
      title: 'Seconde guerre punique',
      description: 'Evénements d\'une rando en Espagne/France/Italie'
    }, { internal: true }, ( err, result ) => {

      should( err ).equal( null );

      result.should.eql( {
        agenda: { 
          id: result.agenda.id,
          ownerId: 1,
          slug: 'seconde-guerre-punique',
          uid: result.agenda.uid,
          title: 'Seconde guerre punique',
          description: 'Evénements d\'une rando en Espagne/France/Italie',
          url: null,
          settings: null,
          image: null,
          verified: 0,
          credentials: {
            moderators: false,
            tags: false,
            embedsHead: false,
            embedsTemplates: false 
          },
          createdAt: result.agenda.createdAt,
          updatedAt: result.agenda.updatedAt
        },
        valid: true,
        success: true,
        errors: [] 
      } );

      done();

    } );

  } );

} );