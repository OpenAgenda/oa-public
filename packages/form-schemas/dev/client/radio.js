import React from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../../client/src/index';

if (module.hot) module.hot.accept();

const props = {
  res: {
    post: '',
    redirect: '/'
  },
  lang: 'fr',
  schema: {
    fields: [{
      field: 'aradiofield',
      fieldType: 'radio',
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
      field: 'anoptionalreadiofieldwithinfo',
      fieldType: 'radio',
      label: 'Make an informed choice, or not',
      optional: true,
      options: [{
        id: 5,
        value: 'elephant',
        label: 'Elephant',
        info: 'Big and gray, not very hairy.'
      }, {
        id: 6,
        value: 'spider',
        label: 'Spider',
        info: 'Never small enough, with 8 feet and 8 eyes'
      }, {
        id: 7,
        value: 'fork',
        label: 'Fork',
        info: { en: 'Why is this even here?', fr: 'Pourquoi?' }
      }]
    }, {
      field: 'animplicitelyoptionalradiofield',
      fieldType: 'radio',
      label: 'Unspecified optional means optional',
      options: [{
        id: 8,
        value: 'tbag',
        label: 'Tea bag'
      }]
    }, {
      field: 'requiredwithoutvalueatloadisrequired',
      fieldType: 'radio',
      label: 'Required without value at load is required',
      info: 'Do not select anything and submit to see error message',
      optional: false,
      options: [{
        id: 9,
        value: 'scorbut',
        label: 'Scorbut'
      }, {
        id: 10,
        value: 'wall',
        label: 'Wall'
      }]
    }]
  }
};

render(
  <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
    <div className="row margin-v-md margin-h-sm">
      <p>A single required choice field</p>
      <FormSchemaComponent {...props} />
    </div>
  </div>,
  document.getElementById('app')
);
