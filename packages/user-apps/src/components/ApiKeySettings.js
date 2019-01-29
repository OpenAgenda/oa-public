import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { connect } from 'react-redux';


@connect( state => ({
  prefix: state.settings.prefix,
  user: state.userSettings.user
}) )
@withRouter
export default class ApiKeySettings extends Component {
  static propTypes = {
    activeTab: PropTypes.bool
  };

  static contextTypes = {
    getLabel: PropTypes.func
  };

  render() {
    const { getLabel } = this.context;
    const { activeTab, displayModal, user, generateApiKey, prefix, history } = this.props;

    const generateApiKeyModal = ( secret = false ) => ({
      visible: true,
      title: getLabel( 'generateNewApiKey' ),
      content: <p>{getLabel( 'generateNewApiKeyModalText' )}</p>,
      action: () => generateApiKey( secret ),
      actionText: getLabel( 'generateNewApiKeyModalButton' ),
      buttonClass: 'btn btn-primary'
    });

    return (
      <tr
        onClick={!activeTab ? () => history.push( prefix + '/apiKey' ) : null}
        className={!activeTab ? 'inactive' : ''}
      >
        <td
          onClick={activeTab ? () => history.push( prefix + '/' ) : null}
          className="col-md-3"
          style={{ cursor: 'pointer' }}
        >
          {getLabel( 'apiKeys' )}
        </td>
        {activeTab ? <td>
          <div style={{ padding: '0 5px' }}>
            <p>{getLabel( 'apiKeyInformation' )}</p>

            <p>
              <a href="//openagenda.zendesk.com/hc/fr/sections/201090781-The-API-documentation-in-english-">
                {getLabel( 'showDocumentation' )}
              </a>
            </p>

            <div className="form-group">
              <label htmlFor="apiKey">{getLabel( 'publicKey' )}</label>
              <div className="input-group">
                <input type="text" className="form-control" name="apiKey" value={user.apiKey || ''} readOnly />
                <span className="input-group-btn">
                  <button
                    className="btn btn-default"
                    type="button"
                    onClick={() => displayModal( generateApiKeyModal() )}
                  >
                    <i className="fa fa-refresh" aria-hidden="true"></i>
                  </button>
                </span>
              </div>
            </div>

            {user.apiSecret && <div className="form-group">
              <label htmlFor="apiSecret">{getLabel( 'secretKey' )}</label>
              <div className="input-group">
                <input type="text" className="form-control" name="apiSecret" value={user.apiSecret || ''} readOnly />
                <span className="input-group-btn">
                  <button className="btn btn-default" type="button"
                          onClick={() => displayModal( generateApiKeyModal( true ) )}>
                    <i className="fa fa-refresh" aria-hidden="true"></i>
                  </button>
                </span>
              </div>
            </div>}
          </div>
        </td> : <td style={{ cursor: 'pointer' }}>{getLabel( 'showApiKeys' )}</td>}
      </tr>
    );
  }
}
