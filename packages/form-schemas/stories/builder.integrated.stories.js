import { http, HttpResponse } from 'msw';
import { useState } from 'react';
import FormSchemaBuilder from '../client/src/FormSchemaBuilder/index.js';
import SimpleRowDecorator from './decorators/SimpleRow.js';
import eventLikeSchema from './fixtures/eventLikeSchema.json';
import schemaWithCategories from './fixtures/schemaWithCategories.json';
import mixedMonoMultilingualSchemas from './fixtures/mixedMonoMultilingualSchemas.json';

export default {
  title: 'Form builder',
  decorators: [SimpleRowDecorator],
};

export function StandardBuilderConfigurationExample() {
  const initialSchema = {
    fields: [
      {
        field: 'myfield',
        fieldType: 'text',
        label: { fr: 'Mon champ' },
      },
      {
        label: {
          fr: "Description de l'événement",
        },
        type: 'section',
        slug: 'section-public-visiteur',
        display: true,
        schemaId: null,
        schemaType: null,
      },
    ],
  };

  const [schema, setSchema] = useState(initialSchema);

  const extensions = [
    {
      schema: eventLikeSchema,
      info: {
        label: 'Champ Standard',
        detail: 'Champ standard évenemenent',
      },
    },
    {
      schema: schemaWithCategories,
      info: {
        label: { fr: 'Champ réseau', en: 'Network field' },
        detail: {
          fr: "Champ requis par le réseau d'agendas",
          en: 'Field required by the agenda network',
        },
      },
    },
  ];

  return (
    <div className="container top-margined">
      <div className="row margin-v-md">
        <div className="col-sm-9">
          <FormSchemaBuilder
            maxFields={2}
            editableExtensions
            lang="fr"
            addEnabled
            settingsEnabled
            devState={
              {
                // editedField: 'title'
              }
            }
            schema={schema}
            extendedFrom={extensions}
            onUpdate={(updated) => setSchema(updated)}
            renderHead={() => (
              <span className="padding-all-sm">
                This goes on top of the builder
              </span>
            )}
          />
        </div>
        <div className="col-ms-3">
          <p>Updated schema:</p>
          <pre>
            <code>{JSON.stringify(schema, null, 2)}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export function TroubleshootMonolingual() {
  const [schema, setSchema] = useState(mixedMonoMultilingualSchemas.schema);

  return (
    <div className="container top-margined">
      <div className="row margin-v-md">
        <div className="col-sm-9">
          <div className="margin-v-md">
            <ul>
              <li>
                If some options of the schema are multilingual, schema should be
                defined as such.
              </li>
              <li>
                If languages are all removed through label languages control,
                form becomes monolingual
              </li>
            </ul>
          </div>
          <FormSchemaBuilder
            maxFields={2}
            editableExtensions
            lang="fr"
            addEnabled
            settingsEnabled
            devState={
              {
                // editedField: 'title'
              }
            }
            schema={mixedMonoMultilingualSchemas.schema}
            extendedFrom={mixedMonoMultilingualSchemas.extensions}
            onUpdate={(s) => setSchema(s)}
            renderHead={() => (
              <span className="padding-all-sm">
                This goes on top of the builder
              </span>
            )}
          />
        </div>
        <div className="col-sm-3">
          <pre>
            <code>{JSON.stringify(schema, null, 2)}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}

function logSchema(schema) {
  console.log(schema);
}

export function WithRadio() {
  const schema = {
    fields: [
      {
        field: 'aradiofield',
        label: 'Un champ radio',
        fieldType: 'radio',
        options: [
          {
            label: 'Une première option',
            value: 'premiereoption',
            id: 1,
          },
        ],
      },
    ],
  };

  return (
    <div className="container top-margined">
      <div className="row margin-v-md">
        <div>
          <FormSchemaBuilder lang="fr" schema={schema} onUpdate={logSchema} />
        </div>
      </div>
    </div>
  );
}

export function WithNullSchema() {
  const schema = null;

  const extensions = [
    {
      schema: {
        fields: [
          {
            field: 'title',
            label: 'Titre',
            fieldType: 'text',
          },
        ],
      },
      info: {
        label: 'Standard field',
        detail: 'Though shalt not change this',
      },
    },
  ];

  return (
    <div className="container top-margined">
      <div>
        <p>
          Uninitialized schema can be provided as null. Adding a field
          initializes it.
        </p>
      </div>
      <div className="row margin-v-md">
        <div>
          <FormSchemaBuilder
            maxFields={2}
            addEnabled
            lang="fr"
            schema={schema}
            editableExtensions
            extendedFrom={extensions}
            onUpdate={logSchema}
          />
        </div>
      </div>
    </div>
  );
}

export function WithUnhandledType() {
  const schema = {
    fields: [
      {
        field: 'anunhandledtype',
        label: 'Un champ custo',
        fieldType: 'timings',
      },
    ],
  };

  const extensions = [
    {
      schema: {
        fields: [
          {
            field: 'title',
            label: 'Titre',
            fieldType: 'text',
          },
        ],
      },
      info: {
        label: 'Standard field',
        detail: 'Though shalt not change this',
      },
    },
  ];

  return (
    <div className="container top-margined">
      <div>
        <p>
          When a field type is not standard, or when the field is from a parent
          schema, only labels can be edited
        </p>
      </div>
      <div className="row margin-v-md">
        <div>
          <FormSchemaBuilder
            lang="fr"
            schema={schema}
            editableExtensions
            extendedFrom={extensions}
            onUpdate={logSchema}
          />
        </div>
      </div>
    </div>
  );
}

export function WithCustomField() {
  const EnabledRanges = <p>Custom component</p>;

  const schema = {
    fields: [
      {
        field: 'someCustomField',
        label: 'Un champ custo',
        fieldType: 'notreChampCustom',
      },
    ],
  };

  const extensions = [
    {
      schema: {
        fields: [
          {
            field: 'title',
            label: 'Titre',
            fieldType: 'text',
          },
          {
            field: 'nombre',
            label: 'Nombre',
            fieldType: 'integer',
            optional: true,
          },
          {
            field: 'timings',
            label: 'Horaires',
            fieldType: 'timings',
            someCustomParam1: [
              {
                begin: '2022-11-05T11:30',
                end: '2022-11-16T11:30',
              },
            ],
          },
        ],
      },
      info: {
        label: 'Standard field',
        detail: 'Though shalt not change this',
      },
    },
  ];

  return (
    <div className="container top-margined">
      <div>
        <p>
          When a field type is not standard, or when the field is from a parent
          schema, only labels can be edited
        </p>
      </div>
      <div className="row margin-v-md">
        <div>
          <FormSchemaBuilder
            lang="fr"
            schema={schema}
            editableExtensions
            extendedFrom={extensions}
            onUpdate={logSchema}
            components={{
              enabledRanges: EnabledRanges,
            }}
            customFieldConfigurationSchemas={{
              timings: {
                fields: [
                  {
                    field: 'label',
                    fieldType: 'abstract',
                  },
                  {
                    field: 'sub',
                    fieldType: 'abstract',
                  },
                  {
                    field: 'someCustomParam1',
                    fieldType: 'enabledRanges',
                    label: 'Time delimiter',
                  },
                ],
              },
              notreChampCustom: {
                fields: [
                  {
                    field: 'label',
                    fieldType: 'abstract',
                  },
                  {
                    field: 'optional',
                    fieldType: 'abstract',
                  },
                  {
                    field: 'sub',
                    fieldType: 'abstract',
                  },
                ],
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

const customComponent = () => <p>Some custom component</p>;

export function WithRestrictedTimings() {
  const schema = {};

  const extensions = [
    {
      schema: {
        fields: [
          {
            field: 'timings',
            label: 'Horaires',
            fieldType: 'timings',
            someCustomParam1: [
              {
                begin: '2022-11-05T11:30',
                end: '2022-11-16T11:30',
              },
            ],
          },
        ],
      },
      info: {
        label: 'Standard field',
        detail: 'Though shalt not change this',
      },
    },
  ];

  return (
    <div className="container top-margined">
      <div>
        <p>
          When a field type is not standard, or when the field is from a parent
          schema, only labels can be edited
        </p>
      </div>
      <div className="row margin-v-md">
        <div>
          <FormSchemaBuilder
            lang="fr"
            schema={schema}
            editableExtensions
            extendedFrom={extensions}
            onUpdate={logSchema}
            components={{
              enabledRanges: customComponent,
            }}
            customFieldConfigurationSchemas={{
              timings: {
                fields: [
                  {
                    field: 'label',
                    fieldType: 'abstract',
                  },
                  {
                    field: 'sub',
                    fieldType: 'abstract',
                  },
                  {
                    field: 'someCustomParam1',
                    fieldType: 'enabledRanges',
                    label: 'Time delimiter',
                    selfHandled: ['label', 'info', 'help', 'sub'],
                  },
                ],
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

const EnabledRanges = () => <div>Custom component</div>;

export function WithNotRestrictedTimings() {
  const schema = {};

  const extensions = [
    {
      schema: {
        fields: [
          {
            field: 'timings',
            label: 'Horaires',
            fieldType: 'timings',
          },
        ],
      },
      info: {
        label: 'Standard field',
        detail: 'Though shalt not change this',
      },
    },
  ];

  return (
    <div className="container top-margined">
      <div>
        <p>
          When a field type is not standard, or when the field is from a parent
          schema, only labels can be edited
        </p>
      </div>
      <div className="row margin-v-md">
        <div>
          <FormSchemaBuilder
            lang="fr"
            schema={schema}
            editableExtensions
            extendedFrom={extensions}
            onUpdate={logSchema}
            components={{
              enabledRanges: EnabledRanges,
            }}
            customFieldConfigurationSchemas={{
              timings: {
                fields: [
                  {
                    field: 'label',
                    fieldType: 'abstract',
                  },
                  {
                    field: 'sub',
                    fieldType: 'abstract',
                  },
                  {
                    field: 'someCustomParam1',
                    fieldType: 'enabledRanges',
                    label: 'Time delimiter',
                    selfHandled: ['label', 'info', 'help', 'sub'],
                  },
                ],
              },
            }}
          />
        </div>
      </div>
    </div>
  );
}

export function CustomField() {
  const [updatedSchema] = useState(null);
  const schema = {
    fields: [
      {
        field: 'myfield',
        fieldType: 'text',
        label: { fr: 'Mon champ' },
      },
    ],
  };

  const extensions = [];

  return (
    <div className="container top-margined">
      <div className="row margin-v-md">
        <div className="col-sm-9">
          <div>
            <FormSchemaBuilder
              maxFields={2}
              editableExtensions
              lang="fr"
              addEnabled
              settingsEnabled
              devState={
                {
                  // editedField: 'title'
                }
              }
              schema={schema}
              extendedFrom={extensions}
              onUpdate={logSchema}
              renderHead={() => (
                <span className="padding-all-sm">
                  fieldType should not be destroyed on update
                </span>
              )}
            />
          </div>
        </div>
        <span>{JSON.stringify(updatedSchema)}</span>
      </div>
    </div>
  );
}

export function ExtendedSection() {
  const schema = {};

  const extensions = [
    {
      schema: {
        id: 12,
        fields: [
          {
            field: 'title',
            label: 'Titre',
            fieldType: 'text',
          },
          {
            type: 'section',
            slug: 'u8ez',
          },
          {
            field: 'description',
            label: 'Description',
            fieldType: 'text',
          },
        ],
      },
      info: {
        label: 'Réseau',
        info: 'Champ réseau',
      },
    },
  ];

  return (
    <div className="container top-margined">
      <div className="row margin-v-md">
        <div className="col-sm-9">
          <div>
            <FormSchemaBuilder
              maxFields={2}
              editableExtensions
              lang="fr"
              addEnabled
              settingsEnabled
              devState={
                {
                  // editedField: 'title'
                }
              }
              schema={schema}
              extendedFrom={extensions}
              onUpdate={logSchema}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExtendedTextField() {
  const schema = {};

  const extensions = [
    {
      schema: {
        id: 12,
        fields: [
          {
            field: 'title',
            label: 'Titre',
            fieldType: 'text',
            optional: false,
          },
        ],
      },
      info: {
        label: { fr: 'Réseau', en: 'Network' },
        detail: {
          fr: "Champ requis par le réseau d'agendas",
          en: 'Field required by the agenda network',
        },
      },
    },
  ];

  return (
    <div className="container top-margined">
      <div className="row margin-v-md">
        <div className="col-sm-9">
          <div>
            <FormSchemaBuilder
              maxFields={2}
              editableExtensions
              lang="fr"
              addEnabled
              settingsEnabled
              devState={
                {
                  // editedField: 'title'
                }
              }
              schema={schema}
              extendedFrom={extensions}
              onUpdate={logSchema}
              renderHead={() => (
                <span className="padding-all-sm">
                  You should be able to change text fields
                </span>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TargetedEditableExtendedTextField() {
  const schema = {};

  const extensions = [
    {
      schema: {
        id: 12,
        fields: [
          {
            field: 'title',
            label: 'Titre',
            fieldType: 'text',
            optional: false,
          },
          {
            field: 'description',
            label: 'Description',
            fieldType: 'text',
            optional: false,
          },
        ],
      },
      info: {
        label: {
          fr: 'Réseau',
          en: 'Network',
        },
        detail: {
          fr: "Champ requis par le réseau d'agendas",
          en: 'Field required by the agenda network',
        },
      },
    },
  ];

  return (
    <div className="container top-margined">
      <div className="row margin-v-md">
        <div className="col-sm-9">
          <div>
            <FormSchemaBuilder
              maxFields={2}
              editableExtensions={['description']}
              lang="fr"
              addEnabled
              settingsEnabled
              devState={
                {
                  // editedField: 'title'
                }
              }
              schema={schema}
              extendedFrom={extensions}
              onUpdate={logSchema}
              renderHead={() => (
                <div className="padding-all-sm wsq">
                  Only description field should be editable as it is explicited
                  in list provided in editableExtensions prop
                </div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExtendedChoiceField() {
  const schema = {};

  const extensions = [
    {
      schema: {
        id: 12,
        fields: [
          {
            field: 'categories',
            label: 'Catégories',
            fieldType: 'radio',
            optional: false,
            options: [
              {
                label: 'Une première option',
                value: 'premiereoption',
                id: 1,
              },
            ],
          },
        ],
      },
      info: {
        label: { fr: 'Réseau', en: 'Network' },
        detail: {
          fr: "Champ requis par le réseau d'agendas",
          en: 'Field required by the agenda network',
        },
      },
    },
  ];

  return (
    <div className="container top-margined">
      <div className="row margin-v-md">
        <div className="col-sm-9">
          <div>
            <FormSchemaBuilder
              maxFields={2}
              editableExtensions
              lang="fr"
              addEnabled
              settingsEnabled
              devState={
                {
                  // editedField: 'title'
                }
              }
              schema={schema}
              extendedFrom={extensions}
              onUpdate={logSchema}
              renderHead={() => (
                <span className="padding-all-sm">
                  You shouldn&apos;t be able to change options and optional but
                  text fields
                </span>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function CheckboxCategoriesField() {
  const schema = {
    fields: [
      {
        field: 'categories',
        label: 'Catégories',
        help: null,
        helpLink: null,
        helpContent: null,
        info: 'Indiquez dans quelle(s) catégories se classe votre évènement.',
        sub: null,
        placeholder: 'Informations utiles pour la recherche.',
        write: null,
        read: null,
        optional: true,
        display: true,
        enable: true,
        origin: 'custom',
        enableWith: null,
        optionalWith: null,
        related: {
          enable: [],
          optional: [],
          other: [],
        },
        selfHandled: [],
        min: null,
        max: null,
        options: [
          {
            id: 2,
            value: 'culture',
            label: 'Culture',
            info: null,
            display: true,
          },
          {
            id: 3,
            value: 'nature',
            label: 'Nature',
            info: null,
            display: true,
          },
          {
            id: 4,
            value: 'seniors',
            label: 'Séniors',
            info: null,
            display: true,
          },
          { id: 5, value: 'sport', label: 'Sport', info: null, display: true },
          {
            id: 6,
            value: 'solidarites',
            label: 'Solidarités',
            info: null,
            display: true,
          },
          {
            id: 7,
            value: 'festivites',
            label: 'Festivités',
            info: null,
            display: true,
          },
          {
            id: 10,
            value: 'solidarite-citoyennete',
            label: 'Solidarité, citoyenneté…',
            info: null,
            display: true,
          },
          {
            id: 8,
            value: 'mediatheques',
            label: 'Médiathèques',
            info: null,
            display: true,
          },
          {
            id: 9,
            value: 'le-rize',
            label: 'Le Rize',
            info: null,
            display: true,
          },
          {
            id: 11,
            value: 'saison-culturelle-2024-2025',
            label: 'Saison culturelle 2024-2025',
            info: null,
            display: true,
          },
          {
            id: 12,
            value: 'universite-populaire-de-villeurbanne',
            label: 'Université populaire de Villeurbanne',
            info: null,
            display: true,
          },
        ],
        fieldType: 'checkbox',
        schemaId: 30408,
        schemaType: 'agenda',
      },
    ],
  };

  return (
    <div className="container top-margined">
      <div className="row margin-v-md">
        <div className="col-sm-9">
          <FormSchemaBuilder lang="fr" schema={schema} onUpdate={logSchema} />
        </div>
      </div>
    </div>
  );
}

export function HidingAFieldOnAnUndefinedSchema() {
  const extensions = [
    {
      schema: {
        fields: [
          {
            fieldType: 'some-inherited-field',
            label: 'Un champ hérité',
          },
        ],
      },
    },
  ];

  return (
    <div className="container top-margined">
      <div className="row margin-v-md">
        <div className="col-sm-9">
          <div>
            <p>
              Hide the field, no error is thrown and the field becomes hidden
            </p>
            <FormSchemaBuilder
              maxFields={2}
              editableExtensions
              lang="fr"
              addEnabled
              settingsEnabled
              schema={undefined}
              extendedFrom={extensions}
              onUpdate={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export const WithNewOptionValuesToSubmit = {
  parameters: {
    msw: {
      handlers: [
        http.post('/wat', async ({ request }) => {
          const schema = JSON.parse((await request.json()).data);
          let id = 0;

          return HttpResponse.json({
            ...schema,
            fields: schema.fields.map((f) =>
              (f.options
                ? {
                  ...f,
                  options: f.options.map((o) => {
                    id += 1;
                    return {
                      ...o,
                      id,
                    };
                  }),
                }
                : f)),
          });
        }),
      ],
    },
  },
  render: function Render() {
    const [schema, setSchema] = useState({
      fields: [
        {
          field: 'categories',
          label: 'Catégories',
          options: [
            {
              value: 'concert',
              label: 'Concert',
            },
          ],
        },
      ],
    });

    return (
      <div className="container top-margined">
        <div className="row margin-v-md">
          <div className="col-sm-6">
            <p>
              Save the form. The new option ids should be integrated in form
            </p>
            <FormSchemaBuilder
              res="/wat"
              lang="fr"
              schema={schema}
              onUpdate={setSchema}
            />
          </div>
          <div className="col-sm-6 wsq">
            <p>Should show id in schema after save.</p>
            <pre>
              <code>{JSON.stringify(schema, null, 2)}</code>
            </pre>
          </div>
        </div>
      </div>
    );
  },
};

export function MixedLinkedTypes() {
  const schema = {
    fields: [
      {
        field: 'renseignements-complementaires',
        label: {
          fr: 'Renseignements complémentaires',
        },
        write: null,
        read: null,
        display: true,
        enable: true,
        origin: 'custom',
        fieldType: 'boolean',
      },
      {
        display: false,
        field: 'attendanceMode',
        fieldType: 'radio',
        label: 'Mode de participation',
        optional: false,
        default: 1,
        options: [
          {
            id: 1,
            value: 'offline',
            label: 'Sur place',
          },
          {
            id: 2,
            value: 'online',
            label: 'En ligne',
          },
          {
            id: 3,
            value: 'mixed',
            label: 'Mixte',
          },
        ],
        schemaId: null,
        schemaType: 'event',
      },
      {
        field: 'location',
        label: "Adresse de la compagnie ou de l'artiste",
        default: {
          uid: 53614433,
        },
        optionalWith: {
          field: 'attendanceMode',
          value: 2,
        },
        enableWith: 'renseignements-complementaires',
        fieldType: 'location',
        disableChange: false,
        schemaId: -1,
        schemaType: null,
      },
    ],
  };

  return (
    <div className="container top-margined">
      <div className="row margin-v-md">
        <div className="col-sm-9">
          <ul>
            <li>Attendance mode is not displayed but should be displayable</li>
          </ul>
          <div>
            <FormSchemaBuilder
              maxFields={2}
              editableExtensions
              lang="fr"
              addEnabled
              settingsEnabled
              schema={schema}
              extendedFrom={[]}
              onUpdate={() => {}}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
