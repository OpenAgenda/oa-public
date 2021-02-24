import React from 'react';
import { storiesOf } from '@storybook/react';

import DefineRules from '../src/components/DefineRules';
import Stepper from '../src/components/Stepper';
import SourcesCanvasDecorator from './decorators/SourcesCanvas';
import ModalDecorator from './decorators/ModalDecorator';
import IntlDecorator from './decorators/IntlDecorator';

import aggregatorAgendaSchema from './mocks/DefineRules/TAM.schema.json';
import sourceAgendaSchema from './mocks/DefineRules/NDM.schema.json';
import steps from './mocks/DefineRules/steps.json';
import rules from './mocks/DefineRules/rules.json';

import melSchema from './mocks/DefineRules/MEL_example/MEL.schema.json';
import melRules from './mocks/DefineRules/MEL_example/rules.json';
import melRulesTags from './mocks/DefineRules/MEL_example/rulesWithTagRule.json';
import melAggregatorAgenda from './mocks/DefineRules/MEL_example/melAgenda.json';

const melSourceAgenda = {
  uid: 85645563,
  title: 'Office de Tourisme du Val de Deûle et Lys',
  description: "Agenda de l'Office de Tourisme du Val de Deûle et Lys.",
};

const melSourceAgendaSchema = {
  custom: {},
  fields: [],
};

const melSourceAgendaSchemaAdditional = {
  custom: {},
  fields: [
    {
      field: 'organisateur',
      fieldType: 'text',
      label: {
        fr: 'Organisateur',
        en: 'Organizer',
      },
    },
  ],
};

const sourceAgenda = {
  uid: 123,
  title: 'Nuit des musées 2020',
  slug: 'mondonville',
};

const aggregatorAgenda = {
  uid: 456,
  title: 'Mondonville',
  slug: 'mondonville',
};

const aggregator = {
  rules: [
    {
      query: {
        location: {
          city: ['Mondonville'],
        },
      },
      required: true,
    },
  ],
};

storiesOf('DefineRules - add', module)
  .addDecorator(SourcesCanvasDecorator)
  .addDecorator(ModalDecorator('Ajouter une source'))
  .addDecorator(IntlDecorator)
  .add('Adding a source - empty rule list', () => (
    <div>
      <div className="padding-v-sm">
        <Stepper steps={steps} onSelect={() => {}} additionals={[]} />
      </div>
      <DefineRules
        displayInfo
        aggregatorAgenda={aggregatorAgenda}
        aggregatorAgendaSchema={aggregatorAgendaSchema}
        sourceSchema={sourceAgendaSchema}
        initialRules={[]}
        onSubmit={() => {}}
        onCancel={() => {}}
      />
    </div>
  ));

storiesOf('DefineRules - edit', module)
  .addDecorator(SourcesCanvasDecorator)
  .addDecorator(ModalDecorator(`${sourceAgenda.title} | Règles d'agrégation`))
  .addDecorator(IntlDecorator)
  .add('empty rule list', () => (
    <DefineRules
      displayInfo={false}
      aggregator={aggregator}
      aggregatorAgenda={aggregatorAgenda}
      aggregatorAgendaSchema={aggregatorAgendaSchema}
      sourceAgenda={sourceAgenda}
      sourceSchema={sourceAgendaSchema}
      initialRules={[]}
      onSubmit={() => {}}
      onCancel={() => {}}
    />
  ))
  .add('some rules exist', () => (
    <DefineRules
      displayInfo={false}
      aggregator={aggregator}
      aggregatorAgenda={aggregatorAgenda}
      aggregatorAgendaSchema={aggregatorAgendaSchema}
      sourceAgenda={sourceAgenda}
      sourceSchema={sourceAgendaSchema}
      initialRules={rules}
      onSubmit={() => {}}
      onCancel={() => {}}
    />
  ))
  .add('one rule with text filter, without additional text field', () => (
    <DefineRules
      displayInfo={false}
      aggregator={aggregator}
      aggregatorAgenda={melAggregatorAgenda}
      aggregatorAgendaSchema={melSchema}
      sourceAgenda={melSourceAgenda}
      sourceSchema={melSourceAgendaSchema}
      initialRules={melRules}
      onSubmit={() => {}}
      onCancel={() => {}}
    />
  ))
  .add('one rule with text filter, with additional text field', () => (
    <DefineRules
      displayInfo={false}
      aggregator={aggregator}
      aggregatorAgenda={melAggregatorAgenda}
      aggregatorAgendaSchema={melSchema}
      sourceAgenda={melSourceAgenda}
      sourceSchema={melSourceAgendaSchemaAdditional}
      initialRules={melRules}
      onSubmit={() => {}}
      onCancel={() => {}}
    />
  ))
  .add('one rule with text filter, one rule with tags filter', () => (
    <DefineRules
      displayInfo={false}
      aggregator={aggregator}
      aggregatorAgenda={melAggregatorAgenda}
      aggregatorAgendaSchema={melSchema}
      sourceAgenda={melSourceAgenda}
      sourceSchema={melSourceAgendaSchema}
      initialRules={melRulesTags}
      onSubmit={() => {}}
      onCancel={() => {}}
    />
  ));
