"use strict";

process.env.NODE_ENV = 'test';

const svc = require( './service' ),

  _ = require( 'lodash' ),

  config = require( '../testconfig' ),

  should = require( 'should' );

describe( 'form-schemas -01- functional (server): create', () => {

  before( done => {

    svc.initAndLoad( config, () => {

      done();

    } );

  } );

  it( 'simple create', async () => {

    let result = await svc.create( { data: true } );

    result.should.eql( {
      success: true,
      id: 2,
      formSchema: {
        custom: null,
        defaultLabelLanguage: null,
        nextOptionId: 1,
        fields: []
      }
    } );

  } );

} );
