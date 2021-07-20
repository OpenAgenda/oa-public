import React from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../../client/src/index';
import alertOnSubmit from './alertOnSubmit';

if (module.hot) module.hot.accept();

const Main = () => {
  const props = {
    onSubmit: alertOnSubmit,
    lang: 'fr',
    schema: {
      fields: [{
        field: 'acheckboxfield',
        fieldType: 'checkbox',
        label: 'Make a choice with default',
        optional: false,
        default: [2, 3],
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
          label: 'Option four',
          display: false
        }]
      }, {
        field: 'acheckboxfieldwithmax',
        fieldType: 'checkbox',
        label: 'Make a choice with max number of possible selection',
        max: 2,
        default: [6, 7],
        options: [{
          id: 6,
          value: 'option-six',
          label: 'Option six'
        }, {
          id: 7,
          value: 'option-seven',
          label: 'Option seven'
        }, {
          id: 8,
          value: 'option-eight',
          label: 'Option eight'
        }]
      }, {
        field: 'arequiredcheckboxfieldwithoutdefaults',
        fieldType: 'checkbox',
        label: 'Make a choice without default',
        optional: false,
        options: [{
          id: 5,
          value: 'option-five',
          label: 'Option Five'
        }]
      }]
    }
  };

  return (
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <p>A multiple choice field</p>
        <FormSchemaComponent {...props} />
      </div>
    </div>
  );
};

render(<Main />, document.getElementById('app'));
