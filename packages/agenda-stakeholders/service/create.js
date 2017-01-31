"use strict";

const _ = require( 'lodash' ),
 
  logger = require( 'basic-logger' ),
 
  Stakeholder = require( '../iso/Stakeholder' ),
 
  Process = require( 'process-service' ),
 
  validator = require( '../iso/validator' ),

  types = require( '../iso/credentialTypes' ),

  format = require( './format' ),

  get = require( './get' ),
 
  settings = require( './settings' );
 
let log, createProcess;

module.exports = _.extend( create(), { 
  bulk,
  init
} );

let schemas, knex, interfaces;


function create() {

  const p = new Process( {
    tasks: {
      _validate,
      _checkEmail,
      _loadUser,
      _createStakeholder,
      _loadStakeholder
    },
    process: [ {

      path: 'main',
      task: '_validate',
      in: { 
        data: 'data', 
        allowPartial: 'options.allowPartial',
        settings: 'settings'
      },
      out: [ {
        assign: [ 'result.valid', 'result.success', 'result.errors' ]
      }, {
        condition: false,
        end: true
      } ]

    }, {

      path: 'main',
      task: '_checkEmail',
      condition: [ {
        'options.allowPartial': true,
        'result.valid' : true
      } ],
      in: [ 'base.agendaId', 'data.email' ],
      out: [ {
        condition: false,  
        assign: [ 'result.valid', 'result.success', 'result.errors' ],
        end: true
      } ]

    }, {

      path: 'main',
      task: '_loadUser',
      in: [ 'data.email' ],
      out: [ {
        assign: [ 'result.user' ]
      } ]
    }, {

      path: 'main',
      task: '_createStakeholder',
      in: [ 'base', 'data', 'result.user', 'options' ],
      out: [ {
        condition: [ { $raw: null } ],
        assign: [ , 'result.errors', { $raw: { 'result.success': false } } ]
      }, {
        assign: [ 'stakeholderId', { $raw: { 'result.success': true } } ]
      } ]

    }, {

      path: 'main',
      task: '_loadStakeholder',
      in: [ 'base.agendaId', 'stakeholderId' ],
      out: [ {
        assign: 'result.stakeholder'
      } ]

    } ]
  } );

  return function ( base, data, options, cb ) {

    let s = settings( base.agendaId );

    if ( arguments.length === 3 ) {

      options = {};
      cb = arguments[ 2 ];

    }

    p.run( {
      base, // base values to use 
      settings: s,
      data,
      options: _.extend( {
        allowPartial: false,
        credential: types.get( 'contributor' )
      }, options ),
      result: {
        success: null,
        stakeholder: null,
        errors: []
      }
    }, ( err, processResult ) => {

      if ( err ) return cb( err );

      cb( null, processResult.values.result, processResult.report );

    } );

  }

}




function bulk() {}

function init( config ) {

  log = logger( 'bulkCreate' );

  log( 'initing' );

  schemas = config.schemas;

  knex = config.knex;

  interfaces = config.interfaces;

}



function _validate( { data, allowPartial, settings }, cb ) {

  settings.get( ( err, s ) => {

    if ( err ) return cb( err );

    // settings fields follow a legacy structure ( list of fields )
    // that must be converted to a 'validators/schema' friendly map
    let stakeholder = new Stakeholder( data, {
      schemaMap: validator.convertFieldsToSchemaMap( s.fields )
    } ),

    valid = stakeholder.isValid( allowPartial );

    cb( null, valid, valid, stakeholder.getErrors( allowPartial ) );

  } );

}


function _createStakeholder( base, data, user, options, cb ) {

  knex( schemas.stakeholder )

    .insert( format.objToDb( {
      updatedAt: new Date(),
      createdAt: new Date(),
      credential: options.credential,
      custom: data,
      agendaId: base.agendaId,
      userId: user ? user.id : null
    } ) )

    .asCallback( ( err, insertIds ) => {

      if ( err ) return cb( err );

      if ( !insertIds.length ) return cb( 'could not create stakeholder' );

      cb( null, insertIds[ 0 ] ); 

    } );

}


function _loadStakeholder( agendaId, stakeholderId, cb ) {

  get( { agendaId }, { id: stakeholderId }, cb );

}


function _loadUser( email, cb ) {

  interfaces.getUser( { email }, cb );

}


function _checkEmail( agendaId, email, cb ) {

  if ( !email ) {

    return cb( null, false, false, [ {
      origin: email,
      code: 'email.missing',
      field: 'email'
    } ] );

  }

  get( { agendaId }, { email }, ( err, stakeholder ) => {

    if ( err ) return cb( err );

    if ( stakeholder ) {

      return cb( null, false, false, [ {
        origin: email,
        code: 'email.already_created',
        field: 'email'
      } ] );

    }

    cb( null, true, true, [] );

  } );

}