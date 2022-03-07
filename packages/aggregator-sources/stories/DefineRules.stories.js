import React from 'react';

import DefineRules from '../src/components/DefineRules';
import Stepper from '../src/components/Stepper';
import SourcesCanvasDecorator from './decorators/SourcesCanvas';
import ModalDecorator from './decorators/ModalDecorator';
import IntlDecorator from './decorators/IntlDecorator';

import aggregatorAgendaSchema from './mocks/DefineRules/TAM.schema.json';
import sourceAgendaSchema from './mocks/DefineRules/NDM.schema.json';
import steps from './mocks/DefineRules/steps.json';
import rules from './mocks/DefineRules/rules.json';

import manyAddFieldsAggrSchema from './mocks/DefineRules/manyAdditionalFields.aggregator.schema.json';

import '@openagenda/bs-templates/compiled/main.css';

const sourceAgendaSchemaOneAdditional = {
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

export default {
  title: 'DefineRules',
  component: DefineRules,
};

export const AddSource = () => (
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
);
AddSource.storyName = 'Add/Empty rule list';
AddSource.decorators = [
  SourcesCanvasDecorator,
  ModalDecorator('Ajouter une source'),
  IntlDecorator,
];

export const EditEmpty = () => (
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
);
EditEmpty.storyName = 'Edit/Empty rule list';
EditEmpty.decorators = [
  SourcesCanvasDecorator,
  ModalDecorator(`${sourceAgenda.title} | Règles d'agrégation`),
  IntlDecorator,
];

export const EditMany = () => (
  <DefineRules
    displayInfo={false}
    aggregator={null}
    aggregatorAgenda={aggregatorAgenda}
    aggregatorAgendaSchema={manyAddFieldsAggrSchema}
    sourceAgenda={sourceAgenda}
    sourceSchema={sourceAgendaSchemaOneAdditional}
    initialRules={rules}
    onSubmit={() => {}}
    onCancel={() => {}}
  />
);
EditMany.storyName = 'Edit/Many rules exist';
EditMany.decorators = [
  SourcesCanvasDecorator,
  ModalDecorator(`${sourceAgenda.title} | Règles d'agrégation`),
  IntlDecorator,
];

const brokenRules = [
  {
    id: 1,
    query: {
      'category-group': [29],
    },
    actions: [
      {
        field: 'types-devenement',
        values: [10],
        automatic: false,
      },
    ],
    required: false,
  },
];

export const EditBroken = () => (
  <DefineRules
    displayInfo={false}
    aggregator={aggregator}
    aggregatorAgenda={aggregatorAgenda}
    aggregatorAgendaSchema={aggregatorAgendaSchema}
    sourceAgenda={sourceAgenda}
    sourceSchema={sourceAgendaSchema}
    initialRules={brokenRules}
    onSubmit={() => {}}
    onCancel={() => {}}
  />
);
EditBroken.storyName = 'Edit/Broken rule list';
EditBroken.decorators = [
  SourcesCanvasDecorator,
  ModalDecorator(`${sourceAgenda.title} | Règles d'agrégation`),
  IntlDecorator,
];
