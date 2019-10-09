import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { Field, reduxForm } from 'redux-form';
import { connect } from 'react-redux';


@reduxForm( {
  form: 'emailSettings',
  destroyOnUnmount: false
} )
@connect( state => ({
  prefix: state.settings.prefix,
  user: state.userSettings.user
}) )
@withRouter
export default class EmailSettings extends Component {
  static propTypes = {
    activeTab: PropTypes.bool
  };

  static contextTypes = {
    getLabel: PropTypes.func
  };

  renderNewEmailInput = field => (
    <div className="form-group">
      <label htmlFor="newEmail">{this.context.getLabel( 'newEmail' )} *</label>
      <input {...field.input} className="form-control" type="text" />
      {field.meta.touched && field.meta.error && (
        <div className="text-danger">{_.upperFirst( this.context.getLabel( field.meta.error ) )}</div>
      )}
    </div>
  );

  renderPasswordInput = field => (
    <div className="form-group">
      <label htmlFor="password">{this.context.getLabel( 'password' )} *</label>
      <input {...field.input} className="form-control" type="password" autoComplete="off" />
      {field.meta.touched && field.meta.error && (
        <div className="text-danger">{_.upperFirst( this.context.getLabel( field.meta.error ) )}</div>
      )}
    </div>
  );

  render() {
    const { getLabel } = this.context;
    const {
      activeTab,
      handleSubmit,
      successMessageDisplayed,
      prefix,
      history,
      user,
      error
    } = this.props;

    return (
      <tr
        onClick={!activeTab ? () => history.push( prefix + '/email' ) : null}
        className={!activeTab ? 'inactive' : ''}
      >
        <td
          onClick={activeTab ? () => history.push( prefix + '/' ) : null}
          className="col-md-3"
          style={{ cursor: 'pointer' }}
        >
          {getLabel( 'email' )}
        </td>
        {activeTab ? <td>
          <div style={{ padding: '0 5px' }}>
            <form onSubmit={handleSubmit} style={{ paddingBottom: '8px' }}>
              <Field name="newEmail" component={this.renderNewEmailInput} />
              <Field name="password" component={this.renderPasswordInput} />

              <div className="form-inline pull-left">
                <button type="submit" className="btn btn-primary">{getLabel( 'save' )}</button>
                {successMessageDisplayed &&
                <label className="text-success" style={{ marginLeft: '10px' }}>
                  <b>{getLabel( 'updateEmailSuccess' )}</b>
                </label>}
                {error &&
                <label className="text-danger" style={{ marginLeft: '10px' }}>
                  <b>{getLabel( 'error' )}</b>
                </label>}
              </div>
            </form>
          </div>
        </td> : <td style={{ cursor: 'pointer' }}><b className="text-muted">{user.email}</b></td>}
      </tr>
    );
  }
}
