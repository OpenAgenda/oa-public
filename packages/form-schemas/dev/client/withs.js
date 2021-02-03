import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { render } from 'react-dom';

import FormSchemaComponent from '../../client/src/index';

import { schema } from '../schemas/simplest';

if ( module.hot ) module.hot.accept();

class Main extends Component {

  render() {
    const props = {
      lang: 'fr',
      schema: {
        fields : [{
          field: 'attendance',
          fieldType: 'radio',
          label: 'Attendance Mode',
          default: 1,
          options: [{
            id: 1,
            label: 'Offline',
            value: 'offline'
          }, {
            id: 2,
            label: 'Online',
            value: 'online'
          }, {
            id: 3,
            label: 'Mixed',
            value: 'mixed'
          }]
        }, {
          field: 'location',
          fieldType: 'text',
          label: 'Location',
          info: 'Optional only if online',
          optionalWith: {
            field: 'attendance',
            value: 2
          }
        }, {
          field: 'onlineaccesslink',
          fieldType: 'link',
          optional: false,
          label: 'Online access link',
          info: 'enabled if online or mixed',
          enableWith: {
            field: 'attendance',
            value: [2, 3]
          }
        }]
      }
    }

    return <div className="container wsq top-margined col-lg-offset-4 col-lg-4 col-md-offset-3 col-md-6 col-sm-offset-2 col-sm-8">
      <div className="row margin-v-md margin-h-sm">
        <FormSchemaComponent { ...props } />
      </div>
    </div>
  }

}

render(<Main />, document.getElementById('app'));
