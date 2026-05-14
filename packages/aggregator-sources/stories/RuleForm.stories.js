import { Provider } from 'react-redux';
import { createStore } from 'redux';

import { http, HttpResponse } from 'msw';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';

import RuleForm from '../src/components/RuleForm/index.js';
import { ruleToValues } from '../src/utils/rules.js';
import ModalDecorator from './decorators/ModalDecorator.js';
import IntlDecorator from './decorators/IntlDecorator.js';
import SourcesCanvasDecorator from './decorators/SourcesCanvas.js';

import villeDeLille from './fixtures/RuleForm/villeDeLille.schema.json' with { type: 'json' };
import MEL from './fixtures/RuleForm/MEL.schema.json' with { type: 'json' };
import villeDeLilleToMELRules from './fixtures/RuleForm/villeDeLilleToMEL.rules.json' with { type: 'json' };
import languagesJson from './fixtures/RuleForm/languages.aggreg.json' with { type: 'json' };

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'RuleForm',
  component: RuleForm,
  decorators: [SourcesCanvasDecorator, ModalDecorator(), IntlDecorator],
  parameters: {
    msw: {
      handlers: [
        http.get('/agendaLanguages', () =>
          HttpResponse.json({ ...languagesJson })),
      ],
    },
  },
};

export const NewRequiredFilter = () => (
  <Provider store={createStore((v) => v, { res: {} })}>
    <Form
      mutators={{
        ...arrayMutators,
      }}
      component={RuleForm}
      onSubmit={() => {}}
      sourceSchema={villeDeLille}
      aggregatorAgendaSchema={{ fields: [] }}
      sourceAgenda={{ uid: 4350114 }}
      res={{
        languages: '/agendaLanguages',
      }}
      isRequiredFilter
    />
  </Provider>
);
NewRequiredFilter.storyName = 'when the rule is new required filter';

export const NewRule = () => (
  <Provider store={createStore((v) => v, { res: {} })}>
    <Form
      mutators={{
        ...arrayMutators,
      }}
      component={RuleForm}
      onSubmit={() => {}}
      sourceSchema={villeDeLille}
      aggregatorAgendaSchema={{ fields: [] }}
      sourceAgenda={{ uid: 4350114 }}
      res={{
        languages: '/agendaLanguages',
      }}
      isRequiredFilter={false}
    />
  </Provider>
);
NewRule.storyName = 'when the rule is new and not an required filter';

export const RuleWithAction = () => (
  <Provider store={createStore((v) => v, { res: {} })}>
    <Form
      initialValues={ruleToValues(villeDeLilleToMELRules[1], MEL)}
      component={RuleForm}
      onSubmit={() => {}}
      mutators={{
        ...arrayMutators,
      }}
      sourceSchema={villeDeLille}
      aggregatorAgendaSchema={MEL}
      isRequiredFilter={false}
    />
  </Provider>
);
RuleWithAction.storyName = 'when the rule has an action';

export const RuleAutomaticField = () => (
  <Provider store={createStore((v) => v, { res: {} })}>
    <Form
      initialValues={ruleToValues(villeDeLilleToMELRules[2], MEL)}
      component={RuleForm}
      onSubmit={() => {}}
      mutators={{
        ...arrayMutators,
      }}
      sourceSchema={villeDeLille}
      aggregatorAgendaSchema={MEL}
      isRequiredFilter={false}
    />
  </Provider>
);
RuleAutomaticField.storyName = 'when the rule has an action with automatic field';
