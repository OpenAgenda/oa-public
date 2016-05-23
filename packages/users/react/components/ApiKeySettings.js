"use strict";

const React = require( 'react' ),

  { Link } = require( 'react-router' ),

  { reduxForm } = require( 'redux-form' );


const ApiKeySettings = React.createClass( {

  displayName: 'ApiKeySettings',

  propTypes: {
    activeTab: React.PropTypes.bool
  },

  render: function() {

    const { activeTab, fields: { apiKey } } = this.props;

    return (
      activeTab ?
        <div>
          <h4><i className="fa fa-caret-down" aria-hidden="true"></i> Clé API</h4>
          
          <div style={{padding: '0 5px'}}>
            <p>La clé API permet de lire les données publiées sur OpenAgenda via l'API.</p>

            <p><a href="#">Voir la documentation</a></p>

            <div className="form-group">
              <label htmlFor="email">Ma clé API</label>
              <input type="text" className="form-control" name="api_key" readOnly {...apiKey}/>
            </div>
          </div>
        </div> : <h4><Link to="/apiKey"><i className="fa fa-caret-right" aria-hidden="true"></i> Clé API</Link></h4>
    );

  }

} );

module.exports = reduxForm( {
  form: 'apiKeySettings',
  fields: [ 'apiKey' ]
} )( ApiKeySettings );