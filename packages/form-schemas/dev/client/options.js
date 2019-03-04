import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../../client/src/index';
import Options from '../../client/src/Components/Options';
import optionsValidator from '../../client/src/lib/optionsValidator';

if ( module.hot ) module.hot.accept();

class Main extends Component {

  render() {

    const props = {
      res: {
        post: '',
        redirect: '/'
      },
      components: {
        options: Options
      },
      lang: 'fr',
      values: {
        optionsfield: [ {
          id: 1,
          value: 'un',
          label: {
            fr: 'Un',
            en: 'One'
          }
        }, {
          id: 2,
          value: 'deux',
          label: {
            fr: 'Deux',
            en: 'Two'
          }
        }, {
          id: 3,
          value: 'trois',
          label: {
            fr: 'Trois',
            en: 'Three'
          }
        } ]
      },
      schema: {
        custom: {
          options: optionsValidator
        },
        fields: [ {
          field: 'optionsfield',
          fieldType: 'options',
          label: 'Option values',
          languages: [ 'fr', 'en' ],
          optional: false
        } ]
      }
    }

    return <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <p>Add options</p>
        <FormSchemaComponent { ...props } />
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
