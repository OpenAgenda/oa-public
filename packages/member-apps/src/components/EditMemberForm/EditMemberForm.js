import React, { Component } from 'react';
import { Form, Field } from 'react-final-form';
import { renderField, renderInput, renderSelect } from '../../utils/form';
import I18nContext from '../../contexts/I18nContext';
import validate from './validate';

export default class EditMemberForm extends Component {
  static contextType = I18nContext;

  constructor(props) {
    super(props);
    this.renderField = this::renderField;
    this.renderInput = this::renderInput;
    this.renderSelect = this::renderSelect;
  }

  render() {
    const {
      member, agenda, userCredential, onSubmit
    } = this.props;
    const custom = (member && member.custom) || {};

    return (
      <Form
        onSubmit={onSubmit}
        validate={validate}
        initialValues={{
          organization: custom.organization,
          email: custom.email,
          contactNumber: custom.contactNumber,
          contactName: custom.contactName,
          contactPosition: custom.contactPosition,
          role: member.role,
        }}
        render={({ handleSubmit }) => (
          <I18nContext.Consumer>
            {({ getLabel }) => (
              <form onSubmit={handleSubmit}>
                <Field
                  label={getLabel('name')}
                  component={this.renderInput}
                  name="contactName"
                  type="text"
                  classNameGroup="margin-v-md"
                  className="form-control"
                />
                <Field
                  label={getLabel('email')}
                  component={this.renderInput}
                  name="email"
                  type="email"
                  classNameGroup="margin-v-md"
                  className="form-control"
                />
                <Field
                  label={getLabel('phone')}
                  component={this.renderInput}
                  name="contactNumber"
                  type="text"
                  classNameGroup="margin-v-md"
                  className="form-control"
                />
                <Field
                  label={getLabel('position')}
                  component={this.renderInput}
                  name="contactPosition"
                  type="text"
                  classNameGroup="margin-v-md"
                  className="form-control"
                />
                <Field
                  label={getLabel('organization')}
                  component={this.renderInput}
                  name="organization"
                  type="text"
                  classNameGroup="margin-v-md"
                  className="form-control"
                />
                <Field
                  label={getLabel('role')}
                  component={this.renderSelect}
                  name="role"
                  type="select"
                  classNameGroup="margin-top-md margin-bottom-lg"
                  className="form-control"
                  displayFeedback={false}
                  parse={v => parseInt(v, 10)}
                >
                  <option value="0" hidden>
                    {getLabel('selectRole')}
                  </option>
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

                <div className="text-center">
                  <button type="submit" className="btn btn-primary">
                    {getLabel('editProfile')}
                  </button>
                </div>
              </form>
            )}
          </I18nContext.Consumer>
        )}
      />
    );
  }
}
