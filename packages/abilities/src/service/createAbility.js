import _ from 'lodash';
import { Ability } from '@casl/ability';
import * as rulesLib from './rules.js';

export const SUBJECT_NAME = Symbol(
  '@openagenda/abilities/Ability:SUBJECT_NAME',
);

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
  const isObject = _.isObject(subject);

  if (!haveSubjectProp && isObject) {
    subject[SUBJECT_NAME] = subjectName;
  } else if (subject === undefined) {
    subject = {
      [SUBJECT_NAME]: subjectName,
    };
  }

  const result = func(action, subject, field);

  if (!haveSubjectProp && isObject) {
    delete subject[SUBJECT_NAME];
  }

  return result;
}

export default function createAbility(entityName, identifier, rules) {
  // CASL v6 reads the singular `action` field on raw rules (v2 read `actions`).
  // We keep `actions` (the DB column name) as the internal field everywhere, so
  // mirror it onto `action` only at the CASL boundary. `Rule#origin` preserves
  // the full raw object (incl. id/entityName/identifier and `actions`), which
  // getEditableRules relies on to round-trip rule metadata.
  const rawRules = rulesLib
    .parse(rules)
    .map((rule) => ({ ...rule, action: rule.actions }));

  const ability = new Ability(rawRules, {
    detectSubjectType: getSubjectName,
  });

  ability.can = _.wrap(ability.can.bind(ability), checkWrapper);
  ability.cannot = _.wrap(ability.cannot.bind(ability), checkWrapper);

  ability.entityName = entityName;
  ability.identifier = identifier;

  return ability;
}
