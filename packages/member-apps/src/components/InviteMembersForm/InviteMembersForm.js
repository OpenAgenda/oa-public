import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Form, Field } from 'react-final-form';
import classNames from 'classnames';
import Spinner from '@openagenda/react-components/build/Spinner';
import {
  renderField,
  renderTextarea,
  renderSelect,
  renderMarkdownInput
} from '../../utils/form';
import I18nContext from '../../contexts/I18nContext';
import validate from './validate';

@connect(state => ({
  roles: state.agenda.roles,
  invitationMessage: state.agenda.credentials.invitationMessage,
  userCredential: state.member.role,
  inviteLoading: state.members.inviteLoading
}))
class InviteMembersForm extends Component {
  constructor(props) {
    super(props);
    this.renderField = this::renderField;
    this.renderTextarea = this::renderTextarea;
    this.renderSelect = this::renderSelect;
    this.renderMarkdownInput = this::renderMarkdownInput;
  }

  render() {
    const {
      onSubmit,
      userCredential,
      invitationMessage,
      inviteLoading,
      roles
    } = this.props;
    const haveRole = value => roles.some(role => role.code === value);

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
                  {haveRole(4) && (
                    <option value="4">{getLabel('reader')}</option>
                  )}
                  {haveRole(1) && (
                    <option value="1">{getLabel('contributor')}</option>
                  )}
                  {userCredential !== 3 && haveRole(3) && (
                    <option value="3">{getLabel('moderator')}</option>
                  )}
                  {userCredential !== 3 && haveRole(2) && (
                    <option value="2">{getLabel('administrator')}</option>
                  )}
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
                      disabled: inviteLoading
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

InviteMembersForm.contextType = I18nContext;

export default InviteMembersForm;
