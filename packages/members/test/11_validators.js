"use strict";

const should = require( 'should' );

const validate = require( '../lib/validate' );

describe( 'members - unit - validate', () => {

  it( 'simple validation', () => {

    const clean = validate( {
      role: 1,
      agendaUid: 1,
      userUid: 1
    } );

    clean.should.eql( {
      agendaUid: 1,
      userUid: 1,
      createdAt: undefined,
      updatedAt: undefined,
      custom: undefined,
      deletedUser: false,
      role: 1
    } );

  } );

  it( 'validation with custom data validation', () => {

    const clean = validate.withCustom( false )( {
      role: 1,
      agendaUid: 1,
      userUid: 1
    } );

    clean.should.eql( {
      agendaUid: 1,
      userUid: 1,
      createdAt: undefined,
      updatedAt: undefined,
      custom: {
        organization: null,
        contactName: null,
        contactNumber: null,
        contactPosition: null,
        email: null
      },
      deletedUser: false,
      role: 1
    } );

  } );

  it( 'validate custom data only', () => {

    const validateCustom = validate.custom( false );

    const clean = validateCustom( {
      organization: 'OA'
    } );

    clean.should.eql( {
      contactName: null,
      contactNumber: null,
      contactPosition: null,
      email: null,
      organization: 'OA'
    } );

  } );

} );
