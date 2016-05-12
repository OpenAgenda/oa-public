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
      <div>
        { activeTab ?
          <div className="panel-group">
            <div className="panel panel-primary">
              <div className="panel-heading">Email</div>
              <div className="panel-body">

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label htmlFor="email">Email *</label>
                    <input type="text" className="form-control" name="email" {...email}/>
                  </div>

                  <div className="form-group">
                    <label htmlFor="password">Mot de passe *</label>
                    <input type="text" className="form-control" name="password" {...password}/>
                  </div>

                  <div className="text-right">
                    <button type="submit" className="btn btn-success">Sauvegarder</button>
                  </div>
                </form>

              </div>
            </div>
          </div> : <p><Link to="/email">Email</Link></p> }
      </div>
    );

  }

} );

module.exports = reduxForm( {
  form: 'emailSettings',
  fields: [ 'email', 'password' ]
} )( EmailSettings );