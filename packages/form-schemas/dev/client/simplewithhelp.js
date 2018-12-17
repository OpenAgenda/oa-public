"use strict";

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../../client/src/index';

class Main extends Component {

  render() {

    const props = {
      lang: 'fr',
      schema: {
        fields: [ {
          field: 'anything',
          fieldType: 'text',
          label: 'The label',
          help: 'This is the help message. It appears when the help link is hovered on.',
          helpLink: 'https://openagenda.com'
        } ]
      }
    }

    return <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <FormSchemaComponent { ...props } />
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
