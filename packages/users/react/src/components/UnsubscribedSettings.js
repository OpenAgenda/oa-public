import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import camelCase from 'lodash/camelCase';

@connect(
  state => ({
    unsubscriptions: state.userSettings.unsubscriptions
  }),
  { push }
)
export default class UnsubscribedSettings extends Component {

  static propTypes = {
    unsubscriptions: PropTypes.array,
    push: PropTypes.func
  };

  static contextTypes = {
    getLabels: PropTypes.func
  };

  render() {

    const { getLabels } = this.context;

    const { activeTab, push, unsubscriptions, removeUnsubscription } = this.props;

    return (
      <tr
        onClick={!activeTab ? () => push( '/unsubscribed' ) : null}
        className={!activeTab ? 'inactive' : ''}
      >
        <td onClick={activeTab ? () => push( '/' ) : null}
          className="col-md-3" style={{ cursor: 'pointer' }}>{getLabels('emailUnsubscription')}
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
                  {unsubscription.agenda.title}:{' '}
                  <b>{getLabels( camelCase( unsubscription.type ) ) || getLabels( 'allNotifications' )}</b>
                </div>
              ) )}

              {(!unsubscriptions || !unsubscriptions.length) && <p>{getLabels( 'noUnsubscription' )}</p>}
            </div>
          </div>
        </td> : <td style={{ cursor: 'pointer' }}></td>}
      </tr>
    );

  }

}
