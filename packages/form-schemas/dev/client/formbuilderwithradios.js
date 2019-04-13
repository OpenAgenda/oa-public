import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaBuilder from '../../client/src/FormSchemaBuilder'

if ( module.hot ) module.hot.accept();

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
}

class Main extends Component {

  onUpdate( updatedSchema ) {

    console.log( updatedSchema );

  }

  render() {

    return <div className="container top-margined">
      <div className="row margin-v-md">
        <div>
          <FormSchemaBuilder
            lang="fr"
            schema={schema}
            onUpdate={this.onUpdate.bind( this )}
          />
        </div>
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
