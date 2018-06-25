"use strict";

const _ = require( 'lodash' );
const should = require( 'should' );
const service = require( './service' );
const mw = require( '../middleware' );
const config = require( '../testconfig' );

describe( 'keys - middleware', function () {

  this.timeout( 30000 );

  beforeEach( async () => {

    await service.initAndLoad( config );

  } );

  it( 'create successfully', done => {

    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585 },
      body: { label: 'Ma première clé #ému' }
    }

    mw.create()( req, {}, err => {

      should( err ).equal( undefined );

      _.omit( req.result, [ 'key', 'createdAt' ] ).should.eql( {
        id: 3,
        type: 'userPublic',
        identifier: 98596585,
        label: 'Ma première clé #ému'
      } );

      done();

    } );

  } );

  it( 'create which fail the validation', done => {

    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585 },
      body: { label: {} }
    }

    mw.create()( req, {}, err => {

      err.should.eql( {
        code: 400,
        json: {
          errors: [
            {
              field: 'label',
              code: 'string.invalidtype',
              message: 'not a string',
              origin: {}
            }
          ]
        }
      } );

      done();

    } );

  } );

  it( 'get', done => {

    const req = {
      identifiers: 1
    }

    mw.get()( req, {}, err => {

      should( err ).equal( undefined );

      _.omit( req.result, [ 'key', 'createdAt' ] ).should.eql( {
        id: 1,
        type: 'userPublic',
        identifier: 98596585,
        label: 'Vielle clé !'
      } );

      done();

    } );

  } );

  it( 'get by key', done => {

    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585, key: '2733c8183cca49dcbfbaefd6c957f5b6' }
    }

    mw.get()( req, {}, err => {

      should( err ).equal( undefined );

      _.omit( req.result, [ 'key', 'createdAt' ] ).should.eql( {
        id: 2,
        type: 'userPublic',
        identifier: 98596585,
        label: null
      } );

      done();

    } );

  } );

  it( 'get which fail the validation', done => {

    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585, key: {} }
    }

    mw.get()( req, {}, err => {

      err.should.eql( {
        code: 400,
        json: {
          errors: [
            {
              field: 'key',
              code: 'string.invalidtype',
              message: 'not a string',
              origin: {}
            }
          ]
        }
      } );

      done();

    } );

  } );

  it( 'simple list', done => {

    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585 }
    };

    mw.list()( req, {}, err => {

      should( err ).equal( undefined );

      req.result.items.map( v => _.omit( v, 'key', 'createdAt' ) ).should.eql( [
        {
          id: 1,
          type: 'userPublic',
          identifier: 98596585,
          label: 'Vielle clé !'
        },
        {
          id: 2,
          type: 'userPublic',
          identifier: 98596585,
          label: null
        }
      ] );

      done();

    } );

  } );

  it( 'list an offset and a limit', done => {

    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585 },
      query: { offset: 1, limit: 1 }
    };

    mw.list()( req, {}, err => {

      should( err ).equal( undefined );

      req.result.items.map( v => _.omit( v, 'key', 'createdAt' ) ).should.eql( [
        {
          id: 2,
          type: 'userPublic',
          identifier: 98596585,
          label: null
        }
      ] );

      done();

    } );

  } );

  it( 'list gives total', done => {

    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585 },
      options: { total: true }
    };

    mw.list()( req, {}, err => {

      should( err ).equal( undefined );

      req.result.total.should.equal( 2 );
      req.result.items.map( v => _.omit( v, 'key', 'createdAt' ) ).should.eql( [
        {
          id: 1,
          type: 'userPublic',
          identifier: 98596585,
          label: 'Vielle clé !'
        },
        {
          id: 2,
          type: 'userPublic',
          identifier: 98596585,
          label: null
        }
      ] );

      done();

    } );

  } );

  it( 'update by id', done => {

    const req = {
      identifiers: 1,
      body: { label: 'The key of dead' }
    };

    mw.update()( req, {}, err => {

      should( err ).equal( undefined );

      _.omit( req.result, [ 'key', 'createdAt' ] ).should.eql( {
        id: 1,
        type: 'userPublic',
        identifier: 98596585,
        label: 'The key of dead'
      } );

      done();

    } );

  } );

  it( 'update a label of key by key', done => {

    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585, key: '2733c8183cca49dcbfbaefd6c957f5b6' },
      body: { label: 'Clé' }
    };

    mw.update()( req, {}, err => {

      should( err ).equal( undefined );

      _.omit( req.result, [ 'key', 'createdAt' ] ).should.eql( {
        id: 2,
        type: 'userPublic',
        identifier: 98596585,
        label: 'Clé'
      } );

      done();

    } );

  } );

  it( 'remove a key by his id', done => {

    const req = {
      identifiers: 1
    }

    mw.remove()( req, {}, err => {

      should( err ).equal( undefined );

      req.result.should.eql( 1 );

      done();

    } );

  } );

  it( 'remove a key', done => {

    const req = {
      identifiers: { type: 'userPublic', identifier: 98596585, key: '2733c8183cca49dcbfbaefd6c957f5b6' }
    }

    mw.remove()( req, {}, err => {

      should( err ).equal( undefined );

      req.result.should.eql( 1 );

      done();

    } );

  } );

} );
