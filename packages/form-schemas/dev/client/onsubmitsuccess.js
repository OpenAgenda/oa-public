import _ from 'lodash';

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
        something: 'Quelque chose'
      },
      schema: {
        "fields" : [ {
          "field" : "something",
          "fieldType" : "text",
          "label" : {
            "fr" : "Il faut écrire quelque chose"
          }
        } ]
      }
    }

    return <div className="container top-margined">
      <div className="row">
        <div className="wsq col-lg-5 col-lg-offset-1">
          <div className="margin-v-md margin-h-sm">
            <p>The onSubmitSuccess prop is called when the data has been sent and the response received successfully. It gives the values, and the response</p>
            <FormSchemaComponent { ...props } onSubmitSuccess={( values, response )=>{

              this.setState( {
                values,
                responseBody: response.body
              } );

            }} />
          </div>
        </div>
        <div className="wsq col-lg-5 col-lg-offset-1">
          <div className="margin-v-md margin-h-sm">
            { this.state ?
            <pre style={{minHeight: 400}}>
              { JSON.stringify( this.state, null, 2 )}
            </pre> : null }
          </div>
        </div>
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
