import _ from 'lodash';
import { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { AuthenticateAndConfirm } from '@openagenda/react-shared';
import I18nContext from '../contexts/I18nContext.js';

class ProfileSettings extends Component {
  static contextType = I18nContext;

  renderFullNameInput = (field) => (
    <div className="form-group">
      <label htmlFor="fullName">{this.context.getLabel('fullname')} *</label>
      <input {...field.input} type={field.type} className="form-control" />
      {field.meta.touched && field.meta.error && (
        <div className="text-danger">
          {_.upperFirst(this.context.getLabel(field.meta.error))}
        </div>
      )}
    </div>
  );

  renderCultureInput = (field) => (
    <div className="form-group">
      <label htmlFor="culture">{this.context.getLabel('language')} *</label>
      <select {...field.input} className="form-control">
        <option value="fr">Français</option>
        <option value="en">English</option>
        <option value="de">Deutsch</option>
        <option value="es">Español</option>
        <option value="it">Italiano</option>
        <option value="br">Brezhoneg</option>
        <option value="nl">Nederlands</option>
        <option value="oc">Occitan</option>
      </select>
      {field.meta.touched && field.meta.error && (
        <div className="text-danger">
          {_.upperFirst(this.context.getLabel(field.meta.error))}
        </div>
      )}
    </div>
  );

  render() {
    const { getLabel } = this.context;
    const {
      user,
      activeTab,
      handleSubmit,
      displayModal,
      deleteAccountRes,
      successMessageDisplayed,
      prefix,
      history,
    } = this.props;

    const deleteModal = {
      visible: true,
      title: getLabel('deleteMyAccount'),
      content: (
        <AuthenticateAndConfirm
          res={deleteAccountRes}
          method="delete"
          message={getLabel('deleteModalText')}
          onSuccess={() => {
            window.location.href = '/signout';
          }}
        />
      ),
      containerClassName: '',
    };

    return (
      <tr
        onClick={
          !activeTab
            ? () => history.push(`${prefix}/profile`, { fromUserApps: true })
            : null
        }
        className={!activeTab ? 'inactive' : ''}
      >
        <td
          role="gridcell"
          onClick={
            activeTab
              ? () => history.push(`${prefix}/`, { fromUserApps: true })
              : null
          }
          className="col-md-3"
          style={{ cursor: 'pointer' }}
        >
          {getLabel('userProfile')}
        </td>
        {activeTab ? (
          <td>
            <div style={{ padding: '0 5px' }}>
              <form onSubmit={handleSubmit} style={{ paddingBottom: '8px' }}>
                <Field name="fullName" component={this.renderFullNameInput} />
                <Field name="culture" component={this.renderCultureInput} />

                <div className="form-inline pull-left">
                  <button type="submit" className="btn btn-primary">
                    {getLabel('save')}
                  </button>
                  {successMessageDisplayed && (
                    <strong
                      className="text-success"
                      style={{ marginLeft: '10px' }}
                    >
                      <b>{getLabel('updateProfileSuccess')}</b>
                    </strong>
                  )}
                </div>
              </form>
              <div className="pull-right">
                <button
                  type="button"
                  className="btn btn-link text-danger"
                  onClick={() => displayModal(deleteModal)}
                >
                  {getLabel('deleteMyAccount')}
                </button>
              </div>
            </div>
          </td>
        ) : (
          <td style={{ cursor: 'pointer' }}>
            <b className="text-muted">{user.fullName}</b>
          </td>
        )}
      </tr>
    );
  }
}

export default reduxForm({
  form: 'profileSettings',
  destroyOnUnmount: false,
})(
  connect((state) => ({
    prefix: state.settings.prefix,
    deleteAccountRes: state.res.deleteAccount,
  }))(withRouter(ProfileSettings)),
);
