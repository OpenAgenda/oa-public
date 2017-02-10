import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import validate from './validate';
import { renderField, renderInput } from '../../utils/form';

@connect(
  ( state, props ) => {
    const custom = props.stakeholder && props.stakeholder.custom;
    return {
      initialValues: {
        organization: custom.organization,
        email: custom.email,
        contactNumber: custom.contactNumber,
        contactName: custom.contactName,
        contactPosition: custom.contactPosition
      }
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
  }

  static contextTypes = {
    getLabel: PropTypes.func
  };

  render() {

    const { handleSubmit } = this.props;
    const { getLabel } = this.context;

    return (
      <form onSubmit={handleSubmit}>
        <Field
          label="Name"
          component={this.renderInput}
          name="contactName"
          type="text"
          classNameGroup="margin-v-md"
          className="form-control"
        />
        <Field
          label="Email"
          component={this.renderInput}
          name="email"
          type="email"
          classNameGroup="margin-v-md"
          className="form-control"
        />
        <Field
          label="Tel"
          component={this.renderInput}
          name="contactNumber"
          type="text"
          classNameGroup="margin-v-md"
          className="form-control"
          placeholder=""
        />
        <Field
          label="Position"
          component={this.renderInput}
          name="contactPosition"
          type="text"
          classNameGroup="margin-v-md"
          className="form-control"
          placeholder=""
        />
        <Field
          label="Organization"
          component={this.renderInput}
          name="organization"
          type="text"
          classNameGroup="margin-v-md"
          className="form-control"
          placeholder=""
        />

        <div className="text-center">
          <button role="submit" className="btn btn-primary">
            {getLabel( 'editProfile' )}
          </button>
        </div>
      </form>
    );

  }

}
