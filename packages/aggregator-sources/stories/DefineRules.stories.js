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
  .addDecorator(ModalDecorator('Mondonville | Règles d\'agrégation'))
  .addDecorator(IntlDecorator)
  .add('Editing a source - empty rule list', () => (
      <DefineRules
        displayInfo={false}
        aggregatorAgendaSchema={aggregatorAgendaSchema}
        sourceSchema={sourceAgendaSchema}
        initialRules={[]}
        onSubmit={() => {}}
        onCancel={() => {}}
      />
  ))
  .add('Editing a source - some rules exist', () => (
    <DefineRules
      displayInfo={false}
      aggregatorAgendaSchema={aggregatorAgendaSchema}
      sourceSchema={sourceAgendaSchema}
      initialRules={rules}
      onSubmit={() => {}}
      onCancel={() => {}}
    />
  ));
