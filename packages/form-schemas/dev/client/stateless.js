import _ from 'lodash';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../../client/src/index';

if ( module.hot ) module.hot.accept();

class Main extends Component {

  constructor( props ) {

    super( props );

    // state is updated here
    this.state = {
      values: {}
    }

  }

  render() {

    const props = {
      values: this.state.values,
      errors: this.state.errors,
      stateless: true,
      onChange: ( { values, errors } ) => {

        this.setState( { values, errors } );

      },
      res: {
        post: '',
        redirect: '/'
      },
      lang: 'fr',
      schema: {
        "fields" : [ {
          "field" : "saying",
          "fieldType" : "text",
          "languages" : [ "fr", "en" ],
          "optional" : false,
          "label" : {
            "fr" : "Titre",
            "en" : "Title"
          },
          "max" : 140,
          "placeholder" : {
            "fr" : "Un dicton",
            "en" : "A saying"
          },
          "sub": {
            "fr" : "Ce champ est requis.",
            "en" : "This field is required"
          }
        } ]
      }
    }

    return <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <FormSchemaComponent { ...props } />
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
