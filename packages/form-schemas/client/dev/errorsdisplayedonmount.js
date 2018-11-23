import ih from 'immutability-helper';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../src/';

import { schema } from '../../dev/simplest';

if ( module.hot ) module.hot.accept();

class Main extends Component {

  render() {

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
        "fields" : [ {
          field : "conditions",
          fieldType : "text",
          optional: false,
          min: 12,
          label : 'Ce schema a la props withErrors à true',
          sub : 'la la la'
        } ]
      }
    };


    // here the grouped error component is defined outside of the FormSchemaComponent

    const exteriorGroupedErrorsProps = ih( props, {
      classNames: {
        $set: {
          fieldsCanvas: 'wsq padding-all-sm',
          bottomActionsCanvas: 'wsq padding-all-sm padding-top-md'
        }
      },
      errorComponents: {
        $set: [ {
          position: 'bottom',
          Component: ( { errors } ) =>
            <div className="error-summary padding-v-sm padding-h-sm">
              <div className="padding-bottom-sm">Oh no's! Cannot submit!:</div>
              <ul className="list-unstyled">
              {errors.map( ( e, i ) => <li key={'error-' + i}>
                <label>{e.fieldLabel}</label>:&nbsp;
                <span>{e.label}</span>
              </li> )}
              </ul>
            </div>
        } ]
      }
    } );

    return <div className="container top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row">
        <p>Default presentation</p>
        <div className="wsq padding-all-sm">
          <FormSchemaComponent { ...props } />
        </div>
      </div>
      <div className="margin-top-lg row">
        <p>Here the component is custom-styled and the grouped errors component is defined outside of the FormSchemaComponent</p>
        <FormSchemaComponent { ...exteriorGroupedErrorsProps } />
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
