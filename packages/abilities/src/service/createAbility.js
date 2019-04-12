import _ from 'lodash';
import { Ability } from '@casl/ability';
import Rule from './Rule';
import * as rulesLib from './rules';

export const SUBJECT_NAME = Symbol(
  '@openagenda/abilities/Ability:SUBJECT_NAME'
);

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

export default function createAbility( entityName, identifier, rules ) {
  const ability = new Ability( rulesLib.parse( rules ), {
    subjectName: getSubjectName,
    RuleType: Rule
  } );

  function checkWrapper( func, action, subjectName, conditionsOrSubject, field ) {
    const haveSubjectProp = conditionsOrSubject && !!conditionsOrSubject[ SUBJECT_NAME ];
    const isObject = _.isObject( conditionsOrSubject );

    if ( !haveSubjectProp && isObject ) {
      conditionsOrSubject[ SUBJECT_NAME ] = subjectName;
    } else if ( conditionsOrSubject === undefined ) {
      conditionsOrSubject = {
        [ SUBJECT_NAME ]: subjectName
      };
    }

    const result = func( action, conditionsOrSubject, field );

    if ( !haveSubjectProp && isObject ) {
      delete conditionsOrSubject[ SUBJECT_NAME ];
    }

    return result;
  }

  ability.can = _.wrap( ability.can.bind( ability ), checkWrapper );
  ability.cannot = _.wrap( ability.cannot.bind( ability ), checkWrapper );

  ability.entityName = entityName;
  ability.identifier = identifier;

  return ability;
}
