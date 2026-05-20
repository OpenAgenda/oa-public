import { useState } from 'react';
import FormSchemaBuilder from '../client/src/FormSchemaBuilder/index.js';
import SimpleRowDecorator from './decorators/SimpleRow.js';

import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'Form builder/Conditional logic',
  decorators: [SimpleRowDecorator],
};

const SchemaPanel = ({ schema }) => (
  <div className="col-sm-4">
    <p>Persisted schema:</p>
    <pre>
      <code>{JSON.stringify(schema, null, 2)}</code>
    </pre>
  </div>
);

export function EmptyBuilderForAddFlow() {
  const [schema, setSchema] = useState({ fields: [] });

  return (
    <div className="container top-margined">
      <p>
        Add a few fields, then open one to configure its conditional logic
        against the others.
      </p>
      <div className="row margin-v-md">
        <div className="col-sm-8">
          <FormSchemaBuilder
            lang="fr"
            addEnabled
            settingsEnabled
            schema={schema}
            extendedFrom={[]}
            onUpdate={setSchema}
          />
        </div>
        <SchemaPanel schema={schema} />
      </div>
    </div>
  );
}

export function WithRadioCandidate() {
  const initialSchema = {
    fields: [
      {
        field: 'attendanceMode',
        fieldType: 'radio',
        label: { fr: 'Mode de participation' },
        optional: false,
        options: [
          { id: 1, value: 'offline', label: { fr: 'Sur place' } },
          { id: 2, value: 'online', label: { fr: 'En ligne' } },
          { id: 3, value: 'mixed', label: { fr: 'Mixte' } },
        ],
      },
      {
        field: 'streamUrl',
        fieldType: 'link',
        label: { fr: 'URL de diffusion' },
        optional: true,
      },
      {
        field: 'venue',
        fieldType: 'text',
        label: { fr: 'Adresse du lieu' },
        optional: true,
      },
    ],
  };
  const [schema, setSchema] = useState(initialSchema);

  return (
    <div className="container top-margined">
      <p>
        Edit the URL field and link it to the radio with a specific value (En
        ligne). Edit the Adresse field and link it as
        <strong> optional when </strong>
        attendance mode is Sur place.
      </p>
      <div className="row margin-v-md">
        <div className="col-sm-8">
          <FormSchemaBuilder
            lang="fr"
            addEnabled
            settingsEnabled
            schema={schema}
            extendedFrom={[]}
            onUpdate={setSchema}
          />
        </div>
        <SchemaPanel schema={schema} />
      </div>
    </div>
  );
}

export function WithPreconfiguredLinks() {
  const initialSchema = {
    fields: [
      {
        field: 'wantsNewsletter',
        fieldType: 'boolean',
        label: { fr: 'Souhaite la newsletter' },
        optional: true,
      },
      {
        field: 'email',
        fieldType: 'email',
        label: { fr: 'Adresse e-mail' },
        optional: true,
        enableWith: 'wantsNewsletter',
      },
      {
        field: 'attendanceMode',
        fieldType: 'radio',
        label: { fr: 'Mode de participation' },
        optional: false,
        options: [
          { id: 1, value: 'offline', label: { fr: 'Sur place' } },
          { id: 2, value: 'online', label: { fr: 'En ligne' } },
          { id: 3, value: 'mixed', label: { fr: 'Mixte' } },
        ],
      },
      {
        field: 'venue',
        fieldType: 'text',
        label: { fr: 'Adresse du lieu' },
        optional: false,
        optionalWith: {
          field: 'attendanceMode',
          value: 2,
        },
      },
    ],
  };
  const [schema, setSchema] = useState(initialSchema);

  return (
    <div className="container top-margined">
      <p>
        Two fields ship with conditional logic preset. Opening either should
        auto-expand the “Logique conditionnelle” accordion and round-trip the
        existing configuration.
      </p>
      <div className="row margin-v-md">
        <div className="col-sm-8">
          <FormSchemaBuilder
            lang="fr"
            addEnabled
            settingsEnabled
            schema={schema}
            extendedFrom={[]}
            onUpdate={setSchema}
          />
        </div>
        <SchemaPanel schema={schema} />
      </div>
    </div>
  );
}

export function ExtendedFieldShouldBeReadOnly() {
  const extensions = [
    {
      schema: {
        fields: [
          {
            field: 'title',
            label: { fr: 'Titre' },
            fieldType: 'text',
            optional: false,
            enableWith: null,
          },
          {
            field: 'category',
            label: { fr: 'Catégorie' },
            fieldType: 'radio',
            optional: false,
            options: [
              { id: 1, value: 'a', label: { fr: 'Option A' } },
              { id: 2, value: 'b', label: { fr: 'Option B' } },
            ],
          },
        ],
      },
      info: {
        label: { fr: 'Réseau' },
        detail: { fr: 'Champs hérités' },
      },
    },
  ];
  const [schema, setSchema] = useState({ fields: [] });

  return (
    <div className="container top-margined">
      <p>
        Opening the inherited <em>Titre</em> field shows the Conditional logic
        accordion with its controls disabled (read-only).
      </p>
      <div className="row margin-v-md">
        <div className="col-sm-8">
          <FormSchemaBuilder
            lang="fr"
            addEnabled
            settingsEnabled
            editableExtensions
            schema={schema}
            extendedFrom={extensions}
            onUpdate={setSchema}
          />
        </div>
        <SchemaPanel schema={schema} />
      </div>
    </div>
  );
}

export function EnglishLocale() {
  const initialSchema = {
    fields: [
      {
        field: 'attendance',
        fieldType: 'radio',
        label: { en: 'Attendance' },
        optional: false,
        options: [
          { id: 1, value: 'inperson', label: { en: 'In person' } },
          { id: 2, value: 'remote', label: { en: 'Remote' } },
        ],
      },
      {
        field: 'streamUrl',
        fieldType: 'link',
        label: { en: 'Stream URL' },
        optional: true,
      },
    ],
  };
  const [schema, setSchema] = useState(initialSchema);

  return (
    <div className="container top-margined">
      <p>
        Same flow, English labels — verifies the i18n wiring for the Conditional
        logic accordion.
      </p>
      <div className="row margin-v-md">
        <div className="col-sm-8">
          <FormSchemaBuilder
            lang="en"
            addEnabled
            settingsEnabled
            schema={schema}
            extendedFrom={[]}
            onUpdate={setSchema}
          />
        </div>
        <SchemaPanel schema={schema} />
      </div>
    </div>
  );
}
