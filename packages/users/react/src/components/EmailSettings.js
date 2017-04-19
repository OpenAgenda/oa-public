"use strict";

const React = require( 'react' ),

  { reduxForm } = require( 'redux-form' ),

  { capitalize } = require( 'utils' ),

  { push } = require( 'react-router-redux' );


const EmailSettings = React.createClass( {

  displayName: 'EmailSettings',

  propTypes: {
    activeTab: React.PropTypes.bool
  },
  
  contextTypes: {
    getLabels: React.PropTypes.func
  },

  render: function () {

    const { getLabels } = this.context;

    const { activeTab, dispatch, fields: { email, password }, handleSubmit, successMessageDisplayed } = this.props;

    return (
      <tr
        onClick={!activeTab ? dispatch.bind( this, push( '/email' ) ) : null}
        className={!activeTab ? 'inactive' : ''}
      >
        <td onClick={activeTab ? dispatch.bind( this, push( '/' ) ) : null}
            className="col-md-3" style={{cursor: 'pointer'}}>{getLabels( 'email' )}
        </td>
        {activeTab ? <td>
          <div style={{padding: '0 5px'}}>
            <form onSubmit={handleSubmit} style={{paddingBottom: '8px'}}>
              <div className="form-group">
                <label htmlFor="email">{getLabels( 'email' )} *</label>
                <input type="text" className="form-control" name="email" {...email}/>
                {email.touched && email.error && <div className="text-danger">{capitalize( getLabels( email.error ) )}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="password">{getLabels( 'password' )} *</label>
                <input type="password" className="form-control" name="password" autoComplete="off" {...password}/>
                {password.touched && password.error &&
                <div className="text-danger">{capitalize( getLabels( password.error ) )}</div>}
              </div>

              <div className="form-inline pull-left">
                <button type="submit" className="btn btn-primary">{getLabels( 'save' )}</button>
                {successMessageDisplayed &&
                <label className="text-success" style={{marginLeft: '10px'}}>
                  <b>{getLabels( 'updateEmailSuccess' )}</b>
                </label>}
              </div>
            </form>
          </div>
        </td> : <td style={{cursor: 'pointer'}}>{getLabels( 'modify' )}</td>}
      </tr>
    );

  }

} );

module.exports = reduxForm( {
  form: 'emailSettings',
  fields: [ 'email', 'password' ]
} )( EmailSettings );