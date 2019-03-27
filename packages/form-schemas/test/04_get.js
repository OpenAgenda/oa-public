"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );
const fs = require( 'fs' );
const should = require( 'should' );

const config = require( '../testconfig' );
const svc = require( './service' );

describe( 'form-schemas -04- get', () => {

  const formSchema = JSON.parse( fs.readFileSync( __dirname + '/parse/integer.schema.json', 'utf-8' ) );
  const secondFormSchema = JSON.parse( fs.readFileSync( __dirname + '/parse/number.schema.json', 'utf-8' ) );

  let id;
  let secondId;

  before( done => {

    svc.initAndLoad( config, err => done() );

  } );

  before( async () => {

    let result = await svc.create( formSchema );

    id = result.id;

    result = await svc.create( secondFormSchema );

    secondId = result.id;

  } );

  after( () => svc.shutdown() );

  it( 'simple get', async () => {

    ( await svc.get( id ) ).should.eql( _.assign( {}, formSchema, { id } ) );

  } );

  it( 'get instanciated', async () => {

    const fs = await svc.get( id, { instanciate: true } );

    fs.isNew().should.equal( false );

  } );

  it( 'simple getValidator', async () => {

    let validate = ( await svc.getValidator( id ) );

    validate( {
      participants: 1,
      someIgnoredField: 'lol'
    } ).should.eql( {
      participants: 1
    } );

  } );

  it( 'get merged schemas', async () => {

    const fs = await svc.getMerged( [ id, secondId ] );

    fs.fields.length.should.equal( 2 );

  } );

  it( 'get merged schemas, instanciated', async () => {

    const fs = await svc.getMerged( [ id, secondId ], { instanciate: true } );

    ( typeof fs.getValidate() ).should.equal( 'function' );

  } );

} );
