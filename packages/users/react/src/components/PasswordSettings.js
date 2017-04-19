"use strict";

const React = require( 'react' ),

  { reduxForm } = require( 'redux-form' ),

  { capitalize } = require( 'utils' ),

  { push } = require( 'react-router-redux' );


const PasswordSettings = React.createClass( {

  displayName: 'PasswordSettings',

  propTypes: {
    activeTab: React.PropTypes.bool
  },

  contextTypes: {
    getLabels: React.PropTypes.func
  },

  render: function () {

    const { getLabels } = this.context;

    const { activeTab, dispatch, fields: { old_password, new_password, confirmation }, handleSubmit, successMessageDisplayed } = this.props;

    return (
      <tr
        onClick={!activeTab ? dispatch.bind( this, push( '/password' ) ) : null}
        className={!activeTab ? 'inactive' : ''}
      >
        <td onClick={activeTab ? dispatch.bind( this, push( '/' ) ) : null}
            className="col-md-3" style={{ cursor: 'pointer' }}>{getLabels( 'password' )}
        </td>
        {activeTab ? <td>
          <div style={{ padding: '0 5px' }}>
            <form onSubmit={handleSubmit} style={{ paddingBottom: '8px' }}>
              <div className="form-group">
                <label htmlFor="old_password">{getLabels( 'actualPassword' )} *</label>
                <input type="password" className="form-control" name="old_password"
                       autoComplete="off" {...old_password} />
                {old_password.touched && old_password.error &&
                <div className="text-danger">{capitalize( getLabels( old_password.error ) )}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="new_password">{getLabels( 'newPassword' )} *</label>
                <input type="password" className="form-control" name="new_password"
                       autoComplete="off" {...new_password} />
                {new_password.touched && new_password.error &&
                <div className="text-danger">{capitalize( getLabels( new_password.error ) )}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmation">{getLabels( 'confirmation' )} *</label>
                <input type="password" className="form-control" name="confirmation"
                       autoComplete="off" {...confirmation} />
                {confirmation.touched && confirmation.error &&
                <div className="text-danger">{capitalize( getLabels( confirmation.error ) )}</div>}
              </div>

              <div className="form-inline pull-left">
                <button type="submit" className="btn btn-primary">{getLabels( 'save' )}</button>
                {successMessageDisplayed &&
                <label className="text-success" style={{ marginLeft: '10px' }}>
                  <b>{getLabels( 'updatePasswordSuccess' )}</b>
                </label>}
              </div>
            </form>
          </div>
        </td> : <td style={{ cursor: 'pointer' }}>{getLabels( 'modify' )}</td>}
      </tr>
    );

  }

} );

module.exports = reduxForm( {
  form: 'passwordSettings',
  fields: [ 'old_password', 'new_password', 'confirmation' ]
} )( PasswordSettings );