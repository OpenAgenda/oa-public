"use strict";

var should = require( 'should' ),

actions = require( '../components/src/actions' );

describe( 'actions', function() {

  it( 'addLocation - adds a new location on top of the list', () => {

    actions.tests.addLocation( {
      locations: [
        { name: 'second' },
        { name: 'third' }
      ]
    }, { name: 'first' } )

    .should.eql( {
      form: false,
      locations: [
        { name: 'first' },
        { name: 'second' },
        { name: 'third' }
      ]
    } );

  } );

  it( 'updateEditedLocation - updates one location and closes form', () => {

    actions.tests.updateEditedLocation( {
      form: {
        locationIndex: 1
      },
      locations: [ {}, { name: 'grut' }, {} ]
    }, { name: 'bruuu' }, true )

    .should.eql( {
      form: false,
      locations: [ {}, { name: 'bruuu' }, {} ]
    } );

  } );


  it( 'updateEditedLocation - updates one location in list', () => {

    actions.tests.updateEditedLocation( {
      form: {
        locationIndex: 1
      },
      locations: [ {}, { name: 'grut' }, {} ]
    }, { name: 'bruuu' } )

    .should.eql( {
      form: {
        locationIndex: 1
      },
      locations: [ {}, { name: 'bruuu' }, {} ]
    } );

  } );


  it( 'closeMerge reinitialises query and locations to force list get', () => {

    actions.tests.closeMerge( {
      query: { a: 1, b: 2 },
      locations: [ 1, 2, 3 ]
    } )

    .should.eql( {
      form: false,
      merge: false,
      query: {},
      locations: []
    } );

  } );


  it( 'assign function sticks state as first arg of stateless function', () => {

    let a = actions( {

      setState: newState => {

        newState.should.eql( {
          form: false,
          merge: false,
          query: {},
          locations: []
        } );

      },

      getState: () => {

        return {
          query: { a: 1, b: 2 },
          locations: [ 1, 2, 3 ]
        }

      }

    } );

    a.closeMerge();

  } );


  it( 'updateSearchQuery - empty string counts as a removal from query', () => {

    actions.updateSearchQuery( {
      random: 'field'
    }, 'random', '' )

    .should.eql( {} );

  } );


  it( 'updateSearchQuery - undefined value is removed from query', () => {

    actions.updateSearchQuery( {
      random: 'field'
    }, 'random', undefined )

    .should.eql( {} );

  } );


  it( 'updateSearchQuery - value set to 0 is set to 0', () => {

    actions.updateSearchQuery( {}, 'random', 0 )

    .should.eql( { random: 0 } );

  } );


} );
