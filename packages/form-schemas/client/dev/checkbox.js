import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../src/index';

if ( module.hot ) module.hot.accept();

class Main extends Component {

  render() {

    const props = {
      res: {
        post: '',
        redirect: '/'
      },
      lang: 'fr',
      schema: {
        fields: [ {
          field: 'aradiofield',
          fieldType: 'checkbox',
          label: 'Make a choice',
          optional: false,
          options: [ {
            id: 1,
            value: 'option-one',
            label: 'Option one'
          }, {
            id: 2,
            value: 'option-two',
            label: 'Option two'
          }, {
            id: 3,
            value: 'option-three',
            label: 'Option three'
          } ]
        } ]
      }
    }

    return <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <p>A single choice field</p>
        <FormSchemaComponent { ...props } />
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
