"use strict";

const should = require( 'should' ),

mysqlParse = require( '../service/lib/mysqlParse' );

describe( 'mysqlParse', () => {

  let parser = mysqlParse( [ 
    'title', 
    'description', 
    'url', 
    {
      db: 'db_field',
      obj: 'objField',
      type: 'json',
      internal: true
    } 
  ] );


  it( 'fields gives list of fields of specified type', () => {

    parser.fields().should.eql( [ 'title', 'description', 'url' ] );

  } );


  it( 'fields includes private fields when requested', () => {

    parser.fields( 'db', true ).should.eql( [ 'title', 'description', 'url', 'db_field' ] );

  } );


  it( 'toDb converts obj to db entry', () => {

    parser.toDb( {
      title: 'Yey',
      objField: {
        steve: 'hi god'
      }
    } )

    .should.eql( {
      title: 'Yey',
      db_field: JSON.stringify( { steve: 'hi god' } )
    } );

  } );


  it( 'toObj converts db entry to obj', () => {

    parser.toObj( { 
      title: 'Yey',
      description: null,
      url: 'https://openagenda.com',
      db_field: JSON.stringify( { steve: 'hi god' } )
    } )

    .should.eql( {
      title: 'Yey',
      description: null,
      url: 'https://openagenda.com',
      objField: {
        steve: 'hi god'
      }
    } );

  } )

} );