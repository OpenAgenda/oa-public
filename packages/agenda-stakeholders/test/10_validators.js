"use strict";

const should = require( 'should' );

const validators = require( '../iso/validators' );


describe( 'agenda-stakeholders - validators', () => {

  describe( 'listOptions', () => {

    it( 'when no options are given, default values return', () => {

      validators.listOptions().should.eql( {
        detailed: false,
        total: false
      } );

    } );

  } );

  describe( 'listQuery', () => {

    it( 'when no query is given, default values are returned', () => {

      validators.listQuery().should.eql( {
        search: null,
        invited: null,
        credentials: [],
        agendaId: null,
        userId: null
      } );

    } );

    it( 'a simple search query', () => {

      validators.listQuery( { search: 'billy@grut.com' } )

      .should.eql( {
        search: 'billy@grut.com',
        invited: null,
        credentials: [],
        agendaId: null,
        userId: null
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
        credentials: [ 1, 2 ],
        agendaId: null,
        userId: null
      } );

    } );

    it( 'credentials given as codes are cleaned as valid values', () => {

      validators.listQuery( {
        credentials: [ 'contributor', 'reader' ]
      } )

      .should.eql( {
        search: null,
        invited: null,
        credentials: [ 1, 4 ],
        userId: null,
        agendaId: null
      } );

    } );

  } );

  describe( 'clean', () => {

    it( 'clean function cleans and nothing more', () => {

      validators.clean( 'listQuery', { search: 'Melon' } )

      .should.eql( {
        search: 'Melon',
        invited: null,
        credentials: [],
        agendaId: null,
        userId: null
      } );

    } );

    it( 'clean function returns default value when no input is given', () => {

      validators.clean( 'listQuery' )

      .should.eql( {
        search: null,
        invited: null,
        credentials: [],
        agendaId: null,
        userId: null
      } );

    } );

    it( 'clean function returns default values if erroneous input is given', () => {

      validators.clean( 'listQuery', { credentials: [ 133 ] } )

      .should.eql( {
        search: null,
        invited: null,
        credentials: [],
        agendaId: null,
        userId: null
      } );

    } );

  } );

} );