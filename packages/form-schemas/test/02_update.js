"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' ),

  _ = require( 'lodash' ),

  config = require( '../testconfig' ),

  should = require( 'should' ),

  fs = require( 'fs' );

describe( 'form-schemas - functional (server): create', () => {

  before( done => {

    svc.initAndLoad( config, () => {

      done();

    } );

  } );

  after( () => {

    svc.shutdown();

  } );

  it.only( 'simple update', async () => {

    let { id } = await svc.create( { data: true } );

    let formSchema = JSON.parse( fs.readFileSync( __dirname + '/parse/integer.out.json', 'utf-8' ) );

    let result = await svc.update( id, formSchema );

    result.should.eql( {
      id: id,
      success: true,
      formSchema: formSchema
    } );

  } );

} );