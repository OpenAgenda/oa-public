"use strict";

process.env.NODE_ENV = 'test';

const _ = require( 'lodash' );
const knex = require( 'knex' );
const should = require( 'should' );

const svc = require( './service' );

const config = require( '../testconfig' );

describe( 'form-schemas -07- functional (server): legacy', function() {

  this.timeout( 5000 );

  before( done => {

    svc.initAndLoad( config, [
      config.schemas.formSchema,
      config.schemas.network,
      config.legacy.schemas.agenda,
      config.legacy.schemas.tagSet,
      config.legacy.schemas.categorySet
    ], done );

  } );

  afterEach( () => svc.shutdown );

  describe( 'get', () => {

    let formData;

    before( async () => {
      formData = await svc.legacy.get( 3868 );
    } );

    it( 'fetches and parses categorySet, tagSet and customSet of given agenda to produce a valid FormSchema', async () => {

      formData.fields.length.should.equal( 8 );

    } );

    it( 'specifies field origin in origin key', async () => {

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

    it( 'specifies if field is network field', async () => {

      const { fields } = await svc.legacy.get( 3868 );

      _.find( fields, { field: 'quisuisje' } ).network.should.equal( true );

    } );

  } );

  describe( 'transfer', () => {

    let result;

    before( async () => {

      result = await svc.legacy.transfer( 3868 );

    } );

    it( 'performs a legacy get followed by a create operation', async () => {

      result.transfered.should.equal( true );

      result.operation.should.equal( 'create' );

    } );

    it( 'does not keep network fields', async () => {

      should( _.find( result.formSchema.fields, { field: 'quisuisje' } ) ).equal( undefined );

    } );

    it( 'performs an update when form_schema_id is already set in agenda', async () => {

      const result = await svc.legacy.transfer( 3868 );

      result.operation.should.equal( 'update' );

    } );

  } );


} );
