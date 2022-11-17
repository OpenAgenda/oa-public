import FormSchemaComponent from '../client/src/index';
import Options from '../client/src/FormSchemaBuilder/Options';
import FieldAdd from '../client/src/FormSchemaBuilder/FieldAdd';
import ChooseFieldType from '../client/src/FormSchemaBuilder/ChooseFieldType';
import optionsValidator from '../client/src/FormSchemaBuilder/lib/optionsValidator';
import FormSchemaBuilder from '../client/src/FormSchemaBuilder';
import SimpleRowDecorator from './decorators/SimpleRow';

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

export function IsLinked() {
  const cases = {
    string: {
      comment: 'When enableWith is a string',
      props: {
        maxFields: 2,
        editableExtensions: ['description'],
        onUpdate: logSchema,
        lang: 'fr',
        schema: {
          id: 12,
          fields: [
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
          ],
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
      },
    },
    object: {
      comment: 'When enableWith is an object',
      props: {
        maxFields: 2,
        editableExtensions: ['description'],
        devState: {
          // editedField: 'title'
        },
        lang: 'fr',
        schema: {
          id: 12,
          fields: [
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
          ],
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
      },
    },
    optional: {
      comment: 'optionalWith',
      props: {
        maxFields: 2,
        editableExtensions: ['description'],
        devState: {
          // editedField: 'title'
        },
        lang: 'fr',
        schema: {
          id: 12,
          fields: [
            {
              field: 'attendanceMode',
              label: 'Mode de participation',
              fieldType: 'radio',
              optional: false,
              options: [
                {
                  id: 1,
                  value: 'offline',
                  label: {
                    fr: 'Sur place',
                    en: 'Offline',
                    it: 'In presenza',
                    es: 'Desconnectad',
                    de: 'Offline',
                    br: 'War al lec’h',
                    io: 'crwdns14266:0crwdne14266:0',
                  },
                },
                {
                  id: 2,
                  value: 'online',
                  label: {
                    fr: 'En ligne',
                    en: 'Online',
                    it: 'In linea',
                    es: 'En linea',
                    de: 'Online',
                    br: 'Enlinenn',
                    io: 'crwdns14268:0crwdne14268:0',
                  },
                },
                {
                  id: 3,
                  value: 'mixed',
                  label: {
                    fr: 'Mixte',
                    en: 'Mixed',
                    it: 'Misto',
                    es: 'Mezclado',
                    de: 'Gemischt',
                    br: 'Kemmesk',
                    io: 'crwdns14270:0crwdne14270:0',
                  },
                },
              ],
            },
            {
              field: 'location',
              label: 'Lieu',
              fieldType: 'location',
              optional: false,
              enableWith: null,
              optionalWith: {
                field: 'attendanceMode',
                value: 2,
              },
            },
          ],
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
      },
    },
  };

  const {
    string,
    object,
    optional,
  } = cases;

  return (
    <div className="container top-margined">
      <div className="col-sm-12">
        <div className="text-center margin-v-md">
          <strong>{string.comment}</strong>
        </div>
        <div className="padding-all-sm margin-all-sm wsq">
          <FormSchemaBuilder {...string.props} />
        </div>
      </div>
      <div className="col-sm-12">
        <div className="text-center margin-v-md">
          <strong>{object.comment}</strong>
        </div>
        <div className="padding-all-sm margin-all-sm wsq">
          <FormSchemaBuilder {...object.props} />
        </div>
      </div>
      <div className="col-sm-12">
        <div className="text-center margin-v-md">
          <strong>{optional.comment}</strong>
        </div>
        <div className="padding-all-sm margin-all-sm wsq">
          <FormSchemaBuilder {...optional.props} />
        </div>
      </div>
    </div>
  );
}
