import React, { Component, PropTypes } from 'react';
import { reduxForm, Field } from 'redux-form';
import validate from './validate';

@reduxForm( {
  form: 'inviteMembers',
  validate
} )
export default class InviteMembersForm extends Component {

  constructor( props ) {
    super( props );
    this.renderField = ::this.renderField;
    this.renderTextarea = ::this.renderTextarea;
    this.renderSelect = ::this.renderSelect;
  }

  static contextTypes = {
    getLabel: PropTypes.func
  };

  renderField = ( {
    content, input: { name, value }, label, subLabel, max, classNameGroup, visible,
    errorOnDirty, meta: { touched, error, dirty }
  } ) => {
    const displayError = errorOnDirty ? dirty || touched : touched;

    if ( visible === false ) return <div></div>;

    return (
      <div className={`form-group ${classNameGroup} ${displayError && error ? 'has-error has-feedback' : ''}`}>
        {label && <label htmlFor={name}>{label}</label>}
        {subLabel}
        {content}
        {displayError && error && <span className="form-control-feedback">
          <i className="fa fa-times" aria-hidden="true"></i>
        </span>}
        {displayError && error && <div className={`text-danger ${max && 'pull-left' || ''}`}>
          {this.context.getLabel( error )}
        </div>}
        {max && <div className={`text-right ${max - value.length < 0 && 'text-danger' || ''}`}>
          {max - value.length}
        </div>}
      </div>
    );
  };

  renderTextarea = ( { placeholder, className, rows, cols, spellCheck, ...props } ) => {
    const inputAttrs = { placeholder, className, rows, cols, spellCheck };

    const content = <div>
      <textarea {...props.input} {...inputAttrs} />
    </div>

    return this.renderField( { content, ...props } );
  };

  renderSelect = ( { className, children, ...props } ) => {
    const inputAttrs = { className };

    const content = <select {...props.input} {...inputAttrs}>
      {children}
    </select>;

    return this.renderField( { content, ...props } );
  };

  render() {

    const { handleSubmit } = this.props;
    const { getLabel } = this.context;

    return (
      <form onSubmit={handleSubmit}>
        <Field
          label={getLabel( 'emails' )}
          component={this.renderTextarea}
          name="emails"
          type="textarea"
          classNameGroup="search margin-v-md"
          className="form-control"
          rows="5"
          placeholder={getLabel( 'inviteMembersPlaceholder' )}
        />
        <Field
          label={getLabel( 'role' )}
          component={this.renderSelect}
          name="role"
          type="select"
          classNameGroup="search margin-top-md margin-bottom-lg"
          className="form-control"
        >
          <option selected disabled>{getLabel( 'selectRole' )}</option>
          <option value="4">{getLabel( 'reader' )}</option>
          <option value="1">{getLabel( 'contributor' )}</option>
          <option value="3">{getLabel( 'moderator' )}</option>
          <option value="2">{getLabel( 'administrator' )}</option>
        </Field>
      </form>
    );

  }

}
