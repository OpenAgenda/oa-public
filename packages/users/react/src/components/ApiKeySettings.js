"use strict";

const React = require( 'react' ),

  { reduxForm } = require( 'redux-form' ),

  { push } = require( 'react-router-redux' );


const ApiKeySettings = React.createClass( {

  displayName: 'ApiKeySettings',

  propTypes: {
    activeTab: React.PropTypes.bool
  },

  contextTypes: {
    getLabels: React.PropTypes.func
  },

  render: function () {

    const { getLabels } = this.context;

    const { activeTab, dispatch, fields: { apiKey, apiSecret }, displayModal, generateApiKey } = this.props;

    const generateApiKeyModal = ( secret = 0 ) => ({
      visible: true,
      title: getLabels( 'generateNewApiKey' ),
      content: <p>{getLabels( 'generateNewApiKeyModalText' )}</p>,
      action: () => generateApiKey( secret ),
      actionText: getLabels( 'generateNewApiKeyModalButton' ),
      buttonClass: 'btn btn-primary'
    });

    return (
      <tr
        onClick={!activeTab ? dispatch.bind( this, push( '/apiKey' ) ) : null}
        className={!activeTab ? 'inactive' : ''}
      >
        <td onClick={activeTab ? dispatch.bind( this, push( '/' ) ) : null}
            className="col-md-3" style={{cursor: 'pointer'}}>{getLabels( 'apiKeys' )}
        </td>
        {activeTab ? <td>
          <div style={{padding: '0 5px'}}>
            <p>{getLabels( 'apiKeyInformation' )}</p>

            <p>
              <a href="//openagenda.zendesk.com/hc/fr/sections/201090781-The-API-documentation-in-english-">
                {getLabels( 'showDocumentation' )}
              </a>
            </p>

            <div className="form-group">
              <label htmlFor="api_key">{getLabels( 'publicKey' )}</label>
              <div className="input-group">
                <input type="text" className="form-control" name="api_key" readOnly {...apiKey}/>
                <span className="input-group-btn">
                  <button className="btn btn-default" type="button"
                          onClick={() => displayModal( generateApiKeyModal() )}>
                    <i className="fa fa-refresh" aria-hidden="true"></i>
                  </button>
                </span>
              </div>
            </div>

            {apiSecret.value && <div className="form-group">
              <label htmlFor="api_secret">{getLabels( 'secretKey' )}</label>
              <div className="input-group">
                <input type="text" className="form-control" name="api_secret" readOnly {...apiSecret}/>
                <span className="input-group-btn">
                  <button className="btn btn-default" type="button"
                          onClick={() => displayModal( generateApiKeyModal( 1 ) )}>
                    <i className="fa fa-refresh" aria-hidden="true"></i>
                  </button>
                </span>
              </div>
            </div>}
          </div>
        </td> : <td style={{cursor: 'pointer'}}>{getLabels( 'showApiKeys' )}</td>}
      </tr>
    );

  }

} );

module.exports = reduxForm( {
  form: 'apiKeySettings',
  fields: [ 'apiKey', 'apiSecret' ]
} )( ApiKeySettings );