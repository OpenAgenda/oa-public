import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../../client/src/index';
import TextFieldForm from '../../client/src/Components/TextFieldForm';

if ( module.hot ) module.hot.accept();

const field = {
  field: 'name',
  fieldType: 'text',
  label: 'Un nom'
};

class Main extends Component {

  render() {

    return <div className="container top-margined">

      <h1>Text field form</h1>

      <div className="row margin-v-md">
        <div className="col-sm-4 wsq padding-top-sm">
          <TextFieldForm
            lang="fr"
            labelLanguages={[ 'fr', 'en']}
          />
        </div>
        <div className="col-sm-offset-2 col-sm-4 wsq padding-top-sm">
          <div>
            <FormSchemaComponent
              lang="fr"
              schema={{
                fields: [ field ]
              }}
            />
          </div>
        </div>
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
