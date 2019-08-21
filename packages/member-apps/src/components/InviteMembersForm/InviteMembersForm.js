import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import classNames from 'classnames';
import Spinner from '@openagenda/react-components/build/Spinner';
import validate from './validate';
import { renderField, renderTextarea, renderSelect, renderMarkdownInput } from '../../utils/form';

@connect(
  state => ({
    roles: state.agenda.roles,
    invitationMessage: state.agenda.credentials.invitationMessage,
    userCredential: state.member.role,
    inviteLoading: state.members.inviteLoading
  })
)
@reduxForm( {
  form: 'inviteMembers',
  validate
} )
export default class InviteMembersForm extends Component {

  constructor( props ) {
    super( props );
    this.renderField = this::renderField;
    this.renderTextarea = this::renderTextarea;
    this.renderSelect = this::renderSelect;
    this.renderMarkdownInput = this::renderMarkdownInput;
  }

  static contextTypes = {
    getLabel: PropTypes.func
  };

  render() {

    const { handleSubmit, userCredential, invitationMessage, inviteLoading } = this.props;
    const { getLabel } = this.context;

    const haveRole = value => this.props.roles.some( role => role.value === value );

    return (
      <form onSubmit={handleSubmit} className="invite-members-form">
        <Field
          label={getLabel( 'emails' )}
          subLabel={<p className="text-muted">{getLabel( 'inviteMembersPlaceholder' )}</p>}
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
          label={getLabel( 'role' )}
          component={this.renderSelect}
          name="credential"
          type="select"
          classNameGroup="margin-top-md margin-bottom-lg"
          className="form-control"
          defaultValue="0"
          displayFeedback={false}
          parse={v => parseInt( v )}
        >
          <option value="0" hidden>{getLabel( 'selectRole' )}</option>
          {haveRole( 4 ) && <option value="4">{getLabel( 'reader' )}</option>}
          {haveRole( 1 ) && <option value="1">{getLabel( 'contributor' )}</option>}
          {userCredential !== 3 && haveRole( 3 ) && <option value="3">{getLabel( 'moderator' )}</option>}
          {userCredential !== 3 && haveRole( 2 ) && <option value="2">{getLabel( 'administrator' )}</option>}
        </Field>
        {invitationMessage && <Field
          label={getLabel( 'message' )}
          component={this.renderMarkdownInput}
          name="message"
          classNameGroup="margin-top-md margin-bottom-lg"
        />}

        <div className="text-center">
          <button className={classNames( 'btn btn-primary', { disabled: inviteLoading } )} role="submit">
            {getLabel( 'inviteMembers' )}
          </button>
        </div>

        {inviteLoading && <Spinner />}
      </form>
    );

  }

}
