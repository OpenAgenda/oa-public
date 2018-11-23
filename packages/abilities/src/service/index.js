import _ from 'lodash';
import createAbility, { SUBJECT_NAME } from './createAbility';
import createBuilder from './createBuilder';
import * as rulesLib from './rules';
import * as middleware from './middleware';
import config, { init } from './config';

function getEditableRules( ability, entity ) {
  const { entityName } = ability;

  if ( !entityName ) {
    return [];
  }

  const editableRulesGetter = _.get(
    config,
    `interfaces.editableRules.${entityName}`
  );

  if ( !_.isFunction( editableRulesGetter ) ) {
    throw new Error( `Missing interface \`editableRules.${entityName}\`` );
  }

  const editableRules = editableRulesGetter( ability, entity );

  return editableRules.map( rule => {
    const subject = Object.assign( {}, rule.conditions, {
      [ SUBJECT_NAME ]: rule.subject
    } );
    const relevantRule = ability.relevantRuleFor(
      rule.actions || rule.action,
      subject
    );

    const isAble = !!relevantRule && !relevantRule.inverted;

    return _.assign( _.pick( rule, 'tag' ), rulesLib.parse( rule ), {
      inverted: !isAble,
      relevantRule: relevantRule ? rulesLib.parse( relevantRule ) : relevantRule
    } );
  } );
}

function batchUpdate( { table, column }, collection ) {
  return config.knex.transaction( trx => {
    const queries = collection.map( item => config
      .knex( table )
      .where( column, item[ column ] )
      .update( item )
      .transacting( trx ) );

    return Promise.all( queries )
      .then( trx.commit )
      .catch( trx.rollback );
  } );
}

export async function getFormIndex( ability, options = {} ) {
  const completeFormFn = _.get(
    config,
    `interfaces.completeFormIndex.${ability.entityName}`
  );
  const neededEntities = _.isFunction( completeFormFn )
    ? await completeFormFn( ability, options )
    : { [ ability.entityName ]: ability.identifier };
  const entities = {};
  const entitiesRules = [];

  for ( const entityName in neededEntities ) {
    if ( Object.prototype.hasOwnProperty.call( neededEntities, entityName ) ) {
      const listEntitiesFn = _.get(
        config,
        `interfaces.listEntities.${entityName}`
      );

      if ( !_.isArray( neededEntities[ entityName ] ) ) {
        neededEntities[ entityName ] = [ neededEntities[ entityName ] ];
      }

      if ( !_.isFunction( listEntitiesFn ) ) {
        throw new Error( `Missing interface \`listEntities.${entityName}\`` );
      }

      entities[ entityName ] = await listEntitiesFn( neededEntities[ entityName ] );
      Array.prototype.push.apply(
        entitiesRules,
        await rulesLib.list( entityName, neededEntities[ entityName ] )
      );
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

            // const found = _.find( result2, { entityName, identifier } );
            //
            // if ( found ) {
            //   return result2;
            // }

            const defineFn = _.get(
              config,
              `interfaces.defineFor.${entityName}`
            );
            const entityRules = _.filter( entitiesRules, {
              entityName,
              identifier
            } );

            const entity = _.find( entities[ entityName ], {
              [ config.entityMapping[ entityName ] ]: identifier
            } );
            const builder = createBuilder( entityName, identifier );
            const rules = await defineFn( entity, builder, {
              rules: entityRules
            } );
            const entityAbility = createAbility( entityName, identifier, rules );

            return result2.concat(
              getEditableRules( entityAbility, entity ).map( rule => ( {
                ..._.omit( rule, 'id' ),
                entityName,
                identifier,
                entity
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

export async function updateFormIndex( ability, data ) {
  const formIndex = await ability.getFormIndex();
  const matchesRule = test => _.matches(
    _.pick(
      test,
      'entityName',
      'identifier',
      'actions',
      'subject',
      'conditions'
    )
  );

  const { toCreate, toUpdate } = formIndex.reduce(
    ( result, rule ) => {
      const dataRule = _.find( data, matchesRule( rule ) );

      if ( !dataRule ) {
        return result;
      }

      if ( rule.relevantRule && matchesRule( rule )( rule.relevantRule ) ) {
        result.toUpdate.push( {
          ...rule,
          id: rule.relevantRule.id,
          inverted: !!dataRule.inverted
        } );
      } else {
        result.toCreate.push( {
          ...rule,
          inverted: !!dataRule.inverted
        } );
      }

      return result;
    },
    { toCreate: [], toUpdate: [] }
  );

  if ( toCreate.length ) {
    await config.knex
      .batchInsert( config.schemas.rule, rulesLib.format( toCreate ) )
      .returning( 'id' );
  }

  if ( toUpdate.length ) {
    await batchUpdate(
      { table: config.schemas.rule, column: 'id' },
      rulesLib.format( toUpdate )
    );
  }

  return ability.getFormIndex();
}

export async function get( entityName, identifier, options = {} ) {
  if ( !_.isString( entityName ) ) {
    throw new TypeError( '`entityName` should be a string' );
  }

  if ( !_.isNumber( identifier ) ) {
    throw new TypeError( '`identifier` should be a number' );
  }

  const getEntityFn = _.get( config, `interfaces.getEntity.${entityName}` );
  const defineFn = _.get( config, `interfaces.defineFor.${entityName}` );

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
  ability.updateFormIndex = updateFormIndex.bind( null, ability );

  return ability;
}

const service = {
  init,
  config,
  get,
  getFormIndex,
  updateFormIndex,
  rules: rulesLib,
  createAbility,
  createBuilder,
  middleware
};

export default service;
export { default as config, init } from './config';
export * as rules from './rules';
export * as middleware from './middleware';
export createAbility from './createAbility';
export createBuilder from './createBuilder';
