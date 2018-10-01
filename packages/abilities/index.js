'use strict';

const _ = require( 'lodash' );
const { AbilityBuilder, Ability } = require( '@casl/ability' );
const rulesLib = require( './rules' );
const config = require( './config' );

const SUBJECT_NAME = Symbol( '@openagenda/abilities/Ability:SUBJECT_NAME' );

function getSubjectName( subject ) {
  if ( subject && subject[ SUBJECT_NAME ] ) {
    return subject[ SUBJECT_NAME ];
  }

  if ( !subject || typeof subject === 'string' ) {
    return subject;
  }

  const Type = typeof subject === 'object' ? subject.constructor : subject;

  return Type.modelName || Type.name;
}

function can( action, subjectName, subject, field ) {
  const haveSubjectProp = subject && !!subject[ SUBJECT_NAME ];
  const isObject = _.isObject( subject );

  if ( !haveSubjectProp && isObject ) {
    subject[ SUBJECT_NAME ] = subjectName;
  }

  const result = Ability.prototype.can.call( this, action, subject || subjectName, field );

  if ( !haveSubjectProp && isObject ) {
    delete subject[ SUBJECT_NAME ];
  }

  return result;
}

function cannot( action, subjectName, subject, field ) {
  const haveSubjectProp = subject && !!subject[ SUBJECT_NAME ];

  if ( !haveSubjectProp && _.isObject( subject ) ) {
    subject[ SUBJECT_NAME ] = subjectName;
  }

  const result = Ability.prototype.cannot.call( this, action, subject || subjectName, field );

  if ( !haveSubjectProp ) {
    delete subject[ SUBJECT_NAME ];
  }

  return result;
}

async function get( entityName, identifier, options ) {
  if ( !_.isString( entityName ) ) {
    throw new TypeError( '`entityName` should be a string' );
  }

  if ( !_.isNumber( identifier ) ) {
    throw new TypeError( '`identifier` should be a number' );
  }

  const getEntityFn = config.interfaces && config.interfaces.getEntity && config.interfaces.getEntity[ entityName ];
  // const defaultForFn = config.interfaces && config.interfaces.defaultFor && config.interfaces.defaultFor[ entityName ];
  const defineFn = config.interfaces && config.interfaces.defineFor && config.interfaces.defineFor[ entityName ];

  if ( !_.isFunction( getEntityFn ) ) {
    throw Error( `Missing interface \`getEntityFn.${entityName}\`` );
  }

  if ( !_.isFunction( defineFn ) ) {
    throw Error( `Missing interface \`defineFor.${entityName}\`` );
  }

  const builder = AbilityBuilder.extract();

  const entity = await getEntityFn( identifier );
  // const entityDefaultRules = defaultForFn ? await defaultForFn( entity, builder ) : [];
  //
  // if ( _.isArray( entityDefaultRules ) ) {
  //   builder.rules = entityDefaultRules;
  // }

  const entityRules = await defineFn( entity, builder, options );
  const ability = new Ability( rulesLib.parse( entityRules ), { subjectName: getSubjectName } );

  ability.can = can.bind( ability );
  ability.cannot = cannot.bind( ability );

  return ability;
}

/*
* const ability = await abilities.get( 'user', user );
*
* if ( ability.can( 'receive', 'Activity', activity ) ) {
*   // activities...
* }
* */

const service = {
  init: config.init,
  db: {
    migrate: config.migrate,
    seed: config.seed
  },
  get,
  rules: rulesLib
};

module.exports = service;
