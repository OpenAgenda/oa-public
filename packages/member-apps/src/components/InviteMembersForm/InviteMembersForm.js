import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Field } from 'react-final-form';
import classNames from 'classnames';
import { Spinner } from '@openagenda/react-shared';
import {
  renderField,
  renderTextarea,
  renderSelect,
  renderMarkdownInput,
} from '../../utils/form';
import I18nContext from '../../contexts/I18nContext';
import validate from './validate';

@connect(state => ({
  inviteLoading: state.members.inviteLoading,
}))
export default class InviteMembersForm extends Component {
  static contextType = I18nContext;

  constructor(props) {
    super(props);
    this.renderField = renderField.bind(this);
    this.renderTextarea = renderTextarea.bind(this);
    this.renderSelect = renderSelect.bind(this);
    this.renderMarkdownInput = renderMarkdownInput.bind(this);
  }

  render() {
    const {
      onSubmit, userCredential, agenda, inviteLoading
    } = this.props;
    const {
      credentials: { invitationMessage },
    } = agenda;

    return (
      <Form
        onSubmit={onSubmit}
        validate={validate}
        render={({ handleSubmit }) => (
          <I18nContext.Consumer>
            {({ getLabel }) => (
              <form onSubmit={handleSubmit} className="invite-members-form">
                <Field
                  label={getLabel('emails')}
                  subLabel={(
                    <p className="text-muted">
                      {getLabel('inviteMembersPlaceholder')}
                    </p>
                  )}
                  component={this.renderTextarea}
                  name="emails"
                  type="textarea"
                  classNameGroup="emails-input margin-v-md"
                  className="form-control"
                  rows="5"
                  displayFeedback={false}
                  normalize={value => value}
                  format={value => value}
                />
                <Field
                  label={getLabel('role')}
                  component={this.renderSelect}
                  name="role"
                  type="select"
                  classNameGroup="margin-top-md margin-bottom-lg"
                  className="form-control"
                  defaultValue="1"
                  displayFeedback={false}
                  parse={v => parseInt(v, 10)}
                >
                  {agenda.private ? (
                    <option value="4">{getLabel('reader')}</option>
                  ) : null}
                  <option value="1">{getLabel('contributor')}</option>
                  {userCredential === 2 && agenda.credentials.moderators ? (
                    <option value="3">{getLabel('moderator')}</option>
                  ) : null}
                  {userCredential === 2 ? (
                    <option value="2">{getLabel('administrator')}</option>
                  ) : null}
                </Field>
                {invitationMessage && (
                  <Field
                    label={getLabel('message')}
                    component={this.renderMarkdownInput}
                    name="message"
                    classNameGroup="margin-top-md margin-bottom-lg"
                  />
                )}

                <div className="text-center">
                  <button
                    className={classNames('btn btn-primary', {
                      disabled: inviteLoading,
                    })}
                    type="submit"
                  >
                    {getLabel('inviteMembers')}
                  </button>
                </div>

                {inviteLoading && <Spinner />}
              </form>
            )}
          </I18nContext.Consumer>
        )}
      />
    );
  }
}
