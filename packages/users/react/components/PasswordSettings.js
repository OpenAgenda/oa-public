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
      <div>
        { activeTab ?
          <div className="panel-group">
            <div className="panel panel-primary">
              <div className="panel-heading">Mot de passe</div>
              <div className="panel-body">

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="old_password">Mot de passe actuel *</label>
                    <input type="text" className="form-control" name="old_password" {...old_password}/>
                  </div>

                  <div className="form-group">
                    <label htmlFor="new_password">Nouveau mot de passe *</label>
                    <input type="text" className="form-control" name="new_password" {...new_password}/>
                  </div>

                  <div className="form-group">
                    <label htmlFor="confirmation">Répétez le mot de passe *</label>
                    <input type="text" className="form-control" name="confirmation" {...confirmation}/>
                  </div>

                  <div className="text-right">
                    <button type="submit" className="btn btn-success">Sauvegarder</button>
                  </div>
                </form>

              </div>
            </div>
          </div> : <p><Link to="/password">Mot de passe</Link></p> }
      </div>
    );

  }

} );

module.exports = reduxForm( {
  form: 'passwordSettings',
  fields: [ 'old_password', 'new_password', 'confirmation' ]
} )( PasswordSettings );