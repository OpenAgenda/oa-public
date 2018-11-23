import _ from 'lodash';

import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../src/index';

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
        // this is what a slate value looks like.
        singlelangfield: JSON.stringify( {
          document: {
            nodes: [
              {
                object: 'block',
                type: 'paragraph',
                nodes: [
                  {
                    object: 'text',
                    leaves: [
                      {
                        text: 'A line of text in a paragraph.',
                      },
                    ],
                  },
                ],
              },
            ],
          },
        } )
      },
      schema: {
        "fields" : [ {
          "field" : "singlelangfield",
          "fieldType" : "slate",
          "label" : {
            "fr" : "C'est un champ qui pond un doc slate"
          },
          "info" : {
            "fr" : "Le texte info"
          },
          "sub" : {
            "fr" : "Le texte dessous"
          }
        } ]
      }
    }

    return <div className="container top-margined">
      <div className="row">
        <div className="wsq col-lg-5 col-lg-offset-1">
          <div className="margin-v-md margin-h-sm">
            <p>An Slate field.</p>
            <FormSchemaComponent { ...props } onChange={this.setState.bind( this )} />
          </div>
        </div>
        <div className="wsq col-lg-5 col-lg-offset-1">
          <div className="margin-v-md margin-h-sm">
            { _.get( this.state, 'values.singlelangfield' ) ?
            <pre style={{minHeight: 400}}>
              { JSON.stringify( _.get( this.state, 'values.singlelangfield' ), null, 2 )}
            </pre> : null }
          </div>
        </div>
      </div>
    </div>

  }

}

render( <Main />, document.getElementById( 'app' ) );
