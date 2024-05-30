import { Provider } from 'react-redux';
import { createStore } from 'redux';

import { http, HttpResponse } from 'msw';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import RuleForm from '../src/components/RuleForm';
import { ruleToValues } from '../src/utils/rules';
import ModalDecorator from './decorators/ModalDecorator';
import IntlDecorator from './decorators/IntlDecorator';
import SourcesCanvasDecorator from './decorators/SourcesCanvas';

import villeDeLille from './fixtures/RuleForm/villeDeLille.schema.json';
import MEL from './fixtures/RuleForm/MEL.schema.json';
import villeDeLilleToMELRules from './fixtures/RuleForm/villeDeLilleToMEL.rules.json';
import languagesJson from './fixtures/RuleForm/languages.aggreg.json';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'RuleForm',
  component: RuleForm,
  decorators: [SourcesCanvasDecorator, ModalDecorator(), IntlDecorator],
  parameters: {
    msw: {
      handlers: [
        http.get('/agendaLanguages', () => HttpResponse.json({ ...languagesJson })),
      ],
    },
  },
};

export const NewRule = () => (
  <Provider store={createStore(v => v, { res: {} })}>
    <Form
      component={RuleForm}
      onSubmit={() => {}}
      sourceSchema={villeDeLille}
      aggregatorAgendaSchema={{ fields: [] }}
      sourceAgenda={{ uid: 4350114 }}
      res={{
        languages: '/agendaLanguages',
      }}
    />
  </Provider>
);
NewRule.storyName = 'when the rule is new';

export const RuleWithAction = () => (
  <Provider store={createStore(v => v, { res: {} })}>
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
  </Provider>
);
RuleWithAction.storyName = 'when the rule has an action';

export const RuleAutomaticField = () => (
  <Provider store={createStore(v => v, { res: {} })}>
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
  </Provider>
);
RuleAutomaticField.storyName = 'when the rule has an action with automatic field';
