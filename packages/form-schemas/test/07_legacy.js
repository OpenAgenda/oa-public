"use strict";

process.env.NODE_ENV = 'test';

const should = require( 'should' );

const svc = require( './service' );

const config = require( '../testconfig' );

const knex = require( 'knex' );

describe( 'form-schemas -07- functional (server): legacy', function() {

  this.timeout( 5000 );

  beforeEach( done => {

    svc.initAndLoad( config, [ 
      config.schemas.formSchema,
      config.legacy.schemas.agenda,
      config.legacy.schemas.tagSet,
      config.legacy.schemas.categorySet
    ], done );

  } );

  afterEach( () => svc.shutdown );

  it( '.get fetches and parses categorySet, tagSet and customSet of given agenda to produce a valid FormSchema', async () => {

    let formData = await svc.legacy.get( 3868 );

    formData.fields.length.should.equal( 8 );

  } );

  it( '.get specifies field origin in origin key', async () => {

    let formData = await svc.legacy.get( 3868 );

    const origins = formData.fields.map( f => f.origin );

    origins.should.eql( [ 
      'custom',
      'custom',
      'custom',
      'custom',
      'custom',
      'tags',
      'tags',
      'categories'
    ] );

  } );

  it( '.transfer performs a legacy get followed by a create operation', async () => {

    let result = await svc.legacy.transfer( 3868 );

    result.transfered.should.equal( true );

    result.operation.should.equal( 'create' );

  } );

  it( '.transfer performs an update when form_schema_id is already set in agenda', async () => {

    let result = await svc.legacy.transfer( 3868 );

    result = await svc.legacy.transfer( 3868 );

    result.operation.should.equal( 'update' );

  } );

} );
