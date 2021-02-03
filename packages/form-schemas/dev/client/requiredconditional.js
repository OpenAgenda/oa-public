import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../../client/src/index';

import { schema } from '../schemas/simplest';

if ( module.hot ) module.hot.accept();

class Main extends Component {

  render() {
    const props = {
      lang: 'fr',
      withErrors: true,
      schema: {
        fields : [/*{
          field : "anything",
          fieldType : "text",
          label : 'A word'
        }, {
          field: 'conditioned',
          fieldType : 'text',
          optional: false,
          label: 'This is only enabled if first field is typed',
          enableWith: 'anything'
        }, */{
          field: 'radios',
          fieldType: 'radio',
          label: 'Radio',
          default: 1,
          options: [{
            id: 1,
            label: 'Betelgeuse',
            value: 'betelgeuse'
          }, {
            id: 2,
            label: 'Chausson',
            value: 'chausson'
          }, {
            id: 3,
            label: 'Hydroxychloroquine',
            value: 'hydroxychloroquine'
          }]
        },/* {
          field: 'moreconditioned',
          fieldType: 'text',
          optional: false,
          label: 'This is only enabled if previous radio has a value',
          enableWith: 'radios'
        }, {
          field: 'numberfield',
          fieldType: 'number',
          optional: false,
          label: 'This number field only enabled if previous radio has a value',
          enableWith: 'radios'
        }, {
          field: 'textfield',
          fieldType: 'text',
          optional: false,
          label: 'Write in that',
          info: 'Activated if Betelgeuse or Hydroxychloroquine',
          enableWith: {
            field: 'radios',
            value: [1, 3]
          }
        },*/ {
          field: 'thisorthat',
          fieldType: 'text',
          label: 'This or that',
          info: 'Optional only if Chausson or Hydroxychloroquine',
          optionalWith: {
            field: 'radios',
            value: [2, 3]
          }
        }]
      }
    }

    return <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <FormSchemaComponent { ...props } />
      </div>
    </div>
  }

}

render(<Main />, document.getElementById('app'));
