import _ from 'lodash';
import createAbility from './createAbility';
import createBuilder from './createBuilder';
import * as rulesLib from './rules';
import * as middleware from './middleware';
import config, { init } from './config';


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

export async function getFormIndex( ability, options = {} ) {
  const completeFormFn = config.interfaces
    && config.interfaces.completeFormIndex
    && config.interfaces.completeFormIndex[ ability.entityName ];

  const neededEntities = _.isFunction( completeFormFn ) ? await completeFormFn( ability, options ) : {};
  const entities = {};
  const entitiesRules = [];

  for ( const entityName in neededEntities ) {
    if ( Object.prototype.hasOwnProperty.call( neededEntities, entityName ) ) {
      const listEntitiesFn = config.interfaces
        && config.interfaces.listEntities
        && config.interfaces.listEntities[ entityName ];

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

      return result.concat(
        await _.reduce(
          Array.isArray( identifiers ) ? identifiers : [ identifiers ],
          async ( result2, identifier ) => {
            result2 = await result2;

            const found = _.find( result2, { entityName, identifier } );

            if ( found ) {
              return result2;
            }

            const defineFn = config.interfaces
              && config.interfaces.defineFor
              && config.interfaces.defineFor[ entityName ];

            const entityRules = _.remove( entitiesRules, {
              entityName,
              identifier
            } );

            const entity = _.find( entities[ entityName ], { [ config.entityMapping[ entityName ] ]: identifier } );
            const builder = createBuilder( entityName, identifier );
            const rules = await defineFn( entity, builder, { rules: entityRules } );
            const entityAbility = createAbility( entityName, identifier, rules );

            return result2.concat(
              getEditableRules( entityAbility )
                .map( rule => ( {
                  entityName,
                  identifier,
                  ...rule
                } ) )
            );
          },
          []
        )
      );
    },
    []
  );

  return formIndex;
}

export async function get( entityName, identifier, options = {} ) {
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
  init,
  config,
  get,
  getFormIndex,
  rules: rulesLib,
  middleware
};

export default service;
export { default as config, init } from './config';
export * as rules from './rules';
export * as middleware from './middleware';
