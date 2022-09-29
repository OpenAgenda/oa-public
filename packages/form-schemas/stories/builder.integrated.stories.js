import React, { useState } from 'react';
import FormSchemaBuilder from '../client/src/FormSchemaBuilder';

import SimpleRowDecorator from './decorators/SimpleRow';
import eventLikeSchema from './fixtures/eventLikeSchema';
import schemaWithCategories from './fixtures/schemaWithCategories';
import mixedMonoMultilingualSchemas from './fixtures/mixedMonoMultilingualSchemas';

export default {
  title: 'Form builder',
  decorators: [SimpleRowDecorator],
};

export function StandardBuilderConfigurationExample() {
  const initialSchema = {
    fields: [{
      field: 'myfield',
      fieldType: 'text',
      label: { fr: 'Mon champ' }
    }]
  };

  const [schema, setSchema] = useState(initialSchema);

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
            devState={{
              // editedField: 'title'
            }}
            schema={schema}
            extendedFrom={extensions}
            onUpdate={updated => setSchema(updated)}
            renderHead={() => (
              <span className="padding-all-sm">This goes on top of the builder</span>
            )}
          />
        </div>
        <div className="col-ms-3">
          <p>Updated schema:</p>
          <pre>
            <code>
              {JSON.stringify(schema, null, 2)}
            </code>
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
              <li>If some options of the schema are multilingual, schema should be defined as such.</li>
              <li>If languages are all removed through label languages control, form becomes monolingual</li>
            </ul>
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
            onUpdate={s => setSchema(s)}
            renderHead={() => (
              <span className="padding-all-sm">This goes on top of the builder</span>
            )}
          />
        </div>
        <div className="col-sm-3">
          <pre>
            <code>{JSON.stringify(schema, null, 2)}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}

export function WithRadio() {
  const schema = {
    fields: [{
      field: 'aradiofield',
      label: 'Un champ radio',
      fieldType: 'radio',
      options: [{
        label: 'Une première option',
        value: 'premiereoption',
        id: 1
      }]
    }]
  };

  function onUpdate(updatedSchema) {
    console.log(updatedSchema);
  }

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

export function WithNullSchema() {
  const schema = null;

  const extensions = [{
    schema: {
      fields: [{
        field: 'title',
        label: 'Titre',
        fieldType: 'text'
      }]
    },
    info: {
      label: 'Standard field',
      detail: 'Though shalt not change this'
    }
  }];

  function onUpdate(updatedSchema) {
    console.log(updatedSchema);
  }

  return (
    <div className="container top-margined">
      <div>
        <p>Uninitialized schema can be provided as null. Adding a field initializes it.</p>
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
            onUpdate={onUpdate}
          />
        </div>
      </div>
    </div>
  );
}

export function WithUnhandledType() {
  const schema = {
    fields: [{
      field: 'anunhandledtype',
      label: 'Un champ custo',
      fieldType: 'timings'
    }]
  };

  const extensions = [{
    schema: {
      fields: [{
        field: 'title',
        label: 'Titre',
        fieldType: 'text'
      }]
    },
    info: {
      label: 'Standard field',
      detail: 'Though shalt not change this'
    }
  }];

  function onUpdate(updatedSchema) {
    console.log(updatedSchema);
  }

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
            editableExtensions
            extendedFrom={extensions}
            onUpdate={onUpdate}
          />
        </div>
      </div>
    </div>
  );
}

export function WithCustomField() {
  const EnabledRanges = <p>Custom component</p>;

  const schema = {
    fields: [{
      field: 'someCustomField',
      label: 'Un champ custo',
      fieldType: 'notreChampCustom'
    }]
  };

  const extensions = [{
    schema: {
      fields: [{
        field: 'title',
        label: 'Titre',
        fieldType: 'text'
      },
      {
        field: 'nombre',
        label: 'Nombre',
        fieldType: 'integer',
        optional: true
      },
      {
        field: 'timings',
        label: 'Horaires',
        fieldType: 'timings',
        someCustomParam1: [{
          begin: '2022-11-05T11:30',
          end: '2022-11-16T11:30'
        }]
      }]
    },
    info: {
      label: 'Standard field',
      detail: 'Though shalt not change this'
    }
  }];

  function onUpdate(updatedSchema) {
    console.log('updatedSchema', updatedSchema);
  }

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
            editableExtensions
            extendedFrom={extensions}
            onUpdate={onUpdate}
            components={{
              enabledRanges: EnabledRanges
            }}
            customFieldConfigurationSchemas={({
              timings: {
                fields: [{
                  field: 'label',
                  fieldType: 'abstract'
                }, {
                  field: 'sub',
                  fieldType: 'abstract'
                }, {
                  field: 'someCustomParam1',
                  fieldType: 'enabledRanges',
                  label: 'Time delimiter'
                }]
              },
              notreChampCustom: {
                fields: [{
                  field: 'label',
                  fieldType: 'abstract'
                }, {
                  field: 'optional',
                  fieldType: 'abstract'
                }, {
                  field: 'sub',
                  fieldType: 'abstract'
                }]
              }
            })}
          />
        </div>
      </div>
    </div>
  );
}

export function WithRestrictedTimings() {
  const schema = {
  };

  const extensions = [{
    schema: {
      fields: [{
        field: 'timings',
        label: 'Horaires',
        fieldType: 'timings',
        someCustomParam1: [{
          begin: '2022-11-05T11:30',
          end: '2022-11-16T11:30'
        }]
      }]
    },
    info: {
      label: 'Standard field',
      detail: 'Though shalt not change this'
    }
  }];

  function onUpdate(updatedSchema) {
    console.log('updatedSchema', updatedSchema);
  }

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
            editableExtensions
            extendedFrom={extensions}
            onUpdate={onUpdate}
            components={{
              enabledRanges: () => <p>Some custom component</p>
            }}
            customFieldConfigurationSchemas={({
              timings: {
                fields: [{
                  field: 'label',
                  fieldType: 'abstract'
                }, {
                  field: 'sub',
                  fieldType: 'abstract'
                }, {
                  field: 'someCustomParam1',
                  fieldType: 'enabledRanges',
                  label: 'Time delimiter',
                  selfHandled: ['label', 'info', 'help', 'sub']
                }]
              }
            })}
          />
        </div>
      </div>
    </div>
  );
}

export function WithNotRestrictedTimings() {
  const schema = {
  };

  const extensions = [{
    schema: {
      fields: [{
        field: 'timings',
        label: 'Horaires',
        fieldType: 'timings',
      }]
    },
    info: {
      label: 'Standard field',
      detail: 'Though shalt not change this'
    }
  }];

  function onUpdate(updatedSchema) {
    console.log('updatedSchema', updatedSchema);
  }

  const EnabledRanges = () => <div>Custom component</div>;

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
            editableExtensions
            extendedFrom={extensions}
            onUpdate={onUpdate}
            components={{
              enabledRanges: EnabledRanges
            }}
            customFieldConfigurationSchemas={({
              timings: {
                fields: [{
                  field: 'label',
                  fieldType: 'abstract'
                }, {
                  field: 'sub',
                  fieldType: 'abstract'
                }, {
                  field: 'someCustomParam1',
                  fieldType: 'enabledRanges',
                  label: 'Time delimiter',
                  selfHandled: ['label', 'info', 'help', 'sub']
                }]
              }
            })}
          />
        </div>
      </div>
    </div>
  );
}

export function CustomField() {
  const [updatedSchema, setUpdatedSchema] = useState(null);
  const schema = {
    fields: [{
      field: 'myfield',
      fieldType: 'text',
      label: { fr: 'Mon champ' }
    }]
  };

  const extensions = [];

  function onUpdate(update) {
    console.log(update);
    setUpdatedSchema(update);
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
              renderHead={() => (
                <span className="padding-all-sm">fieldType should not be destroyed on update</span>
              )}
            />
          </div>
        </div>
        <span>{JSON.stringify(updatedSchema)}</span>
      </div>
    </div>
  );
}

export function ExtendedTextField() {
  const schema = {
  };

  const extensions = [{
    schema: {
      id: 12,
      fields: [
        {
          field: 'title',
          label: 'Titre',
          fieldType: 'text',
          optional: false,
        }
      ]
    },
    info: {
      label: { fr: 'Réseau', en: 'Network' },
      detail: {
        fr: 'Champ requis par le réseau d\'agendas',
        en: 'Field required by the agenda network'
      }
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
              renderHead={() => (
                <span className="padding-all-sm">You should be able to change text fields</span>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function TargetedEditableExtendedTextField() {
  const schema = {
  };

  const extensions = [{
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
          optional: false
        }
      ]
    },
    info: {
      label: {
        fr: 'Réseau',
        en: 'Network'
      },
      detail: {
        fr: 'Champ requis par le réseau d\'agendas',
        en: 'Field required by the agenda network'
      }
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
              editableExtensions={['description']}
              lang="fr"
              addEnabled
              settingsEnabled
              devState={{
                // editedField: 'title'
              }}
              schema={schema}
              extendedFrom={extensions}
              onUpdate={onUpdate}
              renderHead={() => (
                <div className="padding-all-sm wsq">Only description field should be editable as it is explicited in list provided in editableExtensions prop</div>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ExtendedChoiceField() {
  const schema = {
  };

  const extensions = [{
    schema: {
      id: 12,
      fields: [
        {
          field: 'categories',
          label: 'Catégories',
          fieldType: 'radio',
          optional: false,
          options: [{
            label: 'Une première option',
            value: 'premiereoption',
            id: 1
          }]
        }
      ]
    },
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
              renderHead={() => (
                <span className="padding-all-sm">You shouldn&apos;t be able to change options and optional but text fields</span>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function HidingAFieldOnAnUndefinedSchema() {
  const extensions = [{
    schema: {
      fields: [{
        fieldType: 'some-inherited-field',
        label: 'Un champ hérité'
      }]
    }
  }];

  return (
    <div className="container top-margined">
      <div className="row margin-v-md">
        <div className="col-sm-9">
          <div>
            <p>Hide the field, no error is thrown and the field becomes hidden</p>
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
