import _find from "lodash/find.js";
import _isMatch from "lodash/isMatch.js";
import _pick from "lodash/pick.js";
import _filter from "lodash/filter.js";
import _matches from "lodash/matches.js";
import _partition from "lodash/partition.js";
import _reduceInstanceProperty from "@babel/runtime-corejs3/core-js/instance/reduce";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/web.dom-collections.iterator.js";
import createDecorator from 'final-form-calculate';
export default _ref => {
  let {
    entityName,
    identifier,
    getRules
  } = _ref;
  return form => {
    const {
      mutators: {
        setFieldData
      },
      getState,
      getFieldState
    } = form;
    return createDecorator({
      field: /rule\d+/,
      updates: (value, field, allValues) => {
        const rules = getRules();
        const [firstEntityRules, otherRules] = _partition(rules, _matches({
          entityName,
          identifier
        }));
        const concernedRule = rules.find(v => v.key === field);
        const relatedRules = _filter(otherRules, _matches(_pick(concernedRule, 'actions', 'subject', 'conditions')));
        const formState = getState();
        const fieldState = getFieldState(field);
        if (formState.pristine && fieldState.initial && fieldState.dirtySinceLastSubmit) {
          return {};
        }
        if (_isMatch(concernedRule, {
          entityName,
          identifier
        })) {
          // when UNcheck an indeterminate checkbox OR all related rules are checked
          if (fieldState.data.indeterminate || relatedRules.length && relatedRules.every(rule => allValues[rule.key] === true)) {
            return _reduceInstanceProperty(relatedRules).call(relatedRules, (result, rule) => {
              if (allValues[rule.key] !== false) {
                result[rule.key] = false;
              }
              return result;
            }, {
              [field]: false
            });
          }
          if (value) {
            return _reduceInstanceProperty(relatedRules).call(relatedRules, (result, rule) => {
              if (allValues[rule.key] !== true) {
                result[rule.key] = true;
              }
              return result;
            }, {});
          }
          return {};
        }
        const relatedFirstRule = _find(firstEntityRules, _matches(_pick(concernedRule, 'actions', 'subject', 'conditions')));
        if (relatedFirstRule && allValues[relatedFirstRule.key]) {
          setFieldData(relatedFirstRule.key, {
            indeterminate: true
          });
        }
        return {};
      }
    })(form);
  };
};
//# sourceMappingURL=getChildCheckboxDecorator.js.map