import _wrap from "lodash/wrap.js";
import _isObject from "lodash/isObject.js";
import "core-js/modules/es.symbol.description.js";
import abilityPkg from '@casl/ability';
import Rule from './Rule.js';
import * as rulesLib from './rules.js';
const {
  Ability
} = abilityPkg;
export const SUBJECT_NAME = Symbol('@openagenda/abilities/Ability:SUBJECT_NAME');
function getSubjectName(subject) {
  if (subject && subject[SUBJECT_NAME]) {
    return subject[SUBJECT_NAME];
  }
  if (!subject || typeof subject === 'string') {
    return subject;
  }
  const Type = typeof subject === 'object' ? subject.constructor : subject;
  return Type.modelName || Type.name;
}
function checkWrapper(func, action, subjectName, conditionsOrSubject, field) {
  let subject = conditionsOrSubject;
  const haveSubjectProp = subject && !!subject[SUBJECT_NAME];
  const isObject = _isObject(subject);
  if (!haveSubjectProp && isObject) {
    subject[SUBJECT_NAME] = subjectName;
  } else if (subject === undefined) {
    subject = {
      [SUBJECT_NAME]: subjectName
    };
  }
  const result = func(action, subject, field);
  if (!haveSubjectProp && isObject) {
    delete subject[SUBJECT_NAME];
  }
  return result;
}
export default function createAbility(entityName, identifier, rules) {
  const ability = new Ability(rulesLib.parse(rules), {
    subjectName: getSubjectName,
    RuleType: Rule
  });
  ability.can = _wrap(ability.can.bind(ability), checkWrapper);
  ability.cannot = _wrap(ability.cannot.bind(ability), checkWrapper);
  ability.entityName = entityName;
  ability.identifier = identifier;
  return ability;
}
//# sourceMappingURL=createAbility.js.map