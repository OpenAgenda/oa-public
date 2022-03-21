import React from 'react';
import SimplePageDecorator from './decorators/SimplePage';
import FormSchemaBuilder from '../client/src/FormSchemaBuilder';
import eventLikeSchema from './fixtures/eventLikeSchema';
import schemaWithCategories from './fixtures/schemaWithCategories';
import mixedMonoMultilingualSchemas from './fixtures/mixedMonoMultilingualSchemas';

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