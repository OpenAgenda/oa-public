import _ from 'lodash';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../../client/src/index';

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
        singlelangfield: '<p>Et boum</p>',
      },
      schema: {
        "fields" : [ {
          "field" : "singlelangfield",
          "fieldType" : "html",
          "label" : {
            "fr" : "C'est un champ qui pond du html"
          },
          "info" : {
            "fr" : "Le texte info"
          },
          "sub" : {
            "fr" : "Le texte dessous"
          },
          "max" : 10000
        } ]
      }
    };

    return <div className="container top-margined">
      <div className="row">
        <div className="wsq col-lg-5 col-lg-offset-1">
          <div className="margin-v-md margin-h-sm">
            <p>An HTML field.</p>
            <FormSchemaComponent { ...props } onChange={this.setState.bind( this )} />
          </div>
        </div>
        <div className="wsq col-lg-5 col-lg-offset-1">
          <div className="margin-v-md margin-h-sm">
            { _.get( this.state, 'values.singlelangfield' ) ?
            <pre style={{minHeight: 400}}>
              {_.get( this.state, 'values.singlelangfield' )}
            </pre> : null }
          </div>
        </div>
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
