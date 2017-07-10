"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' );

const config = require( '../testconfig' );

const should = require( 'should' );

const fs = require( 'fs' );

describe( 'get', () => {

  before( done => {

    svc.initAndLoad( config, err => done() )

  } );

  after( () => svc.shutdown() );

  it( 'simple get', async () => {

    let formSchema = JSON.parse( fs.readFileSync( __dirname + '/parse/integer.out.json', 'utf-8' ) );

    let { id } = await svc.create( formSchema );

    ( await svc.get( id ) ).should.eql( formSchema );

  } );

} );