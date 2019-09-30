"use strict";

const _ = require( 'lodash' );
const mysql = require( 'mysql' );
const should = require( 'should' );

process.env.NODE_ENV = 'test';

const svc = require( './service' );

const config = require( '../testconfig' );

describe( 'events - functional (server): get', function () {

  this.timeout( 30000 );

  before( done => {

    svc.initAndLoad( config, done );

  } );

  after( svc.shutdown );

  it( 'simple get', done => {

    svc.get( 146173, ( err, event ) => {

      event.slug.should.equal( 'a-fancy_194' );

      done();

    } )

  } );


  it( 'a get by uid', done => {

    svc.get( { uid: 3564473 }, ( err, event ) => {

      event.slug.should.equal( 'a-fancy_194' );

      done();

    } );

  } );


  it( 'it is not possible to get a deleted event', done => {

    svc.get( 147352, ( err, event ) => {

      should( event ).equal( null );

      done();

    } );

  } );


  it( 'a private event is not accessible with default get', done => {

    svc.get( 146007, ( err, event ) => {

      should( event ).equal( null );

      done();

    } );

  } );


  it( 'a public event is not accessible if private option is set to true', done => {

    svc.get( 147352, { private: true }, ( err, event ) => {

      should( event ).equal( null );

      done();

    } );

  } );


  it( 'a private event is accessible if private option is set to true', done => {

    svc.get( 146007, { private: true }, ( err, event ) => {

      event.slug.should.equal( 'a-la-decouverte-d-activites-numeriques-innovantes' );

      done();

    } );

  } );


  it( 'a private event is accessible if private option is set to null', done => {

    svc.get( 146007, { private: null }, ( err, event ) => {

      event.slug.should.equal( 'a-la-decouverte-d-activites-numeriques-innovantes' );

      done();

    } );

  } );


  it( 'a public event is accessible if private option is set to null', done => {

    svc.get( 146173, { private: null }, ( err, event ) => {

      event.slug.should.equal( 'a-fancy_194' );

      done();

    } );

  } );


  it( 'a erroneous json get gives back an error', done => {

    svc.get( 146318, { internal: true }, ( err, event ) => {

      should( err ).not.equal( null );

      should( event ).equal( undefined );

      done();

    } );

  } );


  it( 'get a deleted event without deleted option', done => {

    svc.get( { uid: 10932458 }, ( err, event ) => {

      should( err ).equal( null );

      should( event ).equal( null );

      done();

    } );

  } );

  it( 'get a deleted event', done => {

    svc.get( { uid: 10932458 }, { deleted: true }, ( err, event ) => {

      should( err ).equal( null );

      event.slug.should.equal( 'bourbriac_19' );

      done();

    } );

  } );


  it( 'get with html option gives html content in html field', done => {

    svc.get( { uid: 3681352 }, { html: true }, ( err, event ) => {

      event.html.should.eql( {
        fr: '<p>Championnat de France.</p>\n<p>Tournois réservé aux Espoirs, Vétérans</p>\n'
      } );

      done();

    } );

  } );


  it( 'if image is provided, image path is placed in base key', done => {

    svc.get( { uid: 48641508 }, ( err, event ) => {

      event.image.base.should.equal( config.image.base );

      done();

    } );

  } );

  it('location is not part of event if detailed is false', async () => {
    const event = await svc.get({
      uid: 1517683
    }, {
      detailed: false
    } );

    should(event.location).equal(undefined);
  });

  it('detailed option causes location to be included in result', async () => {
    const event = await svc.get({
      uid: 1517683
    }, {
      detailed: true
    });

    _.get(event, 'location.name').should.equal('La case de Janine');
  } );

} );
