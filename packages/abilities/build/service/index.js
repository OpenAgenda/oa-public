import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _isNumber from "lodash/isNumber.js";
import _isString from "lodash/isString.js";
import _matches from "lodash/matches.js";
import _find from "lodash/find.js";
import _reduce from "lodash/reduce.js";
import _isArray from "lodash/isArray.js";
import _pick from "lodash/pick.js";
import _assign from "lodash/assign.js";
import _isFunction from "lodash/isFunction.js";
import _get from "lodash/get.js";
import "core-js/modules/es.promise.js";
import _Promise from "@babel/runtime-corejs3/core-js/promise";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import createAbility, { SUBJECT_NAME } from './createAbility.js';
import createBuilder from './createBuilder.js';
import * as rulesLib from './rules.js';
import * as middleware from './middleware.js';
import config, { init } from './config.js';
function getEditableRules(ability, entity) {
  const {
    entityName
  } = ability;
  if (!entityName) {
    return [];
  }
  const editableRulesGetter = _get(config, "interfaces.editableRules.".concat(entityName));
  if (!_isFunction(editableRulesGetter)) {
    throw new Error("Missing interface `editableRules.".concat(entityName, "`"));
  }
  const editableRules = editableRulesGetter(ability, entity);
  return editableRules.map(rule => {
    const subject = _objectSpread(_objectSpread({}, rule.conditions), {}, {
      [SUBJECT_NAME]: rule.subject
    });
    const relevantRule = ability.relevantRuleFor(rule.actions || rule.action, subject);
    const isAble = !!relevantRule && !relevantRule.inverted;
    return _assign(_pick(rule, 'tag'), rulesLib.parse(rule), {
      inverted: !isAble,
      relevantRule: relevantRule ? rulesLib.parse(relevantRule) : relevantRule
    });
  });
}
function batchUpdate(_ref, collection) {
  let {
    table,
    column
  } = _ref;
  return config.knex.transaction(trx => {
    const queries = collection.map(item => config.knex(table).where(column, item[column]).update(item).transacting(trx));
    return _Promise.all(queries).then(trx.commit).catch(trx.rollback);
  });
}
export async function getFormIndex(ability) {
  let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const completeFormFn = _get(config, "interfaces.completeFormIndex.".concat(ability.entityName));
  const neededEntities = _isFunction(completeFormFn) ? await completeFormFn(ability, options) : {
    [ability.entityName]: ability.identifier
  };
  const entities = {};
  const entitiesRules = [];
  for (const entityName in neededEntities) {
    if (Object.prototype.hasOwnProperty.call(neededEntities, entityName)) {
      const listEntitiesFn = _get(config, "interfaces.listEntities.".concat(entityName));
      if (!_isArray(neededEntities[entityName])) {
        neededEntities[entityName] = [neededEntities[entityName]];
      }
      if (!_isFunction(listEntitiesFn)) {
        throw new Error("Missing interface `listEntities.".concat(entityName, "`"));
      }
      entities[entityName] = await listEntitiesFn(neededEntities[entityName]);
      Array.prototype.push.apply(entitiesRules, await rulesLib.list(entityName, neededEntities[entityName]));
    }
  }
  const formIndex = await _reduce(neededEntities, async (accu, identifiers, entityName) => {
    const result = await accu;
    return result.concat(await _reduce(Array.isArray(identifiers) ? identifiers : [identifiers], async (accu2, identifier) => {
      const result2 = await accu2;

      // const found = _.find( result2, { entityName, identifier } );
      //
      // if ( found ) {
      //   return result2;
      // }

      const defineFn = _get(config, "interfaces.defineFor.".concat(entityName));
      const entity = _find(entities[entityName], {
        [config.entityMapping[entityName]]: identifier
      });
      const builder = createBuilder(entityName, identifier);
      const rules = await defineFn(entity, builder, {
        rules: entitiesRules
      });
      const entityAbility = createAbility(entityName, identifier, rules);
      return result2.concat(getEditableRules(entityAbility, entity).map(rule => _objectSpread(_objectSpread({}, rule), {}, {
        id: undefined,
        entityName,
        identifier,
        entity
      })));
    }, []));
  }, []);
  return formIndex;
}
export async function updateFormIndex(ability, data) {
  const formIndex = await ability.getFormIndex();
  const matchesRule = test => _matches(_pick(test, 'entityName', 'identifier', 'actions', 'subject', 'conditions'));
  const {
    toCreate,
    toUpdate
  } = _reduceInstanceProperty(formIndex).call(formIndex, (result, rule) => {
    const dataRule = _find(data, matchesRule(rule));
    if (!dataRule) {
      return result;
    }
    if (rule.relevantRule && matchesRule(rule)(rule.relevantRule)) {
      if (dataRule.inverted !== rule.relevantRule.inverted) {
        result.toUpdate.push(_objectSpread(_objectSpread({}, rule), {}, {
          id: rule.relevantRule.id,
          inverted: !!dataRule.inverted
        }));
      }
    } else {
      result.toCreate.push(_objectSpread(_objectSpread({}, rule), {}, {
        inverted: !!dataRule.inverted
      }));
    }
    return result;
  }, {
    toCreate: [],
    toUpdate: []
  });
  await _Promise.all([toUpdate.length ? batchUpdate({
    table: config.schemas.rule,
    column: 'id'
  }, rulesLib.format(toUpdate)) : null, toCreate.length ? config.knex.batchInsert(config.schemas.rule, rulesLib.format(toCreate)).returning('id') : null]);
  return ability.getFormIndex();
}
export async function get(entityName, identifier) {
  let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
  if (!_isString(entityName)) {
    throw new TypeError('`entityName` should be a string');
  }
  if (!_isNumber(identifier)) {
    throw new TypeError('`identifier` should be a number');
  }
  const getEntityFn = _get(config, "interfaces.getEntity.".concat(entityName));
  const defineFn = _get(config, "interfaces.defineFor.".concat(entityName));
  if (!_isFunction(getEntityFn)) {
    throw new Error("Missing interface `getEntity.".concat(entityName, "`"));
  }
  if (!_isFunction(defineFn)) {
    throw new Error("Missing interface `defineFor.".concat(entityName, "`"));
  }
  const builder = createBuilder(entityName, identifier);
  const entity = options && options.entity ? options.entity : await getEntityFn(identifier);
  const entityRules = await defineFn(entity, builder, options);
  const ability = createAbility(entityName, identifier, entityRules);
  ability.entity = entity;
  ability.getFormIndex = getFormIndex.bind(null, ability);
  ability.updateFormIndex = updateFormIndex.bind(null, ability);
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
  createBuilder
};
service.middleware = {
  getFormIndex: middleware.getFormIndex.bind(null, service),
  updateFormIndex: middleware.updateFormIndex.bind(null, service)
};
export default service;
export { middleware, rulesLib as rules, createAbility, createBuilder };
export { default as config, init } from './config.js';
//# sourceMappingURL=index.js.map