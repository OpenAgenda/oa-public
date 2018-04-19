"use strict";

const should = require( 'should' );

const validators = require( '../src/iso/validators' );


describe( 'agenda-stakeholders - unit (iso): validators', () => {

  describe( 'listOptions', () => {

    it( 'when no options are given, default values return', () => {

      validators.listOptions().should.eql( {
        detailed: false,
        showSlugs: false,
        total: false,
      } );

    } );

  } );

  describe( 'listQuery', () => {

    it( 'when no query is given, default values are returned', () => {

      validators.listQuery().should.eql( {
        search: null,
        invited: null,
        order: null,
        credentials: [],
        agendaId: null,
        id: null,
        userId: null,
        actionsCounterEqualZero: null,
        deletedUser: null
      } );

    } );

    it( 'when a query is given with default values, default values are returned', () => {

      validators.listQuery( {
        search: null,
        invited: null,
        credentials: [],
        agendaId: null,
        actionsCounterEqualZero: null,
        deletedUser: null
      } ).should.eql( {
        search: null,
        invited: null,
        order: null,
        credentials: [],
        agendaId: null,
        id: null,
        userId: null,
        actionsCounterEqualZero: null,
        deletedUser: null
      } );

    } );

    it( 'a simple search query', () => {

      validators.listQuery( { search: 'billy@grut.com' } )

      .should.eql( {
        search: 'billy@grut.com',
        invited: null,
        order: null,
        credentials: [],
        id: null,
        agendaId: null,
        userId: null,
        actionsCounterEqualZero: null,
        deletedUser: null
      } );

    } );

    it( 'a simple query with credentials specified', () => {

      validators.listQuery( {
        search: 'grut', 
        credentials: [ 1, 2 ],
        invited: false
      } )

      .should.eql( {
        search: 'grut',
        invited: false,
        order: null,
        credentials: [ 1, 2 ],
        id: null,
        agendaId: null,
        userId: null,
        actionsCounterEqualZero: null,
        deletedUser: null
      } );

    } );

    it( 'credentials given as codes are cleaned as valid values', () => {

      validators.listQuery( {
        credentials: [ 'contributor', 'reader' ]
      } )

      .should.eql( {
        search: null,
        invited: null,
        order: null,
        credentials: [ 4, 1 ],
        id: null,
        userId: null,
        agendaId: null,
        actionsCounterEqualZero: null,
        deletedUser: null
      } );

    } );

  } );

  describe( 'clean', () => {

    it( 'clean function cleans and nothing more', () => {

      validators.clean( 'listQuery', { search: 'Melon' } )

      .should.eql( {
        search: 'Melon',
        invited: null,
        order: null,
        credentials: [],
        id: null,
        agendaId: null,
        userId: null,
        actionsCounterEqualZero: null,
        deletedUser: null
      } );

    } );

    it( 'clean function returns default value when no input is given', () => {

      validators.clean( 'listQuery' )

      .should.eql( {
        search: null,
        invited: null,
        order: null,
        credentials: [],
        id: null,
        agendaId: null,
        userId: null,
        actionsCounterEqualZero: null,
        deletedUser: null
      } );

    } );

    it( 'clean function returns default values if erroneous input is given', () => {

      validators.clean( 'listQuery', { credentials: [ 133 ] } )

      .should.eql( {
        search: null,
        invited: null,
        order: null,
        credentials: [],
        id: null,
        agendaId: null,
        userId: null,
        actionsCounterEqualZero: null,
        deletedUser: null
      } );

    } );

  } );

} );