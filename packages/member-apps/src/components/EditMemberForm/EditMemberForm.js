import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import validate from './validate';
import { renderField, renderInput, renderSelect } from '../../utils/form';

@connect(
  ( state, props ) => {
    const custom = props.member && props.member.custom;
    return {
      initialValues: {
        organization: custom.organization,
        email: custom.email,
        contactNumber: custom.contactNumber,
        contactName: custom.contactName,
        contactPosition: custom.contactPosition,
        role: props.member.role
      },
      roles: state.agenda.roles,
      userCredential: state.member.role
    };
  }
)
@reduxForm( {
  form: 'editMember',
  validate
} )
export default class EditMembersForm extends Component {

  constructor( props ) {
    super( props );
    this.renderField = this::renderField;
    this.renderInput = this::renderInput;
    this.renderSelect = this::renderSelect;
  }

  static contextTypes = {
    getLabel: PropTypes.func
  };

  render() {

    const { handleSubmit, roles, userCredential } = this.props;
    const { getLabel } = this.context;

    const haveRole = value => roles.some( role => role.code === value );

    return (
      <form onSubmit={handleSubmit}>
        <Field
          label={getLabel( 'name' )}
          component={this.renderInput}
          name="contactName"
          type="text"
          classNameGroup="margin-v-md"
          className="form-control"
        />
        <Field
          label={getLabel( 'email' )}
          component={this.renderInput}
          name="email"
          type="email"
          classNameGroup="margin-v-md"
          className="form-control"
        />
        <Field
          label={getLabel( 'phone' )}
          component={this.renderInput}
          name="contactNumber"
          type="text"
          classNameGroup="margin-v-md"
          className="form-control"
        />
        <Field
          label={getLabel( 'position' )}
          component={this.renderInput}
          name="contactPosition"
          type="text"
          classNameGroup="margin-v-md"
          className="form-control"
        />
        <Field
          label={getLabel( 'organization' )}
          component={this.renderInput}
          name="organization"
          type="text"
          classNameGroup="margin-v-md"
          className="form-control"
        />
        <Field
          label={getLabel( 'role' )}
          component={this.renderSelect}
          name="role"
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
          {userCredential === 2 && haveRole( 3 ) && <option value="3">{getLabel( 'moderator' )}</option>}
          {userCredential === 2 && haveRole( 2 ) && <option value="2">{getLabel( 'administrator' )}</option>}
        </Field>

        <div className="text-center">
          <button role="submit" className="btn btn-primary">
            {getLabel( 'editProfile' )}
          </button>
        </div>
      </form>
    );

  }

}
