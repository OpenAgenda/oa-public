"use strict";

var should = require( 'should' ),

actions = require( '../components/src/actions' );

describe( 'components actions', () => {

  var currentState = {
    search: 'blip',
    pageRange: [ 2, 3 ],
    agendas: [ 'agenda2', 'agenda3' ]
  },

  data = {
    agendas: [ 'agenda123', 'agenda345' ],
    total: 12000
  }

  it( 'addPageItems next', () => {

    actions.addPageItems( currentState, true, data )

    .should.eql( {
      search: 'blip',
      pageRange: [ 2, 4 ],
      agendas: [ 'agenda2', 'agenda3', 'agenda123', 'agenda345' ]
    } );

  } );


  it( 'addPageItems previous', () => {

    actions.addPageItems( currentState, false, data )

    .should.eql( {
      search: 'blip',
      pageRange: [ 1, 3 ],
      agendas: [ 'agenda123', 'agenda345', 'agenda2', 'agenda3' ]
    } );

  } );


  it( 'resetPageItems', () => {

    actions.resetPageItems( currentState, 'bloup', data )

    .should.eql( {
      search: 'bloup',
      pageRange: [ 1, 1 ],
      agendas: [ 'agenda123', 'agenda345' ],
      total: 12000,
      loading: false
    } );

  } );

} );