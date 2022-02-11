import _ from 'lodash';

import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../../client/src/index';

if (module.hot) module.hot.accept();

class Main extends Component {
  render() {
    const props = {
      res: {
        post: '',
        redirect: '/'
      },
      lang: 'fr',
      values: {
        singlelangfield: 'Avant\n\nhttp://le\\_monde.com\n\net après',
        multilangfield: { fr: '*Et boum*' }
      },
      schema: {
        fields: [{
          field: 'simpletextfield',
          fieldType: 'text',
          label: {
            fr: 'C\'est un champ basique'
          }
        }, {
          field: 'singlelangfield',
          fieldType: 'markdown',
          optional: false,
          label: {
            fr: 'C\'est un champ qui pond du markdown'
          },
          info: {
            fr: 'Le texte info'
          },
          sub: {
            fr: 'Le texte dessous'
          },
          max: 10000
        }, {
          field: 'multilangfield',
          fieldType: 'markdown',
          optional: false,
          languages: ['en', 'fr'],
          label: {
            fr: 'C\'est pareil, mais multilingue'
          },
          info: {
            fr: 'Le texte info'
          },
          placeholder: {
            fr: "S'affiche dans le champ"
          },
          sub: {
            fr: 'Le texte dessous'
          },
          max: 4000
        }, {
          field: 'monolingualmarkdown',
          optional: false,
          fieldType: 'markdown',
          info: 'With some ',
          placeholder: 'Type in stuff\n on multiple lines\nAs placeholder',
          label: 'Monolingual markdown field',
          default: '**Some default text**'
        }]
      }
    };

    return (
      <div className="container top-margined">
        <div className="row">
          <div className="wsq col-lg-5 col-lg-offset-1">
            <div className="margin-v-md margin-h-sm">
              <p>Some markdown fields.</p>
              <FormSchemaComponent {...props} onChange={state => this.setState(state)} />
            </div>
          </div>
          <div className="wsq col-lg-5 col-lg-offset-1">
            <div className="margin-v-md margin-h-sm">
              {_.get(this.state, 'values.singlelangfield') ? (
                <pre style={{ minHeight: 400 }}>
                  {_.get(this.state, 'values.singlelangfield')}
                </pre>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

render(<Main />, document.getElementById('app'));
