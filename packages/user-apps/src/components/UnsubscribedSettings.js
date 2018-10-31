import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import camelCase from 'lodash/camelCase';
import AbilitiesEditor from '@openagenda/abilities/build/client/AbilitiesEditor';

const ucfirst = str => str.slice( 0, 1 ).toUpperCase() + str.slice( 1 );

@connect(
  state => ({
    unsubscriptions: state.userSettings.unsubscriptions,
    user: state.userSettings.user,
    prefix: state.app.appSettings.prefix
  }),
  { push }
)
export default class UnsubscribedSettings extends Component {

  static propTypes = {
    unsubscriptions: PropTypes.array,
    push: PropTypes.func
  };

  static contextTypes = {
    lang: PropTypes.string,
    getLabels: PropTypes.func
  };

  render() {

    const { getLabels, lang } = this.context;

    const { activeTab, push, unsubscriptions, removeUnsubscription, prefix, user } = this.props;

    return (
      <tr
        onClick={!activeTab ? () => push( prefix + '/unsubscribed' ) : null}
        className={!activeTab ? 'inactive' : ''}
      >
        <td
          onClick={activeTab ? () => push( prefix + '/' ) : null}
          className="col-md-3"
          style={{ cursor: 'pointer' }}
        >
          {getLabels( 'emailUnsubscription' )}
        </td>
        {activeTab ? <td>
          <div style={{ padding: '0 5px' }}>
            <p>{getLabels( 'yourUnsubscriptions' )}</p>

            <div>
              {unsubscriptions && unsubscriptions.length > 0 && unsubscriptions.map( unsubscription => (
                <div key={unsubscription.id} className="margin-v-sm">
                  <span
                    style={{ cursor: 'pointer', marginTop: '-2px', fontSize: '18px' }}
                    className="text-danger pull-right"
                    aria-hidden="true"
                    onClick={() => removeUnsubscription( unsubscription )}
                  >×</span>
                  {unsubscription.agenda ? unsubscription.agenda.title : ucfirst( unsubscription.subject )}:{' '}
                  <b>{getLabels( camelCase( unsubscription.type ) ) || getLabels( 'allNotifications' )}</b>
                </div>
              ) )}

              {(!unsubscriptions || !unsubscriptions.length) && <p>{getLabels( 'noUnsubscription' )}</p>}

              <div className="margin-top-md">
                <AbilitiesEditor
                  locale={lang}
                  entityName="user"
                  identifier={user.uid}
                  res={{
                    // get + patch
                    formIndex: '/abilities/form-index'
                  }}
                />
              </div>
            </div>
          </div>
        </td> : <td style={{ cursor: 'pointer' }}></td>}
      </tr>
    );

  }

}
