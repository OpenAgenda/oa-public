import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { push } from 'react-router-redux';
import AbilitiesEditor from '@openagenda/abilities/build/client/AbilitiesEditor';

@connect(
  state => ({
    user: state.userSettings.user,
    prefix: state.app.appSettings.prefix
  }),
  { push }
)
class UnsubscribedSettings extends Component {

  static propTypes = {
    push: PropTypes.func
  };

  static contextTypes = {
    lang: PropTypes.string,
    getLabels: PropTypes.func
  };

  render() {

    const { getLabels, lang } = this.context;

    const { activeTab, push, prefix, user } = this.props;

    return (
      <tr
        onClick={!activeTab ? () => push( prefix + '/emails' ) : null}
        className={!activeTab ? 'inactive' : ''}
      >
        <td
          onClick={activeTab ? () => push( prefix + '/' ) : null}
          className="col-md-3"
          style={{ cursor: 'pointer' }}
        >
          {getLabels( 'emails' )}
        </td>
        {activeTab ? <td>
          <div style={{ padding: '0 5px' }}>
            <div>
              <AbilitiesEditor
                locale={lang}
                entityName="user"
                identifier={user.uid}
                res={{
                  // get + patch
                  formIndex: '/abilities/form-index'
                }}
                HeaderComponent={( { saveButton } ) => (
                  <div className="clearfix margin-bottom-sm">
                    <div className="pull-right">
                      {saveButton}
                    </div>

                    <p>{getLabels( 'chooseEmailsSent' )}</p>
                  </div>
                )}
              />
            </div>
          </div>
        </td> : <td style={{ cursor: 'pointer' }}>{getLabels( 'chooseEmailsSent' )}</td>}
      </tr>
    );

  }

}

module.exports = UnsubscribedSettings ;
