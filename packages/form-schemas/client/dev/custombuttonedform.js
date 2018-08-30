"use strict";

import PropTypes from 'prop-types';
import React, { Component } from 'react';

import { render } from 'react-dom';

import FormSchemaComponent from '../src/index';

if ( module.hot ) module.hot.accept();

render( <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
  <div className="row margin-v-md margin-h-sm">
    <FormSchemaComponent
      lang="fr"
      values={{
        staff: 129313,
        registered: new Date( '2010-08-12' )
      }}
      schema={{
        fields: [ {
          field: 'staff',
          fieldType: 'integer',
          optional: false,
          label: {
            fr: 'Matricule',
            en: 'Staff number'
          }
        }, {
          field: 'registered',
          fieldType: 'date',
          optional: false,
          label: {
            fr: 'Date d\'enregistrement',
            en: 'Registration date'
          }
        } ]
      }}
      actionComponents={[ {
        position: 'bottom',
        Component: ( { onSubmit } ) => <div style={{padding: 20, border: '1px solid #ccc', textAlign: 'center' }}>
          <button onClick={onSubmit} className="btn btn-primary">Submit</button>
          <div>this is a custom section</div>
        </div>
      } ]}
    />
  </div>
</div>, document.getElementById( 'app' ) );
