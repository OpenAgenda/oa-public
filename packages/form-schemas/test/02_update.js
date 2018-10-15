"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );
const fs = require( 'fs' );
const should = require( 'should' );
const svc = require( './service' );

const config = require( '../testconfig' );

describe( 'form-schemas -02- functional (server): update', () => {

  before( done => {

    svc.initAndLoad( config, () => {

      done();

    } );

  } );

  after( () => {

    svc.shutdown();

  } );

  it( 'simple update', async () => {

    let { id } = await svc.create( { data: true } );

    let formSchema = JSON.parse( fs.readFileSync( __dirname + '/parse/integer.schema.json', 'utf-8' ) );

    let result = await svc.update( id, formSchema );

    result.should.eql( {
      id,
      success: true,
      formSchema
    } );

  } );

} );
