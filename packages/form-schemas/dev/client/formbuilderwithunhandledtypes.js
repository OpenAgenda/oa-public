import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaBuilder from '../../client/src/FormSchemaBuilder'

if ( module.hot ) module.hot.accept();

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

class Main extends Component {

  onUpdate( updatedSchema ) {

    console.log( updatedSchema );

  }

  render() {

    return <div className="container top-margined">
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
            onUpdate={this.onUpdate.bind( this )}
          />
        </div>
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
