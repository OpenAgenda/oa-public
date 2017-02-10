import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import validate from './validate';
import { renderField, renderTextarea, renderSelect } from '../../utils/form';

@connect(
  state => ({
    roles: state.agenda.roles,
    userCredential: state.stakeholder.credential
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
  }

  static contextTypes = {
    getLabel: PropTypes.func
  };

  render() {

    const { handleSubmit, userCredential } = this.props;
    const { getLabel } = this.context;

    const haveRole = value => this.props.roles.some(role => role.value === value);

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
        >
          <option value="0" hidden>{getLabel( 'selectRole' )}</option>
          {haveRole(4) && <option value="4">{getLabel( 'reader' )}</option>}
          {haveRole(1) && <option value="1">{getLabel( 'contributor' )}</option>}
          {userCredential !== 3 && haveRole(3) && <option value="3">{getLabel( 'moderator' )}</option>}
          {userCredential !== 3 && haveRole(2) && <option value="2">{getLabel( 'administrator' )}</option>}
        </Field>

        <div className="text-center">
          <button className="btn btn-primary" role="submit">
            {getLabel( 'inviteMembers' )}
          </button>
        </div>
      </form>
    );

  }

}
