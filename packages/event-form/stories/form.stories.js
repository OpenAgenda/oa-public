import { useState } from 'react';
import { rest } from 'msw';

import '@openagenda/bs-templates/compiled/main.css';
import EventForm from '../src';
import Providers from './decorators/Providers';
import StandardCanvas from './decorators/StandardCanvas';

import { schema } from './fixtures/nevers.json';

export default {
  title: 'Integrated form',
  parameters: {
    msw: {
      handlers: [
        rest.get('/locations', (req, res, ctx) => res(
          ctx.json({ success: true, total: 0, items: [] }),
        )),
      ],
    },
  },
  decorators: [Providers, StandardCanvas],
};

export const StandardForm = () => {
  const [values, setValues] = useState({
    registration: [{ type: 'link', value: 'https://lien.com' }],
    accessibility: { hi: true, sl: true },
    references: [45527593],
  });

  return (
    <EventForm
      mode="edit"
      includeEventFields
      devOnChange={setValues}
      schema={null}
      locationRes="/locations"
      referencesRes="/references"
      suggestionsRes="/references"
      lang="fr"
      classNames={{
        fieldsCanvas: 'padding-all-md wsq',
        bottomErrorsCanvas: 'error-summary padding-all-md',
        bottomActionsCanvas: 'padding-all-md wsq',
      }}
      values={values}
    />
  );
};

export const FormWithAdditionalFields = () => {
  const [values, setValues] = useState({
    registration: [{ type: 'link', value: 'https://lien.com' }],
    accessibility: { hi: true, sl: true },
  });

  const schemaWithoutInternals = {
    ...schema,
    fields: schema.fields
      .filter(field => ![].concat(field.write).includes('internal')),
  };

  return (
    <EventForm
      mode="edit"
      includeEventFields
      devOnChange={setValues}
      schema={schemaWithoutInternals}
      locationRes="/locations"
      referencesRes="/references"
      suggestionsRes="/references"
      lang="fr"
      classNames={{
        fieldsCanvas: 'padding-all-md wsq',
        bottomErrorsCanvas: 'error-summary padding-all-md',
        bottomActionsCanvas: 'padding-all-md wsq',
      }}
      values={values}
    />
  );
};
