import _ from 'lodash';
import React, { Component } from 'react';
import { render } from 'react-dom';
import store from 'store';
import { IntlProvider } from 'react-intl';

import EnabledRanges from '../../src/components/configuration/EnabledRanges';
import { locales } from '@openagenda/react-shared';

import { schema } from '../../test/fixtures/reed.json';

console.log(schema);

import EventForm from '../../src';
import Age from '../../src/components/Age';

if (module.hot) module.hot.accept();

import {
  tiles
} from '../../testconfig';


const storeKey = 'eventFormSandbox';

console.log('***** CHANGE ******');

class Main extends Component {

  constructor(props) {

    super(props);

    const stored = store.get(storeKey);

    if (_.isObject(stored)) {

      this.state = stored;

    }

  }

  onValuesChange(changed) {

    console.log(changed);

    this.setState({
      values: changed
    });

  }

  render() {
    const values = _.get(this, 'state.values', null);

    const schemaWithoutInternals = {
      ...schema,
      fields: schema.fields
        .filter(field => ![].concat(field.write).includes('internal'))
    };

    return (
      <IntlProvider messages={locales['fr']} locale={'fr'} key={'fr'}>
        <div className="container-fluid top-margined">
          <div className="row">
            <div className="col-xs-12 col-sm-8 col-md-6">
              <EventForm
                mode="edit"
                includeEventFields
                role="administrator"
                devOnChange={this.onValuesChange.bind(this)}
                schema={schemaWithoutInternals}
                locationRes="/locations"
                tiles={tiles}
                referencesRes="/references"
                suggestionsRes="/references"
                lang="fr"
                classNames={{
                  fieldsCanvas: 'padding-all-md wsq',
                  bottomErrorsCanvas: 'error-summary padding-all-md',
                  bottomActionsCanvas: 'padding-all-md wsq'
                }}
                values={{
                  accessibility: { hi: true, sl: true },
                  references: [45527593],
                  /* timings: [{
                    begin: {
                      date: '2018-11-27',
                      hours: 10,
                      minutes: 10
                    },
                    end: {
                      date: '2018-11-27',
                      hours: 16,
                      minutes: 16
                    }
                  }] */
                }}
              />
            </div>
            <div className="col-xs-12 col-sm-4 col-md-6">
              <div className="row">
                <div className="col-xs-12 wsq margin-bottom-md">
                  <strong>Values typed in the form</strong>
                  <pre>
                    <code>{JSON.stringify(values, null, 2)}</code>
                  </pre>
                </div>
              </div>
              <div className="row">
                <div className="col-xs-12 wsq margin-bottom-md">
                  <div className="margin-v-sm">Timings configuration component</div>
                  <EnabledRanges
                    field="enabledRanges"
                    value={{
                      begin: '2021-07-03T07:00',
                      end: '2021-07-04T06:00'
                    }}
                    onChange={v => console.log(v)}
                  />
                </div>
              </div>
              <div className="row oa-form">
                <div className="col-xs-12 wsq margin-bottom-md padding-bottom-sm">
                  <div className="margin-v-sm">Disabled age form component</div>
                  <div className="form-group disabled">
                    <Age
                      onChange={() => {}}
                      lang="fr"
                      enabled={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </IntlProvider>
    );
  }

}

render(<Main />, document.getElementById('app'));
