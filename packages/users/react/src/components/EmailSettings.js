"use strict";

const React = require( 'react' ),

  createReactClass = require( 'create-react-class' ),

  PropTypes = require( 'prop-types' ),

  { reduxForm } = require( 'redux-form' ),

  { capitalize } = require( 'utils' ),

  { push } = require( 'react-router-redux' ),

  { connect } = require( 'react-redux' );

const domOnlyProps = ( {
                         initialValue, autofill, onUpdate, valid, invalid, dirty,
                         pristine, active, touched, visited, autofilled,
                         ...domProps
                       } ) => domProps;


const EmailSettings = createReactClass( {

  displayName: 'EmailSettings',

  propTypes: {
    activeTab: PropTypes.bool
  },

  contextTypes: {
    getLabels: PropTypes.func
  },

  render: function () {

    const { getLabels } = this.context;

    const {
      activeTab, dispatch, fields: { email, password },
      handleSubmit, successMessageDisplayed, prefix
    } = this.props;

    return (
      <tr
        onClick={!activeTab ? dispatch.bind( this, push( prefix + '/email' ) ) : null}
        className={!activeTab ? 'inactive' : ''}
      >
        <td onClick={activeTab ? dispatch.bind( this, push( prefix + '/' ) ) : null}
          className="col-md-3" style={{ cursor: 'pointer' }}>{getLabels( 'email' )}
        </td>
        {activeTab ? <td>
          <div style={{ padding: '0 5px' }}>
            <form onSubmit={handleSubmit} style={{ paddingBottom: '8px' }}>
              <div className="form-group">
                <label htmlFor="email">{getLabels( 'email' )} *</label>
                <input type="text" className="form-control" name="email" {...domOnlyProps( email )} />
                {email.touched && email.error &&
                <div className="text-danger">{capitalize( getLabels( email.error ) )}</div>}
              </div>

              <div className="form-group">
                <label htmlFor="password">{getLabels( 'password' )} *</label>
                <input
                  type="password"
                  className="form-control"
                  name="password"
                  autoComplete="new-email"
                  {...domOnlyProps( password )}
                />
                {password.touched && password.error &&
                <div className="text-danger">{capitalize( getLabels( password.error ) )}</div>}
              </div>

              <div className="form-inline pull-left">
                <button type="submit" className="btn btn-primary">{getLabels( 'save' )}</button>
                {successMessageDisplayed &&
                <label className="text-success" style={{ marginLeft: '10px' }}>
                  <b>{getLabels( 'updateEmailSuccess' )}</b>
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
  form: 'emailSettings',
  fields: [ 'email', 'password' ]
} )( connect( state => ({ prefix: state.app.appSettings.prefix }) )( EmailSettings ) );