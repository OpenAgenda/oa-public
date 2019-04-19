"use strict";

const FormSchema = require( '../iso/FormSchema.js' );

const should = require( 'should' );

describe( 'FormSchema - access control', () => {

  let s;

  before( () => {

    s = new FormSchema( {
      fields: [ {
        label: { fr: 'un label' },
        field: 'anopenfield',
        fieldType: 'text'
      }, {
        label: { fr: 'un label' },
        field: 'alimitedfield',
        fieldType: 'integer',
        read: 'administrator'
      }, {
        label: { fr: 'un label' },
        field: 'anotherlimitedfield',
        fieldType: 'number',
        read: 'moderator'
      } ],
      custom: null
    } );

  } );


  it( 'validator with access type specified but no level returns open fields only', () => {

    let v = s.getValidate( 'read' );

    v( {
      anopenfield: 'Absolom',
      alimitedfield: 2022,
      anotherlimitedfield: 8.5
    } ).should.eql( {
      anopenfield: 'Absolom'
    } );

  } );


  it( 'validator is used to clean data to specified read access', () => {

    let v = s.getValidate( 'read', 'administrator' );

    v( {
      anopenfield: 'Absolom',
      alimitedfield: 2022,
      anotherlimitedfield: 8.5
    } ).should.eql( {
      anopenfield: 'Absolom',
      alimitedfield: 2022
    } );

  } );


  it( 'validator is used to keep data strictly matching specified level', () => {

    let v = s.getValidate( 'read', 'administrator', { includeUnspecified: false } );

    v( {
      anopenfield: 'Plastic bag',
      alimitedfield: 123,
      anotherlimitedfield: 12.3
    } ).should.eql( {
      alimitedfield: 123
    } );

  } );

  it( 'validator can return data matching multiple levels', () => {

    let v = s.getValidate( 'read', [ 'administrator', 'moderator' ], { includeUnspecified: false } );

    v( {
      anopenfield: 'Trash',
      alimitedfield: 666,
      anotherlimitedfield: 4.5
    } ).should.eql( {
      alimitedfield: 666,
      anotherlimitedfield: 4.5
    } );

  } );

} );
