"use strict";

const React = require( 'react' ),

  { Link } = require( 'react-router' ),

  { reduxForm } = require( 'redux-form' );


const EmailSettings = React.createClass( {

  displayName: 'EmailSettings',

  propTypes: {
    activeTab: React.PropTypes.bool
  },

  render: function() {

    const { activeTab, fields: { email, password }, handleSubmit } = this.props;

    return (
      activeTab ?
        <div>
          <h4><i className="fa fa-caret-down" aria-hidden="true"></i> Email</h4>

          <div style={{padding: '0 5px'}}>
            <form onSubmit={handleSubmit} style={{paddingBottom: '8px'}}>
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input type="text" className="form-control" name="email" {...email}/>
              </div>

              <div className="form-group">
                <label htmlFor="password">Mot de passe *</label>
                <input type="password" className="form-control" name="password" {...password}/>
              </div>

              <button type="submit" className="btn btn-success">Sauvegarder</button>
            </form>
          </div>
        </div> : <h4><Link to="/email"><i className="fa fa-caret-right" aria-hidden="true"></i> Email</Link></h4>
    );

  }

} );

module.exports = reduxForm( {
  form: 'emailSettings',
  fields: [ 'email', 'password' ]
} )( EmailSettings );