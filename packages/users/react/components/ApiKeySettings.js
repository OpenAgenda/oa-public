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

    const { activeTab } = this.props;

    return (
      <div>
        { activeTab ?
          <div className="panel-group">
            <div className="panel panel-primary">
              <div className="panel-heading">Clé API</div>
              <div className="panel-body">
                <p>La clé API permet de lire les données publiées sur OpenAgenda via l'API.</p>

                <p><a href="#">Voir la documentation</a></p>

                <div className="form-group">
                  <label htmlFor="email">Ma clé API</label>
                  <input type="text" className="form-control" name="api_key" value="KnmbKGT6M7Ki6OJMtb4eKoEsGBsVOPpE"
                         readOnly/>
                </div>
              </div>
            </div>
          </div> : <p><Link to="/apiKey">Clé API</Link></p> }
      </div>
    );

  }

} );

module.exports = ApiKeySettings;