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

    let formSchema = JSON.parse( fs.readFileSync( __dirname + '/parse/integer.schema.json', 'utf-8' ) );

    ( await svc.update( 1, formSchema ) ).should.eql( {
      id: 1,
      success: true,
      formSchema
    } );

  } );

} );
