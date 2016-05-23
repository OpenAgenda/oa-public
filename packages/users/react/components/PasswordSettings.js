"use strict";

const React = require( 'react' ),

  { Link } = require( 'react-router' ),

  { reduxForm } = require( 'redux-form' );


const PasswordSettings = React.createClass( {

  displayName: 'PasswordSettings',

  propTypes: {
    activeTab: React.PropTypes.bool
  },

  render: function() {

    const { activeTab, fields: { old_password, new_password, confirmation }, handleSubmit } = this.props;

    return (
      activeTab ?
        <div>
          <h4><i className="fa fa-caret-down" aria-hidden="true"></i> Mot de passe</h4>

          <div style={{padding: '0 5px'}}>
            <form onSubmit={handleSubmit} style={{paddingBottom: '8px'}}>
              <div className="form-group">
                <label htmlFor="old_password">Mot de passe actuel *</label>
                <input type="password" className="form-control" name="old_password" {...old_password}/>
              </div>

              <div className="form-group">
                <label htmlFor="new_password">Nouveau mot de passe *</label>
                <input type="password" className="form-control" name="new_password" {...new_password}/>
              </div>

              <div className="form-group">
                <label htmlFor="confirmation">Répétez le mot de passe *</label>
                <input type="password" className="form-control" name="confirmation" {...confirmation}/>
              </div>

              <button type="submit" className="btn btn-success">Sauvegarder</button>
            </form>
          </div>
        </div> :
        <h4><Link to="/password"><i className="fa fa-caret-right" aria-hidden="true"></i> Mot de passe</Link></h4>
    );

  }

} );

module.exports = reduxForm( {
  form: 'passwordSettings',
  fields: [ 'old_password', 'new_password', 'confirmation' ]
} )( PasswordSettings );