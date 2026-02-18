import { useState } from 'react';
import { http, HttpResponse } from 'msw';

import '@openagenda/bs-templates/compiled/main.css';
import EventForm from '../src/index.js';
import Providers from './decorators/Providers.js';
import StandardCanvas from './decorators/StandardCanvas.js';
import mswEventsMiddleware from './mswEventsMiddleware.js';
import neversFixture from './fixtures/nevers.json' with { type: 'json' };

const { schema } = neversFixture;

export default {
  title: 'Integrated form',
  parameters: {
    msw: {
      handlers: [
        http.get('/locations', () =>
          HttpResponse.json({ success: true, total: 0, items: [] })),
        http.get('/events', mswEventsMiddleware),
      ],
    },
  },
  decorators: [Providers, StandardCanvas],
};

export const StandardForm = () => {
  const [values, setValues] = useState({
    registration: [{ type: 'link', value: 'https://lien.com' }],
    accessibility: { hi: true, sl: true },
  });

  return (
    <EventForm
      mode="edit"
      includeEventFields
      devOnChange={setValues}
      schema={null}
      locationRes="/locations"
      lang="fr"
      defaultLang="en"
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
    fields: schema.fields.filter(
      (field) => ![].concat(field.write).includes('internal'),
    ),
  };

  return (
    <EventForm
      mode="edit"
      includeEventFields
      devOnChange={setValues}
      schema={schemaWithoutInternals}
      locationRes="/locations"
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

export const FormWithEventsTypeAdditionalFields = () => {
  const [values, setValues] = useState({
    subEvents: [18509250],
  });

  const schemaWithEventsField = {
    ...schema,
    fields: [
      {
        fieldType: 'events',
        field: 'subEvents',
        label: 'Sub events',
        res: '/events',
      },
    ].concat(
      schema.fields.filter(
        (field) => ![].concat(field.write).includes('internal'),
      ),
    ),
  };

  return (
    <EventForm
      mode="edit"
      includeEventFields
      devOnChange={setValues}
      schema={schemaWithEventsField}
      locationRes="/locations"
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
