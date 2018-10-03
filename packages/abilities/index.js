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

// create an ability per entity
// global can = master entity
// scoped can = scoped entity

function getEditableRules( ability, entityName, identifier ) {
  if ( !entityName ) {
    return [];
  }

  console.log( _.filter( ability.rules, rule => (
    rule.entityName === entityName && [ null, identifier ].includes( rule.identifier )
  ) ) );

  return _.get( config, `editableRules.${entityName}`, [] ).map( rule => {
    const relevantRule = ability.relevantRuleFor( rule.action, rule.subject, rule.conditions );
    const isAble = !!relevantRule && !relevantRule.inverted;

    return _.assign( _.clone( rule ), { inverted: !isAble, relevantRule } );
  } );
}

function convertForForm( ability ) {
  return _.reduce( ability.rules, ( result, rule ) => {
    if ( !rule.identifier ) {
      return result;
    }

    const entityPart = _.pick( rule, 'entityName', 'identifier' );
    let entityRulesIndex = _.findIndex( result, entityPart );

    if ( entityRulesIndex !== -1 ) {
      return result;
    }

    entityPart.rules = getEditableRules( ability, entityPart.entityName, entityPart.identifier );

    result.push( entityPart );

    return result;
  }, [] );
}

async function get( entityName, identifier, options ) {
  if ( !_.isString( entityName ) ) {
    throw new TypeError( '`entityName` should be a string' );
  }

  if ( !_.isNumber( identifier ) ) {
    throw new TypeError( '`identifier` should be a number' );
  }

  const getEntityFn = config.interfaces && config.interfaces.getEntity && config.interfaces.getEntity[ entityName ];
  const defineFn = config.interfaces && config.interfaces.defineFor && config.interfaces.defineFor[ entityName ];

  if ( !_.isFunction( getEntityFn ) ) {
    throw Error( `Missing interface \`getEntityFn.${entityName}\`` );
  }

  if ( !_.isFunction( defineFn ) ) {
    throw Error( `Missing interface \`defineFor.${entityName}\`` );
  }

  const builder = AbilityBuilder.extract();

  function wrapper( func, ...args ) {
    const result = func( ...args );

    Object.assign( _.last( this.rules ), { entityName, identifier } );

    return result;
  };

  builder.can = _.wrap( builder.can, wrapper ).bind( builder );
  builder.cannot = _.wrap( builder.cannot, wrapper ).bind( builder );

  const entity = await getEntityFn( identifier );
  const entityRules = await defineFn( entity, builder, options );
  const ability = new Ability( rulesLib.parse( entityRules ), { subjectName: getSubjectName } );

  ability.can = can.bind( ability );
  ability.cannot = cannot.bind( ability );

  ability.entityName = entityName;
  ability.identifier = identifier;
  ability.convertForForm = () => convertForForm( ability );

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
  convertForForm,
  rules: rulesLib
};

module.exports = service;
