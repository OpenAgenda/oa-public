const _ = require( 'lodash' );
const { AbilityBuilder, Ability, Rule: CaslRule } = require( '@casl/ability' );
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

class Rule extends CaslRule {
  constructor( params ) {
    super( params );

    this.id = params.id || null;
    this.entityName = params.entityName || null;
    this.identifier = params.identifier || null;
  }
}

function createAbility( entityName, identifier, rules ) {
  const ability = new Ability( rulesLib.parse( rules ), {
    subjectName: getSubjectName,
    RuleType: Rule
  } );

  function checkWrapper( func, action, subjectName, subject, field ) {
    const haveSubjectProp = subject && !!subject[ SUBJECT_NAME ];
    const isObject = _.isObject( subject );

    if ( !haveSubjectProp && isObject ) {
      subject[ SUBJECT_NAME ] = subjectName;
    }

    const result = func( action, subject || subjectName, field );

    if ( !haveSubjectProp && isObject ) {
      delete subject[ SUBJECT_NAME ];
    }

    return result;
  }

  ability.can = _.wrap( ability.can.bind( ability ), checkWrapper );
  ability.cannot = _.wrap( ability.cannot.bind( ability ), checkWrapper );

  ability.entityName = entityName;
  ability.identifier = identifier;

  return ability;
}

function createBuilder( entityName, identifier ) {
  const builder = AbilityBuilder.extract();

  function defineWrapper( func, ...args ) {
    const result = func( ...args );

    Object.assign( _.last( this.rules ), {
      entityName,
      identifier
    } );

    return result;
  }

  builder.can = _.wrap( builder.can.bind( builder ), defineWrapper );
  builder.cannot = _.wrap( builder.cannot.bind( builder ), defineWrapper );

  return builder;
}

function getEditableRules( ability ) {
  const { entityName } = ability;

  if ( !entityName ) {
    return [];
  }

  return _.get( config, `editableRules.${entityName}`, [] ).map( rule => {
    const relevantRule = ability.relevantRuleFor( rule.action, rule.subject, rule.conditions );
    const isAble = !!relevantRule && !relevantRule.inverted;

    return _.assign( {}, rule, {
      inverted: !isAble,
      relevantRule: relevantRule ? rulesLib.parse( relevantRule ) : relevantRule
    } );
  } );
}

async function getFormIndex( ability, options = {} ) {
  const completeFormFn = config.interfaces && config.interfaces.completeFormIndex && config.interfaces.completeFormIndex[ ability.entityName ];

  const neededEntities = _.isFunction( completeFormFn ) ? await completeFormFn( ability, options ) : {};
  const entities = {};
  const entitiesRules = [];

  for ( const entityName in neededEntities ) {
    if ( Object.prototype.hasOwnProperty.call( neededEntities, entityName ) ) {
      const listEntitiesFn = config.interfaces && config.interfaces.listEntities && config.interfaces.listEntities[ entityName ];

      if ( !_.isArray( neededEntities[ entityName ] ) ) {
        neededEntities[ entityName ] = [ neededEntities[ entityName ] ];
      }

      if ( !_.isFunction( listEntitiesFn ) ) {
        throw new Error( `Missing interface \`getEntity.${entityName}\`` );
      }

      entities[ entityName ] = await listEntitiesFn( neededEntities[ entityName ] );
      Array.prototype.push.apply( entitiesRules, await rulesLib.list( entityName, neededEntities[ entityName ] ) );
    }
  }

  const formIndex = await _.reduce(
    neededEntities,
    async ( result, identifiers, entityName ) => {
      result = await result;

      result[ entityName ] = await _.reduce(
        Array.isArray( identifiers ) ? identifiers : [ identifiers ],
        async ( result2, identifier ) => {
          result2 = await result2;

          if ( !result2[ identifier ] ) {
            const defineFn = config.interfaces && config.interfaces.defineFor && config.interfaces.defineFor[ entityName ];

            const entityRules = _.remove( entitiesRules, {
              entityName,
              identifier
            } );

            const builder = createBuilder( entityName, identifier );
            const rules = await defineFn( entities[ entityName ][ identifier ], builder, { rules: entityRules } );
            const entityAbility = createAbility( entityName, identifier, rules );

            result2[ identifier ] = getEditableRules( entityAbility );
          }

          return result2;
        },
        {}
      );

      return result;
    },
    {}
  );

  return formIndex;
}

async function get( entityName, identifier, options = {} ) {
  if ( !_.isString( entityName ) ) {
    throw new TypeError( '`entityName` should be a string' );
  }

  if ( !_.isNumber( identifier ) ) {
    throw new TypeError( '`identifier` should be a number' );
  }

  const getEntityFn = config.interfaces && config.interfaces.getEntity && config.interfaces.getEntity[ entityName ];
  const defineFn = config.interfaces && config.interfaces.defineFor && config.interfaces.defineFor[ entityName ];

  if ( !_.isFunction( getEntityFn ) ) {
    throw new Error( `Missing interface \`getEntity.${entityName}\`` );
  }

  if ( !_.isFunction( defineFn ) ) {
    throw new Error( `Missing interface \`defineFor.${entityName}\`` );
  }

  const builder = createBuilder( entityName, identifier );
  const entity = options && options.entity ? options.entity : await getEntityFn( identifier );
  const entityRules = await defineFn( entity, builder, options );
  const ability = createAbility( entityName, identifier, entityRules );

  ability.entity = entity;
  ability.getFormIndex = getFormIndex.bind( null, ability );

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
  getFormIndex,
  rules: rulesLib
};

module.exports = service;
