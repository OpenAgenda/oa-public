import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaBuilder from '../../client/src/FormSchemaBuilder'

if ( module.hot ) module.hot.accept();

const schema = {
  fields:[ {
    field: 'myfield',
    fieldType: 'text',
    label: 'Mon champ'
  } ]
};

const extensions = [ {
  schema: {
    id: -1,
    fields: [ {
      field: 'image',
      fieldType: 'image',
      label: 'Image',
      optional: true
    }, {
      field: 'imageCredits',
      fieldType: 'text',
      label: 'Crédits image',
      optional: true
    }, {
      field: 'languages',
      fieldType: 'languages',
      label: 'Langues'
    }, {
      field: 'title',
      fieldType: 'text',
      label: {
        en: 'Title',
        fr: 'Titre'
      }
    }, {
      field: 'description',
      fieldType: 'text',
      label: 'Description'
    }, {
      field: 'keywords',
      fieldType: 'text',
      label: 'Keywords'
    }, {
      field: 'longDescription',
      fieldType: 'markdown',
      label: 'Long description'
    }, {
      field: 'conditions',
      fieldType: 'text',
      label: 'Conditions'
    }, {
      field: 'age',
      fieldType: 'text',
      label: 'Age'
    }, {
      field: 'registration',
      fieldType: 'registration',
      label: 'Registration'
    }, {
      field: 'accessibility',
      fieldType: 'accessibility',
      label: 'Accessibility conditions'
    }, {
      field: 'location',
      fieldType: 'location',
      label: 'Location'
    }, {
      field: 'timings',
      fieldType: 'timings',
      label: 'Horaires'
    } ]
  },
  info: {
    label: { fr: 'Standard', en: 'Standard' },
    detail: { fr: 'Champ événement standard', en: 'Standard event field' }
  }
}, {
  schema: {
    id: 12,
    fields: [ {
      field: 'categories',
      fieldType: 'radio',
      label: 'Catégories',
      optional: false,
      options: [ {
        id: 1,
        value: 'concert',
        label: 'Concert'
      }, {
        id: 2,
        value: 'theatre',
        label: 'Théatre'
      } ]
    } ]
  },
  info: {
    label: { fr: 'Réseau', en: 'Network' },
    detail: { fr: 'Champ requis par le réseau d\'agendas', en: 'Field required by the agenda network' }
  }
} ];

class Main extends Component {

  onUpdate( updatedSchema ) {

    console.log( updatedSchema );

  }

  render() {

    return <div className="container top-margined">

      <div className="row margin-v-md">
        <div className="col-sm-6">
          <div>
            <FormSchemaBuilder
              lang="fr"
              addEnabled={false}
              devState={{
                //editedField: 'title'
              }}
              schema={schema}
              extendedFrom={extensions}
              onUpdate={this.onUpdate.bind( this )}
            />
          </div>
        </div>
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
