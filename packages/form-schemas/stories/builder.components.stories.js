import FormSchemaComponent from '../client/src/index';
import Options from '../client/src/FormSchemaBuilder/Options';
import FieldAdd from '../client/src/FormSchemaBuilder/FieldAdd';
import ChooseFieldType from '../client/src/FormSchemaBuilder/ChooseFieldType';
import optionsValidator from '../client/src/FormSchemaBuilder/lib/optionsValidator';
import FormSchemaBuilder from '../client/src/FormSchemaBuilder';
import SimpleRowDecorator from './decorators/SimpleRow';

import schemaWithLinkedFields from './fixtures/schemaWithLinkedFields.json';

export default {
  title: 'Form builder components',
  decorators: [SimpleRowDecorator],
};

export function ChooseFieldTypeStory() {
  return (
    <div className="col-lg-offset-2 col-lg-4 wsq">
      <p>When the choice is not made</p>
      <ChooseFieldType
        lang="fr"
        onChange={() => {}}
      />

      <p className="margin-top-md">When the choice is made</p>
      <ChooseFieldType
        value="radio"
        lang="fr"
        onChange={() => {}}
      />
    </div>
  );
}

export function FieldAddStory() {
  const consolidatedSchema = {
    fields: [{
      field: 'one',
      label: 'One',
      fieldType: 'text',
    }, {
      field: 'two',
      label: 'Two',
      fieldType: 'integer',
    }],
  };

  return (
    <div className="col-lg-offset-2 col-lg-4 wsq">
      <p>Type <i>One</i> as field name to see duplicate detection happen</p>
      <FieldAdd
        modal={false}
        schema={consolidatedSchema}
        labelLanguages={['fr', 'en']}
        lang="fr"
        onAdd={() => {}}
        onClose={() => {}}
      />
    </div>
  );
}

export function OptionsStory() {
  const cases = {
    empty: {
      comment: 'When no values have been defined',
      props: {
        components: {
          options: Options,
        },
        lang: 'fr',
        values: {
          optionsfield: [],
        },
        schema: {
          custom: {
            options: optionsValidator,
          },
          fields: [{
            field: 'optionsfield',
            fieldType: 'options',
            label: 'Option values',
            labelLanguages: ['fr', 'en'],
            optional: false,
          }],
        },
      },
    },
    adding: {
      comment: 'When add button has been clicked',
      props: {
        components: {
          options: Options,
        },
        lang: 'fr',
        values: {
          optionsfield: [],
        },
        schema: {
          custom: {
            options: optionsValidator,
          },
          fields: [{
            field: 'optionsfield',
            fieldType: 'options',
            label: 'Option values',
            labelLanguages: ['fr', 'en'],
            optional: false,
            devInitState: {
              mode: 0,
            },
          }],
        },
      },
    },
    withOptions: {
      comment: 'When component is showing the goods',
      props: {
        components: {
          options: Options,
        },
        lang: 'fr',
        values: {
          optionsfield: [{
            id: 1,
            value: 'un',
            label: {
              fr: 'Un',
              en: 'One',
            },
          }, {
            id: 2,
            value: 'deux',
            label: {
              fr: 'Deux',
              en: 'Two',
            },
          }, {
            id: 3,
            value: 'trois',
            label: {
              fr: 'Trois',
              en: 'Three',
            },
          }],
        },
        schema: {
          custom: {
            options: optionsValidator,
          },
          fields: [{
            field: 'optionsfield',
            fieldType: 'options',
            label: 'Option values',
            labelLanguages: ['fr', 'en'],
            optional: false,
          }],
        },
      },
    },
    withEditedOption: {
      comment: 'When an option is being edited',
      props: {
        components: {
          options: Options,
        },
        lang: 'fr',
        values: {
          optionsfield: [{
            id: 1,
            value: 'un',
            label: {
              fr: 'Un',
              en: 'One',
            },
          }, {
            id: 2,
            value: 'deux',
            label: {
              fr: 'Deux',
              en: 'Two',
            },
          }, {
            id: 3,
            value: 'trois',
            label: {
              fr: 'Trois',
              en: 'Three',
            },
          }],
        },
        schema: {
          custom: {
            options: optionsValidator,
          },
          fields: [{
            field: 'optionsfield',
            fieldType: 'options',
            label: 'Option values',
            labelLanguages: ['fr', 'en'],
            optional: false,
            devInitState: {
              mode: 1,
              editedIndex: 1,
            },
          }],
        },
      },
    },
    dragging: {
      comment: 'After the ordering button is clicked',
      props: {
        components: {
          options: Options,
        },
        lang: 'fr',
        values: {
          optionsfield: [{
            id: 1,
            value: 'un',
            label: {
              fr: 'Un',
              en: 'One',
            },
          }, {
            id: 2,
            value: 'deux',
            label: {
              fr: 'Deux',
              en: 'Two',
            },
          }, {
            id: 3,
            value: 'trois',
            label: {
              fr: 'Trois',
              en: 'Three',
            },
          }],
        },
        schema: {
          custom: {
            options: optionsValidator,
          },
          fields: [{
            field: 'optionsfield',
            fieldType: 'options',
            label: 'Option values',
            labelLanguages: ['fr', 'en'],
            optional: false,
            devInitState: {
              mode: 2,
            },
          }],
        },
      },
    },
    monolingual: {
      comment: 'When no values have been defined',
      props: {
        components: {
          options: Options,
        },
        lang: 'fr',
        values: {
          optionsfield: [],
        },
        schema: {
          custom: {
            options: optionsValidator,
          },
          fields: [{
            field: 'optionsfield',
            fieldType: 'options',
            label: 'Option values',
            optional: false,
          }],
        },
      },
    },
  };

  const {
    empty,
    adding,
    withOptions,
    withEditedOption,
    dragging,
    monolingual,
  } = cases;

  return (
    <div className="container top-margined">
      <div className="col-sm-4">
        <div className="text-center margin-v-md">
          <strong>{empty.comment}</strong>
        </div>
        <div className="padding-all-sm margin-all-sm wsq">
          <FormSchemaComponent {...empty.props} actionComponents={[{ position: 'bottom', Component: () => null }]} />
        </div>
      </div>
      <div className="col-sm-4">
        <div className="text-center margin-v-md">
          <strong>{adding.comment}</strong>
        </div>
        <div className="padding-all-sm margin-all-sm wsq">
          <FormSchemaComponent {...adding.props} actionComponents={[{ position: 'bottom', Component: () => null }]} />
        </div>
      </div>
      <div className="col-sm-4">
        <div className="text-center margin-v-md">
          <strong>{withOptions.comment}</strong>
        </div>
        <div className="padding-all-sm margin-all-sm wsq">
          <FormSchemaComponent {...withOptions.props} actionComponents={[{ position: 'bottom', Component: () => null }]} />
        </div>
      </div>
      <div className="col-sm-4">
        <div className="text-center margin-v-md">
          <strong>{withEditedOption.comment}</strong>
        </div>
        <div className="padding-all-sm margin-all-sm wsq">
          <FormSchemaComponent {...withEditedOption.props} actionComponents={[{ position: 'bottom', Component: () => null }]} />
        </div>
      </div>
      <div className="col-sm-4">
        <div className="text-center margin-v-md">
          <strong>{dragging.comment}</strong>
        </div>
        <div className="padding-all-sm margin-all-sm wsq">
          <FormSchemaComponent {...dragging.props} actionComponents={[{ position: 'bottom', Component: () => null }]} />
        </div>
      </div>
      <div className="col-sm-4">
        <div className="text-center margin-v-md">
          <strong>{monolingual.comment}</strong>
        </div>
        <div className="padding-all-sm margin-all-sm wsq">
          <FormSchemaComponent {...monolingual.props} actionComponents={[{ position: 'bottom', Component: () => null }]} />
        </div>
      </div>
    </div>
  );
}

function logSchema(schema) {
  console.log(schema);
}

function getBuilderProps(fields) {
  return {
    maxFields: 2,
    displaySidebar: false,
    onUpdate: logSchema,
    lang: 'fr',
    schema: {
      id: 12,
      fields,
    },
    info: {
      label: {
        fr: 'Réseau',
        en: 'Network',
      },
      detail: {
        fr: 'Champ requis par le réseau d\'agendas',
        en: 'Field required by the agenda network',
      },
    },
  };
}

export function FieldPreview() {
  return (
    <div className="container-fluid top-margined">

      <div className="row">
        <h2 className="text-center margin-v-md">Basic cases</h2>

        <div className="col-lg-4 col-md-6">
          <strong>Optional text field with purpose</strong>
          <FormSchemaBuilder
            {...getBuilderProps([
              {
                field: 'sometextfield',
                label: { fr: 'Un champ texte' },
                purpose: {
                  fr: 'Ce champ sert à montrer que le role du champ s\'affiche lorsqu\'il est défini',
                },
                fieldType: 'text',
              },
            ])}
          />
        </div>

        <div className="col-lg-4 col-md-6">
          <strong>Required multilingual textarea</strong>
          <FormSchemaBuilder
            {...getBuilderProps([
              {
                label: { fr: 'Languages' },
                field: 'languages',
                fieldType: 'languages',
              },
              {
                field: 'somemultilinguatextfield',
                label: { fr: 'Un champ texte multingue' },
                optional: false,
                languages: [],
                fieldType: 'text',
              },
            ])}
          />
        </div>

        <div className="col-lg-4 col-md-6">
          <strong>Field Hidden</strong>
          <FormSchemaBuilder
            {...getBuilderProps([
              {
                label: 'Image',
                fieldType: 'image',
                display: false,
              },
            ])}
          />
        </div>

        <div className="col-lg-4 col-md-6">
          <strong>Section item with title and without</strong>
          <FormSchemaBuilder
            {...getBuilderProps([
              {
                field: 'title',
                label: 'Title',
                fieldType: 'text',
              },
              {
                type: 'section',
                slug: '12fjdsrj',
              },
              {
                field: 'description',
                label: 'Description',
                fieldType: 'text',
              },
              {
                label: 'Détails sur le lieu',
                type: 'section',
                slug: 'details-sur-le-lieu',
              },
              {
                field: 'address',
                label: 'Adresse',
                type: 'text',
              },
            ])}
          />
        </div>

      </div>

      <div className="row">
        <h2 className="text-center margin-v-md">Linked fields</h2>

        <div className="col-lg-4 col-md-6">
          <strong>enableWith is the name of the linked field</strong>
          <FormSchemaBuilder
            {...getBuilderProps([
              {
                field: 'image',
                label: 'Image',
                fieldType: 'image',
                optional: false,
              },
              {
                field: 'imageCredits',
                label: 'Crédits de l\'image',
                fieldType: 'text',
                optional: false,
                enableWith: 'image',
              },
            ])}
          />
        </div>

        <div className="col-lg-4 col-md-6">
          <strong>enableWith is an object containing the name of the linked field and the values triggering the enable</strong>
          <FormSchemaBuilder
            {...getBuilderProps([
              {
                field: 'type-d-organisateur',
                label: 'Type d\'organisateur',
                fieldType: 'radio',
                optional: false,
                enableWith: null,
                options: [
                  {
                    id: 1,
                    value: 'structure-medico-sociale',
                    label: {
                      fr: 'Structure médico-sociale',
                      en: 'Medical and social structure',
                    },
                  },
                  {
                    id: 2,
                    value: 'theatre-salle-de-spectacle',
                    label: {
                      fr: 'Théâtre / salle de spectacle',
                      en: 'Theater',
                    },
                  },
                  {
                    id: 3,
                    value: 'autre',
                    label: {
                      fr: 'Autre',
                      en: 'Other',
                    },
                  },
                ],
              },
              {
                field: 'autre-type-d-organisateur',
                label: 'Autre type',
                fieldType: 'text',
                optional: true,
                enableWith: {
                  field: 'type-d-organisateur',
                  value: 3,
                },
              },
            ])}
          />
        </div>

        <div className="col-lg-4 col-md-6">
          <strong>Location is optional when attendance mode has given value</strong>
          <FormSchemaBuilder
            maxFields={1}
            lang="fr"
            displaySidebar={false}
            extendedFrom={schemaWithLinkedFields.extensions}
            schema={schemaWithLinkedFields.schema}
          />
        </div>
      </div>

      <div className="row">
        <h2 className="text-center margin-v-md">Default value</h2>

        <div className="col-lg-4 col-md-6">
          <strong>Field with string default value</strong>
          <FormSchemaBuilder
            {...getBuilderProps([
              {
                label: 'Location',
                fieldType: 'location',
                default: '70831886',
              },
            ])}
          />
        </div>

        <div className="col-lg-4 col-md-6">
          <strong>Field with object default value</strong>
          <FormSchemaBuilder
            {...getBuilderProps([
              {
                label: 'Location',
                fieldType: 'location',
                default: {
                  countryCode: 'CH',
                  city: 'Genève',
                  latitude: 46.2050579,
                  longitude: 6.126579,
                },
              },
            ])}
          />
        </div>

        <div className="col-lg-4 col-md-6">
          <strong>Field with default value from options</strong>
          <FormSchemaBuilder
            {...getBuilderProps([
              {
                label: 'Organisateurs',
                fieldType: 'radio',
                default: 1,
                options: [
                  {
                    id: 1,
                    label: {
                      fr: 'Premier organisateur',
                      en: 'First organisator',
                    },
                  },
                  {
                    id: 2,
                    label: {
                      fr: 'Deuxième organisateur',
                      en: 'Second organisator',
                    },
                  },
                ],
              },
            ])}
          />
        </div>

        <div className="col-lg-4 col-md-6">
          <strong>Field with multiple default values from options</strong>
          <FormSchemaBuilder
            {...getBuilderProps([
              {
                label: 'Un champ checkbox',
                fieldType: 'checkbox',
                default: [1, 2],
                options: [
                  {
                    id: 1,
                    label: {
                      fr: 'Premier choix',
                      en: 'First choice',
                    },
                  },
                  {
                    id: 2,
                    label: {
                      fr: 'Deuxième choix',
                      en: 'Second choice',
                    },
                  },
                  {
                    id: 2,
                    label: {
                      fr: 'Troisième choix',
                      en: 'Third choice',
                    },
                  },
                ],
              },
            ])}
          />
        </div>

        <div className="col-lg-4 col-md-6">
          <strong>Field with boolean default value</strong>
          <FormSchemaBuilder
            {...getBuilderProps([
              {
                label: 'Un champ booléen',
                fieldType: 'boolean',
                default: true,
              },
            ])}
          />
        </div>
      </div>
    </div>
  );
}
