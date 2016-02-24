"use strict";

var t = require( './lib/lib' ),

should = require( 'should' ),

es = require( '../services/elasticsearch' ),

init = require( '../lib/init' );

describe( 'agenda favorites', function() {

  this.timeout( 10000 );

  var browser,

  agenda = {};

  before( ( done ) => {

    t.boot( true, done );

  } );

  before( t.sets.prepareOneAgendaInstance( agenda, 'la-gargouille' ) );

  before( done => {

    init.agendaLocations( {}, done );

  } );

  before( es.resync );

  beforeEach( done => {

    t.loadBrowser( ( err, b ) => {

      browser = b;

      done();

    });

  } );

  it( 'favorite icons are displayed for each event item', ( done ) => {

    browser.visit( '/la-gargouille?search[passed]=1' )

    .then( () => {

      browser.queryAll( '.js_fav_item' ).length.should.equal( 3 );

      done();

    } );

  } );

  it( 'when clicked, favorited event is shown as active', ( done ) => {

    browser.visit( '/la-gargouille?search[passed]=1' )

    .then( () => {

      return browser.click( '.js_fav_item' );

    } )

    .then( () => {

      browser.query( '.js_fav_item i' ).getAttribute( 'class' ).indexOf( 'active' ).should.not.equal( -1 );

      done();

    } );

  } );

  it( 'when clicked, favorited event is shown in favorite export menu', ( done ) => {

    browser.visit( '/la-gargouille?search[passed]=1' )

    .then( () => {

      return browser.click( '.js_fav_item' );

    } )

    .then( () => {

      return browser.clickLink( '.action-container a.btn' )

    })

    .then( () => {

      browser.location.pathname.should.equal( '/la-gargouille/actions/' );

      browser.query( '.js_fav_info' ).innerHTML.indexOf( '1 favori' ).should.not.equal( -1 );

      done();

    });

  } );

});