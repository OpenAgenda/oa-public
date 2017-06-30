"use strict";

const should = require( 'should' );
const helpers = require( '../service/helpers' );
const service = require( '../' );
const elasticsearch = require( 'elasticsearch' );
const config = require( '../testconfig' );
const w = require( 'when' );
const async = require( 'async' );
const _ = require( 'lodash' );

describe( 'event-search - unit: helpers', function() {

  this.timeout( 10000 );

  let client;

  before( () => {

    service.init( config );

    client = service.getConfig().client;

  } );

  describe( 'createIndexName', () => {

    it( 'created index name contains alias name and current datetime ( name_20170321T1128 )', () => {

      let aliasName = 'name';

      ( new RegExp( '^' + aliasName + '_20[0-9][0-9][0-1][1-9][0-3][0-9]t[0-2][0-9][0-5][0-9]$' ) )

        .test( helpers.createIndexName( aliasName ) ).should.equal( true );

    } );

  } )

} );