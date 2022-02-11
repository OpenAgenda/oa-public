import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../../client/src/index';

if (module.hot) module.hot.accept();

const emptyPTag = () => {
  window.location.href = `${window.location.href.split('?').shift()}?v=<p></p>`;
};

const extractValueFromQuery = defaultValue => {
  const parts = window.location.href.split('?v=');

  if (parts.length === 2) {
    return decodeURIComponent(parts.pop());
  }

  return defaultValue;
};

class Main extends Component {
  render() {
    const props = {
      res: {
        post: '',
        redirect: '/'
      },
      lang: 'fr',
      values: {
        singlelangfield: extractValueFromQuery('<p>Et boum</p>'),
      },
      schema: {
        fields: [{
          field: 'singlelangfield',
          fieldType: 'html',
          label: {
            fr: 'C\'est un champ qui pond du html'
          },
          info: {
            fr: 'Le texte info'
          },
          sub: {
            fr: 'Le texte dessous'
          },
          max: 10000
        }]
      }
    };

    const {
      values
    } = this.state || {};

    return (
      <div className="container top-margined">
        <div className="row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => emptyPTag()}
          >
            Load empty p tag
          </button>
          <div className="wsq col-lg-5 col-lg-offset-1">
            <div className="margin-v-md margin-h-sm">
              <p>An HTML field.</p>
              <FormSchemaComponent {...props} onChange={v => this.setState(v)} />
            </div>
          </div>
          <div className="wsq col-lg-5 col-lg-offset-1">
            <div className="margin-v-md margin-h-sm">
              {values?.singlelangfield ? (
                <pre style={{ minHeight: 400 }}>
                  {values.singlelangfield}
                </pre>
              ) : null }
            </div>
          </div>
        </div>
      </div>
    );
  }
}

render(<Main />, document.getElementById('app'));
