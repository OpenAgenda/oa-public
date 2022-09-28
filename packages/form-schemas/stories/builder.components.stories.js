import React from 'react';

import FormSchemaComponent from '../client/src/index';
import Options from '../client/src/FormSchemaBuilder/Options';
import FieldAdd from '../client/src/FormSchemaBuilder/FieldAdd';
import ChooseFieldType from '../client/src/FormSchemaBuilder/ChooseFieldType';
import optionsValidator from '../client/src/FormSchemaBuilder/lib/optionsValidator';
import SimpleRowDecorator from './decorators/SimpleRow';

export default {
  title: 'Form builder components',
  decorators: [SimpleRowDecorator],
};

export function ChooseFieldTypeStory() {
  return (
    <>
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
    </>
  );
}

export function FieldAddStory() {
  return (
    <>
      <div className="col-lg-offset-2 col-lg-4 wsq">
        <FieldAdd
          modal
          labelLanguages={['fr', 'en']}
          lang="fr"
          onAdd={() => {}}
          onClose={() => {}}
        />
      </div>
    </>
  );
}

export function OptionsStory() {
  const cases = {
    empty: {
      comment: 'When no values have been defined',
      props: {
        components: {
          options: Options
        },
        lang: 'fr',
        values: {
          optionsfield: []
        },
        schema: {
          custom: {
            options: optionsValidator
          },
          fields: [{
            field: 'optionsfield',
            fieldType: 'options',
            label: 'Option values',
            labelLanguages: ['fr', 'en'],
            optional: false
          }]
        }
      }
    },
    adding: {
      comment: 'When add button has been clicked',
      props: {
        components: {
          options: Options
        },
        lang: 'fr',
        values: {
          optionsfield: []
        },
        schema: {
          custom: {
            options: optionsValidator
          },
          fields: [{
            field: 'optionsfield',
            fieldType: 'options',
            label: 'Option values',
            labelLanguages: ['fr', 'en'],
            optional: false,
            devInitState: {
              mode: 0
            }
          }]
        }
      }
    },
    withOptions: {
      comment: 'When component is showing the goods',
      props: {
        components: {
          options: Options
        },
        lang: 'fr',
        values: {
          optionsfield: [{
            id: 1,
            value: 'un',
            label: {
              fr: 'Un',
              en: 'One'
            }
          }, {
            id: 2,
            value: 'deux',
            label: {
              fr: 'Deux',
              en: 'Two'
            }
          }, {
            id: 3,
            value: 'trois',
            label: {
              fr: 'Trois',
              en: 'Three'
            }
          }]
        },
        schema: {
          custom: {
            options: optionsValidator
          },
          fields: [{
            field: 'optionsfield',
            fieldType: 'options',
            label: 'Option values',
            labelLanguages: ['fr', 'en'],
            optional: false
          }]
        }
      }
    },
    withEditedOption: {
      comment: 'When an option is being edited',
      props: {
        components: {
          options: Options
        },
        lang: 'fr',
        values: {
          optionsfield: [{
            id: 1,
            value: 'un',
            label: {
              fr: 'Un',
              en: 'One'
            }
          }, {
            id: 2,
            value: 'deux',
            label: {
              fr: 'Deux',
              en: 'Two'
            }
          }, {
            id: 3,
            value: 'trois',
            label: {
              fr: 'Trois',
              en: 'Three'
            }
          }]
        },
        schema: {
          custom: {
            options: optionsValidator
          },
          fields: [{
            field: 'optionsfield',
            fieldType: 'options',
            label: 'Option values',
            labelLanguages: ['fr', 'en'],
            optional: false,
            devInitState: {
              mode: 1,
              editedIndex: 1
            }
          }]
        }
      }
    },
    dragging: {
      comment: 'After the ordering button is clicked',
      props: {
        components: {
          options: Options
        },
        lang: 'fr',
        values: {
          optionsfield: [{
            id: 1,
            value: 'un',
            label: {
              fr: 'Un',
              en: 'One'
            }
          }, {
            id: 2,
            value: 'deux',
            label: {
              fr: 'Deux',
              en: 'Two'
            }
          }, {
            id: 3,
            value: 'trois',
            label: {
              fr: 'Trois',
              en: 'Three'
            }
          }]
        },
        schema: {
          custom: {
            options: optionsValidator
          },
          fields: [{
            field: 'optionsfield',
            fieldType: 'options',
            label: 'Option values',
            labelLanguages: ['fr', 'en'],
            optional: false,
            devInitState: {
              mode: 2
            }
          }]
        }
      }
    },
    monolingual: {
      comment: 'When no values have been defined',
      props: {
        components: {
          options: Options
        },
        lang: 'fr',
        values: {
          optionsfield: []
        },
        schema: {
          custom: {
            options: optionsValidator
          },
          fields: [{
            field: 'optionsfield',
            fieldType: 'options',
            label: 'Option values',
            optional: false
          }]
        }
      }
    }
  };

  const {
    empty, adding, withOptions, withEditedOption, dragging, monolingual
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
