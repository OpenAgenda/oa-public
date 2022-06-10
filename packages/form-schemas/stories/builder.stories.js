import React from 'react';
import SimplePageDecorator from './decorators/SimplePage';
import FormSchemaBuilder from '../client/src/FormSchemaBuilder';
import eventLikeSchema from './fixtures/eventLikeSchema';
import schemaWithCategories from './fixtures/schemaWithCategories';
import mixedMonoMultilingualSchemas from './fixtures/mixedMonoMultilingualSchemas';
import FormSchemaComponent from '../client/src/index';
import Options from '../client/src/FormSchemaBuilder/Options';
import optionsValidator from '../client/src/FormSchemaBuilder/lib/optionsValidator';

export default {
  title: 'Form builder',
  decorators: [SimplePageDecorator],
};

export function StandardBuilderConfigurationExample() {
  const schema = {
    fields: [{
      field: 'myfield',
      fieldType: 'text',
      label: { fr: 'Mon champ' }
    }]
  };

  const extensions = [{
    schema: eventLikeSchema,
    info: {
      label: { fr: 'Standard', en: 'Standard' },
      detail: { fr: 'Champ événement standard', en: 'Standard event field' }
    }
  }, {
    schema: schemaWithCategories,
    info: {
      label: { fr: 'Réseau', en: 'Network' },
      detail: { fr: 'Champ requis par le réseau d\'agendas', en: 'Field required by the agenda network' }
    }
  }];

  function onUpdate(updatedSchema) {
    console.log(updatedSchema);
  }

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
              devState={{
                // editedField: 'title'
              }}
              schema={schema}
              extendedFrom={extensions}
              onUpdate={onUpdate}
              renderHead={()=>(
                <span className="padding-all-sm">This goes on top of the builder</span>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TroubleshootMonolingual() {
  function onUpdate(updatedSchema) {
    console.log(updatedSchema);
  }

  return (
    <div className="container top-margined">
      <div className="row margin-v-md">
        <div className="col-sm-9">
          <div className="margin-v-md">
            <strong>If some options of the schema are multilingual, schema should be defined as such.</strong>
          </div>
          <FormSchemaBuilder
            maxFields={2}
            editableExtensions
            lang="fr"
            addEnabled
            settingsEnabled
            devState={{
            // editedField: 'title'
            }}
            schema={mixedMonoMultilingualSchemas.schema}
            extendedFrom={mixedMonoMultilingualSchemas.extensions}
            onUpdate={onUpdate}
            renderHead={()=>(
              <span className="padding-all-sm">This goes on top of the builder</span>
            )}
          />
        </div>
      </div>
    </div>
  );
}

export function OptionsState() {
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
          fields: [ {
            field: 'optionsfield',
            fieldType: 'options',
            label: 'Option values',
            languages: [ 'fr', 'en' ],
            optional: false
          } ]
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
          fields: [ {
            field: 'optionsfield',
            fieldType: 'options',
            label: 'Option values',
            languages: [ 'fr', 'en' ],
            optional: false,
            devInitState: {
              mode: 0
            }
          } ]
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
          optionsfield: [ {
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
          } ]
        },
        schema: {
          custom: {
            options: optionsValidator
          },
          fields: [ {
            field: 'optionsfield',
            fieldType: 'options',
            label: 'Option values',
            languages: [ 'fr', 'en' ],
            optional: false
          } ]
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
          optionsfield: [ {
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
          } ]
        },
        schema: {
          custom: {
            options: optionsValidator
          },
          fields: [ {
            field: 'optionsfield',
            fieldType: 'options',
            label: 'Option values',
            languages: [ 'fr', 'en' ],
            optional: false,
            devInitState: {
              mode: 1,
              editedIndex: 1
            }
          } ]
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
          optionsfield: [ {
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
          } ]
        },
        schema: {
          custom: {
            options: optionsValidator
          },
          fields: [ {
            field: 'optionsfield',
            fieldType: 'options',
            label: 'Option values',
            languages: [ 'fr', 'en' ],
            optional: false,
            devInitState: {
              mode: 2
            }
          } ]
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
          fields: [ {
            field: 'optionsfield',
            fieldType: 'options',
            label: 'Option values',
            optional: false
          } ]
        }
      }
    }
  };
    
  return (
    <div className="container top-margined">
    {_.chunk( _.keys( cases ), 3 ).map( ( keys, i ) => <div className="row margin-v-md margin-h-sm" key={'chunk-'+i}>
     { keys.map( ( key, i ) => <div className="col-sm-4" key={'chunk-item-'+i}>
        <div className="text-center margin-v-md">
          <label>{cases[ key ].comment}</label>
        </div>
        <div className="padding-all-sm margin-all-sm wsq">
          <FormSchemaComponent { ...cases[ key ].props } actionComponents={[{ position: 'bottom', Component: () => null }]} />
        </div>
      </div> ) }
    </div> ) }
  </div>
  );
}

export function FormBuilderWithRadios() {

  function onUpdate(updatedSchema) {
    console.log(updatedSchema);
  }

  const schema = {
    fields: [ {
      field: 'aradiofield',
      label: 'Un champ radio',
      fieldType: 'radio',
      options: [ {
        label: 'Une première option',
        value: 'premiereoption',
        id: 1
      } ]
    } ]
  };
  
  return (
    <div className="container top-margined">
      <div className="row margin-v-md">
        <div>
        <FormSchemaBuilder
            lang="fr"
            schema={schema}
            onUpdate={onUpdate}
          />
        </div>
      </div>
    </div>
  );
}

export function FormBuilderWithHandledTypes() {

  function onUpdate(updatedSchema) {
    console.log(updatedSchema);
  }

  const schema = {
    fields: [ {
      field: 'anunhandledtype',
      label: 'Un champ custo',
      fieldType: 'timings'
    } ]
  }
  
  const extensions = [ {
    schema: {
      fields: [ {
        field: 'title',
        label: 'Titre',
        fieldType: 'text'
      } ]
    },
    info: {
      label: 'Standard field',
      detail: 'Though shalt not change this'
    }
  } ];

  return (
    <div className="container top-margined">
      <div>
        <p>When a field type is not standard, or when the field is from a parent schema, only labels can be edited</p>
      </div>
      <div className="row margin-v-md">
        <div>
          <FormSchemaBuilder
            lang="fr"
            schema={schema}
            editableExtensions={true}
            extendedFrom={extensions}
            onUpdate={onUpdate}
          />
        </div>
      </div>
    </div>
  );
}