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
        name: 'Janine',
        age: 122
      }}
      schema={{
        fields: [ {
          field: 'name',
          fieldType: 'text',
          optional: false,
          label: {
            fr: 'Votre nom',
            en: 'Your name'
          }
        }, {
          field: 'age',
          fieldType: 'integer',
          optional: false,
          label: {
            fr: 'Votre age',
            en: 'Your age'
          },
          max: 100
        }, {
          field: 'multimessage',
          fieldType: 'text',
          optional: false,
          languages: [ 'fr', 'en' ],
          label: {
            fr: 'Un court message',
            en: 'A short message'
          },
          sub: {
            fr: 'Vraiment court',
            en: 'Really short'
          },
          max: 50
        } ]
      }}
    />
  </div>
</div>, document.getElementById( 'app' ) );
