import _ from 'lodash'
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Field, reduxForm } from 'redux-form';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';


@reduxForm( {
  form: 'passwordSettings',
  destroyOnUnmount: false
} )
@connect( state => ({
  prefix: state.settings.prefix
}) )
@withRouter
export default class PasswordSettings extends Component {
  static propTypes = {
    activeTab: PropTypes.bool
  };

  static contextTypes = {
    getLabel: PropTypes.func
  }

  renderOldPasswordInput = field => (
    <div className="form-group">
      <label htmlFor="oldPassword">{this.context.getLabel( 'actualPassword' )} *</label>
      <input
        {...field.input}
        type="password"
        className="form-control"
        autoComplete="off"
      />
      {field.meta.touched && field.meta.error && (
        <div className="text-danger">{_.upperFirst( this.context.getLabel( field.meta.error ) )}</div>
      )}
    </div>
  );

  renderPasswordInput = field => (
    <div className="form-group">
      <label htmlFor="password">{this.context.getLabel( 'newPassword' )} *</label>
      <input
        {...field.input}
        type="password"
        className="form-control"
        autoComplete="off"
      />
      {field.meta.touched && field.meta.error && (
        <div className="text-danger">{_.upperFirst( this.context.getLabel( field.meta.error ) )}</div>
      )}
    </div>
  );

  renderConfirmationInput = field => (
    <div className="form-group">
      <label htmlFor="confirmation">{this.context.getLabel( 'confirmation' )} *</label>
      <input
        {...field.input}
        type="password"
        className="form-control"
        autoComplete="off"
      />
      {field.meta.touched && field.meta.error && (
        <div className="text-danger">{_.upperFirst( this.context.getLabel( field.meta.error ) )}</div>
      )}
    </div>
  );

  render() {
    const { getLabel } = this.context;
    const {
      activeTab, handleSubmit, successMessageDisplayed, prefix, history, error
    } = this.props;

    return (
      <tr
        onClick={!activeTab ? () => history.push( prefix + '/password' ) : null}
        className={!activeTab ? 'inactive' : ''}
      >
        <td
          onClick={activeTab ? () => history.push( prefix + '/' ) : null}
          className="col-md-3"
          style={{ cursor: 'pointer' }}
        >
          {getLabel( 'password' )}
        </td>
        {activeTab ? <td>
          <div style={{ padding: '0 5px' }}>
            <form onSubmit={handleSubmit} style={{ paddingBottom: '8px' }}>
              <Field name="oldPassword" component={this.renderOldPasswordInput} />
              <Field name="password" component={this.renderPasswordInput} />
              <Field name="confirmation" component={this.renderConfirmationInput} />

              <div className="form-inline pull-left">
                <button type="submit" className="btn btn-primary">{getLabel( 'save' )}</button>
                {successMessageDisplayed &&
                <label className="text-success" style={{ marginLeft: '10px' }}>
                  <b>{getLabel( 'updatePasswordSuccess' )}</b>
                </label>}
                {error &&
                <label className="text-danger" style={{ marginLeft: '10px' }}>
                  <b>{getLabel( 'error' )}</b>
                </label>}
              </div>
            </form>
          </div>
        </td> : <td style={{ cursor: 'pointer' }}>{getLabel( 'modify' )}</td>}
      </tr>
    );
  }
}
