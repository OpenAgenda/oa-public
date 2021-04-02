import React from 'react';
import { storiesOf } from '@storybook/react';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import RuleForm from '../src/components/RuleForm';
import { ruleToValues } from '../src/utils/rules';
import ModalDecorator from './decorators/ModalDecorator';
import IntlDecorator from './decorators/IntlDecorator';
import SourcesCanvasDecorator from './decorators/SourcesCanvas';

import villeDeLille from './mocks/RuleForm/villeDeLille.schema.json';
import MEL from './mocks/RuleForm/MEL.schema.json';
import villeDeLilleToMELRules from './mocks/RuleForm/villeDeLilleToMEL.rules.json';

export default storiesOf('RuleForm', module)
  .addDecorator(SourcesCanvasDecorator)
  .addDecorator(ModalDecorator())
  .addDecorator(IntlDecorator)
  .add('when the rule is new', () => (
    <Form
      component={RuleForm}
      onSubmit={() => {}}
      sourceSchema={villeDeLille}
      aggregatorAgendaSchema={{ fields: [] }}
    />
  ))
  .add('when the rule has an action', () => (
    <Form
      initialValues={ruleToValues(villeDeLilleToMELRules[1], MEL)}
      component={RuleForm}
      onSubmit={() => {}}
      mutators={{
        ...arrayMutators,
      }}
      sourceSchema={villeDeLille}
      aggregatorAgendaSchema={MEL}
    />
  ))
  .add('when the rule has an action with automatic field', () => (
    <Form
      initialValues={ruleToValues(villeDeLilleToMELRules[2], MEL)}
      component={RuleForm}
      onSubmit={() => {}}
      mutators={{
        ...arrayMutators,
      }}
      sourceSchema={villeDeLille}
      aggregatorAgendaSchema={MEL}
    />
  ));
