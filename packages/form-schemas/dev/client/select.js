import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';
import ih from 'immutability-helper';

import FormSchemaComponent from '../../client/src/index';

if (module.hot) module.hot.accept();

import alertOnSubmit from './alertOnSubmit';

const props = {
  lang: 'fr',
  onSubmit: alertOnSubmit,
  schema: {
    fields: [{
      field: 'arequiredselectfield',
      fieldType: 'select',
      label: 'Make a choice',
      optional: false,
      default: 2,
      options: [{
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
      }, {
        id: 4,
        value: 'option-four',
        label: 'Option Four',
        display: false
      }]
    }, {
      field: 'arequiredmultiselect',
      fieldType: 'multiselect',
      label: 'Make some choices',
      optional: false,
      options: [{
        id: 5,
        value: 'option-five',
        label: 'Option five'
      }, {
        id: 6,
        value: 'option-six',
        label: 'Option Six'
      }, {
        id: 7,
        value: 'option-seven',
        label: 'Option seven'
      }, {
        id: 8,
        value: 'option-height',
        label: 'Option Height',
      }, {
        id: 9,
        value: 'option-nine',
        label: 'Option Nine'
      }]
    }, {
      field: 'anoptionalselectfield',
      fieldType: 'select',
      label: 'Make a choice. Or not',
      optional: true,
      options: [{
        id: 10,
        value: 'option-ten',
        label: 'Option Ten'
      }]
    }, {
      field: 'anoptionalmultiselectfield',
      fieldType: 'multiselect',
      label: 'Make some choices. Or not',
      optional: true,
      default: [11],
      options: [{
        id: 11,
        value: 'eleven',
        label: 'Option eleven'
      }, {
        id: 12,
        value: 'twelve',
        label: 'Option twelve'
      }]
    }]
  }
}

class Main extends Component {
  render() {
    return <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <FormSchemaComponent { ...props } />
      </div>
    </div>
  }
}

render(<Main />, document.getElementById('app'));
