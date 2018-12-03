import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../../client/src/index';

if ( module.hot ) module.hot.accept();

class Main extends Component {

  render() {

    const props = {
      lang: 'fr',
      values: {
        amultilingualfield: { fr: 'Quelque chose' }
      },
      schema: {
        "fields" : [ {
          "field" : "amultilingualfield",
          "fieldType" : "text",
          "optional" : false,
          "languages" : [ "fr" ],
          "label" : "N'importe quoi en français"
        }, {
          "field": "amultilfieldwithdefault",
          "fieldType" : "text",
          "optional" : false,
          "languages" : [ "fr", "en" ],
          "default" : "William",
          "label" : "La même valeur par défaut pour toutes les langues"
        }, {
          "field": "amultilfieldwithmultidefault",
          "fieldType" : "text",
          "optional" : false,
          "languages" : [ "fr", "en", "it" ],
          "default" : { "en" : "William", "fr" : "Guillaume" },
          "label" : "Une valeur par défaut par langue"
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
