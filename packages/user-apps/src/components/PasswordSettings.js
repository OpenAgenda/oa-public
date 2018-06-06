"use strict";

const React = require( 'react' ),

  createReactClass = require( 'create-react-class' ),

  PropTypes = require( 'prop-types' ),

  { reduxForm } = require( 'redux-form' ),

  { capitalize } = require( '@openagenda/utils' ),

  { push } = require( 'react-router-redux' ),

  { connect } = require( 'react-redux' );

const domOnlyProps = ( {
                         initialValue, autofill, onUpdate, valid, invalid, dirty,
                         pristine, active, touched, visited, autofilled,
                         ...domProps
                       } ) => domProps;


const PasswordSettings = createReactClass( {

  displayName: 'PasswordSettings',

  propTypes: {
    activeTab: PropTypes.bool
  },

  contextTypes: {
    getLabels: PropTypes.func
  },

  render: function () {

    const { getLabels } = this.context;

    const {
      activeTab, dispatch, fields: { oldPassword, password, confirmation },
      handleSubmit, successMessageDisplayed, prefix
    } = this.props;

    return (
      <tr
        onClick={!activeTab ? dispatch.bind( this, push( prefix + '/password' ) ) : null}
        className={!activeTab ? 'inactive' : ''}
      >
        <td
          onClick={activeTab ? dispatch.bind( this, push( prefix + '/' ) ) : null}
          className="col-md-3"
          style={{ cursor: 'pointer' }}
        >
          {getLabels( 'password' )}
        </td>
        {activeTab ? <td>
          <div style={{ padding: '0 5px' }}>
            <form onSubmit={handleSubmit} style={{ paddingBottom: '8px' }}>
              <div className="form-group">
                <label htmlFor="oldPassword">{getLabels( 'actualPassword' )} *</label>
                <input type="password" className="form-control" name="oldPassword"
                  autoComplete="new-password" {...domOnlyProps( oldPassword )} />
                {oldPassword.touched && oldPassword.error &&
                <div className="text-danger">{capitalize( getLabels( oldPassword.error ) )}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="password">{getLabels( 'newPassword' )} *</label>
                <input type="password" className="form-control" name="password"
                  autoComplete="new-password" {...domOnlyProps( password )} />
                {password.touched && password.error &&
                <div className="text-danger">{capitalize( getLabels( password.error ) )}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="confirmation">{getLabels( 'confirmation' )} *</label>
                <input type="password" className="form-control" name="confirmation"
                  autoComplete="new-password" {...domOnlyProps( confirmation )} />
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
  fields: [ 'oldPassword', 'password', 'confirmation' ]
} )( connect( state => ({ prefix: state.app.appSettings.prefix }) )( PasswordSettings ) );