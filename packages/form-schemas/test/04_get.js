"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' );

const config = require( '../testconfig' );

const should = require( 'should' );

const fs = require( 'fs' );

describe( 'get', () => {

  let id,

    formSchema = JSON.parse( fs.readFileSync( __dirname + '/parse/integer.schema.json', 'utf-8' ) );

  before( done => {

    svc.initAndLoad( config, err => done() );

  } );

  before( async () => {

    let result = await svc.create( formSchema );

    id = result.id;

  } );

  after( () => svc.shutdown() );

  it( 'simple get', async () => {

    ( await svc.get( id ) ).should.eql( formSchema );

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

} );