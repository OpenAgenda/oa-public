"use strict";

const fs = require( 'fs' );
const _ = require( 'lodash' );
const ih = require( 'immutability-helper' );
const mysql = require( 'mysql' );
const should = require( 'should' );

const config = require( '../testconfig' );
const svc = require( './service' );

const formSchemaFields = JSON.parse( fs.readFileSync( __dirname + '/fixtures/fds-fields.json' , 'utf-8' ) );

describe( 'custom - functional (server): transfer from legacy', function() {

  this.timeout( 4000 );

  before( async () => {

    await svc.initAndLoad( ih( config, {
      legacy: {
        interfaces: {
          getFormSchemaFields: { $set: formSchemaId => {

            return formSchemaFields;

          } }
        }
      },
      interfaces: {
        getValidator: { 
          $set: formSchemaId => {

            return v => v; // its all good for these tests

          }
        }
      }
    } ) );

  } );

  after( async () => {

    await svc.shutdown();

  } );

  it( 'legacy transfer puts legacy custom data in the set item', async () => {

    await svc( 42 ).transferFromLegacy( 3842071 );

    const custom = await svc( 42 ).get( 3842071 );

    custom.should.eql( {
      animateurs: 'Steve et Chirie',
      organisateur: 'CHU de Steve',
      unitesrecherche: '3 ou 4',
      'publics-concernes': [ 11, 12 ],
      thematiques: [ 5 ],
      'type-danimation': 31
    } );

  } );

} );