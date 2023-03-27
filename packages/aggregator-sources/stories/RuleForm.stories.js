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

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'RuleForm',
  component: RuleForm,
  decorators: [SourcesCanvasDecorator, ModalDecorator(), IntlDecorator],
};

export const NewRule = () => (
  <Form
    component={RuleForm}
    onSubmit={() => {}}
    sourceSchema={villeDeLille}
    aggregatorAgendaSchema={{ fields: [] }}
  />
);
NewRule.storyName = 'when the rule is new';

export const RuleWithAction = () => (
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
);
RuleWithAction.storyName = 'when the rule has an action';

export const RuleAutomaticField = () => (
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
);
RuleAutomaticField.storyName = 'when the rule has an action with automatic field';
