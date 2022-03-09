import React from 'react';
import SimplePageDecorator from './decorators/SimplePage';
import FormSchemaComponent from '../client/src/index';
import { schema as simplest } from '../dev/schemas/simplest';
import { schema } from '../dev/schemas/servererrors.js';
import '@openagenda/bs-templates/compiled/main.css';
import ih from 'immutability-helper'

export default {
  title: 'Displaying errors',
  decorators: [SimplePageDecorator],
};

export function ErrorsNotDisplayedOnMount() {
  const props = {
    res: {
      post: '',
      redirect: '/'
    },
    lang: 'fr',
    values: {
      conditions: ''
    },
    withErrors: false, // default value
    schema: {
      "fields": [{
        field: "conditions",
        fieldType: "text",
        required: true,
        min: 12,
        label: 'Ce schema a la props withErrors a false',
        sub: 'Tel format est accepté'
      }]
    }
  };
  return (
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <FormSchemaComponent {...props} />
      </div>
    </div>
  );
}

export function ErrorsDisplayedOnMount() {
  const props = {
    res: {
      post: '',
      redirect: '/'
    },
    lang: 'fr',
    values: {
      conditions: ''
    },
    withErrors: true,
    schema: {
      "fields": [{
        field: "conditions",
        fieldType: "text",
        optional: false,
        min: 12,
        label: 'Ce schema a la props withErrors à true',
        sub: 'la la la'
      }]
    }
  };

  const exteriorGroupedErrorsProps = ih(props, {
    classNames: {
      $set: {
        fieldsCanvas: 'wsq padding-all-sm',
        bottomActionsCanvas: 'wsq padding-all-sm padding-top-md'
      }
    },
    errorComponents: {
      $set: [{
        position: 'bottom',
        Component: ({ errors }) =>
          <div className="error-summary padding-v-sm padding-h-sm">
            <div className="padding-bottom-sm">Oh no's! Cannot submit!:</div>
            <ul className="list-unstyled">
              {errors.map((e, i) => <li key={'error-' + i}>
                <label>{e.fieldLabel}</label>:&nbsp;
                <span>{e.label}</span>
              </li>)}
            </ul>
          </div>
      }]
    }
  });

  return (
    <div className="container top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row">
        <p>Default presentation</p>
        <div className="wsq padding-all-sm">
          <FormSchemaComponent {...props} />
        </div>
      </div>
      <div className='text-center'>_____________________________________________</div>
      <div className="margin-top-lg row">
        <p>Here the component is custom-styled and the grouped errors component is defined outside of the FormSchemaComponent</p>
        <FormSchemaComponent {...exteriorGroupedErrorsProps} />
      </div>
    </div>
  );
}

export function ServerError() {
  const props = {
    lang: 'fr',
    schema
  };
  return (
    <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <FormSchemaComponent { ...props } />
      </div>
    </div>
  );
}
