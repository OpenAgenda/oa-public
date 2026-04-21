import _ from 'lodash';
import { Component } from 'react';
import { Field, reduxForm, SubmissionError } from 'redux-form';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import I18nContext from '../contexts/I18nContext.js';
import { requestUnlinkFacebook } from '../reducers/userSettings.js';

class UnlinkFacebookSettings extends Component {
  static contextType = I18nContext;

  constructor(props) {
    super(props);
    this.state = { sentTo: null };
    this.submit = this.submit.bind(this);
  }

  async submit(data) {
    const { requestUnlinkFacebook: requestUnlink } = this.props;

    try {
      await requestUnlink(data);
      this.setState({ sentTo: data.email });
    } catch (error) {
      if (error instanceof SubmissionError) {
        throw error;
      }
      throw new SubmissionError({ _error: error.message });
    }
  }

  renderEmailInput = (field) => {
    const { getLabel } = this.context;
    const { user, change } = this.props;
    const accountEmail = user?.email;
    const showLoadAccountEmail = accountEmail && field.input.value !== accountEmail;

    return (
      <div className="form-group">
        <label htmlFor="email">{getLabel('email')} *</label>
        <input
          {...field.input}
          type="email"
          className="form-control"
          autoComplete="email"
        />
        {showLoadAccountEmail ? (
          <div style={{ marginTop: '4px' }}>
            <button
              type="button"
              className="btn btn-link"
              style={{ padding: 0 }}
              onClick={() => change('email', accountEmail)}
            >
              {getLabel('unlinkFacebookUseAccountEmail', {
                email: accountEmail,
              })}
            </button>
          </div>
        ) : null}
        {field.meta.touched && field.meta.error && (
          <div className="text-danger">
            {_.upperFirst(getLabel(field.meta.error))}
          </div>
        )}
      </div>
    );
  };

  renderPasswordInput = (field) => (
    <div className="form-group">
      <label htmlFor="password">{this.context.getLabel('newPassword')} *</label>
      <input
        {...field.input}
        type="password"
        className="form-control"
        autoComplete="new-password"
      />
      {field.meta.touched && field.meta.error && (
        <div className="text-danger">
          {_.upperFirst(this.context.getLabel(field.meta.error))}
        </div>
      )}
    </div>
  );

  renderRepeatInput = (field) => (
    <div className="form-group">
      <label htmlFor="repeat">
        {this.context.getLabel('repeatPassword')} *
      </label>
      <input
        {...field.input}
        type="password"
        className="form-control"
        autoComplete="new-password"
      />
      {field.meta.touched && field.meta.error && (
        <div className="text-danger">
          {_.upperFirst(this.context.getLabel(field.meta.error))}
        </div>
      )}
    </div>
  );

  render() {
    const { getLabel } = this.context;
    const { activeTab, handleSubmit, prefix, history, error, user } = this.props;

    const { sentTo } = this.state;

    if (!user?.facebookUid) {
      return null;
    }

    return (
      <tr
        onClick={
          !activeTab
            ? () =>
              history.push(`${prefix}/unlinkFacebook`, {
                fromUserApps: true,
              })
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
          {getLabel('unlinkFacebook')}
        </td>
        {activeTab ? (
          <td>
            <div style={{ padding: '0 5px' }}>
              {sentTo ? (
                <div className="info-block">
                  <h4 style={{ marginTop: 0 }}>
                    {getLabel('unlinkFacebookSent')}
                  </h4>
                  <p>
                    {getLabel('unlinkFacebookSentInstructions', {
                      email: sentTo,
                    })}
                  </p>
                  <p>{getLabel('unlinkFacebookResendHint')}</p>
                  <button
                    type="button"
                    className="btn btn-default"
                    onClick={() => this.setState({ sentTo: null })}
                  >
                    {getLabel('modify')}
                  </button>
                </div>
              ) : (
                <>
                  <p>{getLabel('unlinkFacebookIntro')}</p>
                  <form
                    onSubmit={handleSubmit(this.submit)}
                    style={{ paddingBottom: '8px' }}
                  >
                    <Field name="email" component={this.renderEmailInput} />
                    <Field
                      name="password"
                      component={this.renderPasswordInput}
                    />
                    <Field name="repeat" component={this.renderRepeatInput} />

                    <div className="form-inline pull-left">
                      <button type="submit" className="btn btn-primary">
                        {getLabel('unlinkFacebookSubmit')}
                      </button>
                      {error && (
                        <label
                          className="text-danger"
                          style={{ marginLeft: '10px' }}
                        >
                          <b>{getLabel(error)}</b>
                        </label>
                      )}
                    </div>
                  </form>
                </>
              )}
            </div>
          </td>
        ) : (
          <td style={{ cursor: 'pointer' }}>{getLabel('modify')}</td>
        )}
      </tr>
    );
  }
}

function validateForm(values) {
  const errors = {};
  if (values.password && values.repeat && values.password !== values.repeat) {
    errors.repeat = 'passwordNotEqual';
  }
  return errors;
}

export default reduxForm({
  form: 'unlinkFacebookSettings',
  destroyOnUnmount: false,
  validate: validateForm,
})(
  connect(
    (state) => ({
      prefix: state.settings.prefix,
    }),
    { requestUnlinkFacebook },
  )(withRouter(UnlinkFacebookSettings)),
);
