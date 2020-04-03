import React from 'react';
import { storiesOf } from '@storybook/react';

import DefineRules from '../src/components/DefineRules';
import SourcesCanvasDecorator from './decorators/SourcesCanvas';
import ModalDecorator from './decorators/ModalDecorator';
import IntlDecorator from './decorators/IntlDecorator';
import Stepper from '../src/components/Stepper';

import aggregatorAgendaSchema from './mocks/DefineRules/TAM.schema.json';
import sourceAgendaSchema from './mocks/DefineRules/NDM.schema.json';
import steps from './mocks/DefineRules/steps.json';
import rules from './mocks/DefineRules/rules.json';

const sourceAgenda = {
  uid: 123,
  title: 'Nuit des musées 2020',
  slug: 'mondonville'
};

const aggregatorAgenda = {
  uid: 456,
  title: 'Mondonville',
  slug: 'mondonville'
};

storiesOf('DefineRules - add', module)
  .addDecorator(SourcesCanvasDecorator)
  .addDecorator(ModalDecorator('Ajouter une source'))
  .addDecorator(IntlDecorator)
  .add('Adding a source - empty rule list', () => (
      <div>
        <div className="padding-v-sm">
          <Stepper
            steps={steps}
            onSelect={() => {}}
            additionals={[]}
          />
        </div>
        <DefineRules
          displayInfo={true}
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
  .addDecorator(ModalDecorator(sourceAgenda.title + ' | Règles d\'agrégation'))
  .addDecorator(IntlDecorator)
  .add('Editing a source - empty rule list', () => (
      <DefineRules
        displayInfo={false}
        aggregatorAgenda={aggregatorAgenda}
        aggregatorAgendaSchema={aggregatorAgendaSchema}
        sourceAgenda={sourceAgenda}
        sourceSchema={sourceAgendaSchema}
        initialRules={[]}
        onSubmit={() => {}}
        onCancel={() => {}}
      />
  ))
  .add('Editing a source - some rules exist', () => (
    <DefineRules
      displayInfo={false}
      aggregatorAgenda={aggregatorAgenda}
      aggregatorAgendaSchema={aggregatorAgendaSchema}
      sourceAgenda={sourceAgenda}
      sourceSchema={sourceAgendaSchema}
      initialRules={rules}
      onSubmit={() => {}}
      onCancel={() => {}}
    />
  ));
