import _ from 'lodash';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import nl2br from '@openagenda/react-utils/dist/nl2br';


@reduxForm( {
  form: 'profileSettings',
  destroyOnUnmount: false
} )
@connect( state => ({
  prefix: state.settings.prefix,
  user: state.userSettings.user
}) )
@withRouter
export default class ProfileSettings extends Component {
  static propTypes = {
    activeTab: PropTypes.bool
  };

  static contextTypes = {
    getLabel: PropTypes.func
  };

  renderFullNameInput = field => (
    <div className="form-group">
      <label htmlFor="fullName">{this.context.getLabel( 'fullname' )} *</label>
      <input {...field.input} type={field.type} className="form-control" type="text" />
      {field.meta.touched && field.meta.error && (
        <div className="text-danger">{_.upperFirst( getLabel( field.meta.error ) )}</div>
      )}
    </div>
  );

  renderCultureInput = field => (
    <div className="form-group">
      <label htmlFor="culture">{this.context.getLabel( 'language' )} *</label>
      <select {...field.input} className="form-control">
        <option value="fr">Français</option>
        <option value="en">English</option>
        <option value="de">Deutsch</option>
        <option value="es">Español</option>
        <option value="br">Brezhoneg</option>
      </select>
      {field.meta.touched && field.meta.error && (
        <div className="text-danger">{_.upperFirst( this.context.getLabel( field.meta.error ) )}</div>
      )}
    </div>
  );

  render() {
    const { getLabel } = this.context;
    const {
      user, activeTab, handleSubmit, displayModal, deleteAccount,
      successMessageDisplayed, prefix, history
    } = this.props;

    const deleteModal = {
      visible: true,
      title: getLabel( 'areYouSure' ),
      content: <p>{nl2br( getLabel( 'deleteModalText' ) )}</p>,
      action: deleteAccount,
      actionText: getLabel( 'deleteModalButton' )
    };

    return (
      <tr
        onClick={!activeTab ? () => history.push( prefix + '/profile' ) : null}
        className={!activeTab ? 'inactive' : ''}
      >
        <td
          onClick={activeTab ? () => history.push( prefix + '/' ) : null}
          className="col-md-3"
          style={{ cursor: 'pointer' }}
        >
          {getLabel( 'userProfile' )}
        </td>
        {activeTab ? <td>
          <div style={{ padding: '0 5px' }}>
            <form onSubmit={handleSubmit} style={{ paddingBottom: '8px' }}>
              <Field name="fullName" component={this.renderFullNameInput} />
              <Field name="culture" component={this.renderCultureInput} />

              <div className="form-inline pull-left">
                <button type="submit" className="btn btn-primary">{getLabel( 'save' )}</button>
                {successMessageDisplayed &&
                <label className="text-success" style={{ marginLeft: '10px' }}>
                  <b>{getLabel( 'updateProfileSuccess' )}</b>
                </label>}
              </div>

              <div className="pull-right">
                <a href="#" role="button" className="text-danger" onClick={() => displayModal( deleteModal )}>
                  {getLabel( 'deleteMyAccount' )}
                </a>
              </div>
            </form>
          </div>
        </td> : <td style={{ cursor: 'pointer' }}><b className="text-muted">{user.fullName}</b></td>}
      </tr>
    );
  }
}
