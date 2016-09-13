import React, { Component, PropTypes } from 'react';
import { reduxForm, Field } from 'redux-form';
import { validate, asyncValidate, schema as agendaSchema } from '../containers/AgendaCreation/validate';

@reduxForm( {
  form: 'agendaCreation',
  destroyOnUnmount: false,
  validate,
  asyncValidate,
  asyncBlurFields: [ 'title', 'slug' ],
  initialValues: {
    contribution: {
      type: agendaSchema.contribution.type.default.toString(),
      defaultState: agendaSchema.contribution.defaultState.default.toString()
    }
  }
} )
export default class CreationFirstStep extends Component {

  static contextTypes = {
    getLabel: PropTypes.func
  };

  renderField = ( {
    content, input: { name, value }, label, max,
    errorOnDirty, meta: { touched, error, dirty }
  } ) => {
    const displayError = errorOnDirty ? dirty || touched : touched;
    return (
      <div className={`form-group ${displayError && error ? 'has-error has-feedback' : ''}`}>
        {label && <label htmlFor={name}>{label}</label>}
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

  renderInput = ( { type, placeholder, className, ...props } ) => {
    const content = <input {...props.input} type={type} placeholder={placeholder} className={className} />;
    return this.renderField( { content, ...props } );
  };

  renderTextarea = ( { placeholder, className, rows, cols, ...props } ) => {
    const content = (
      <div>
        <textarea {...props.input} placeholder={placeholder} className={className} rows={rows} cols={cols} />
      </div>);
    return this.renderField( { content, ...props } );
  };

  renderInputGroup = ( { type, placeholder, className, before, after, ...props } ) => {
    const content = (
      <div className="input-group">
        {before}
        <input {...props.input} type={type} placeholder={placeholder} className={className} />
        {after}
      </div>);
    return this.renderField( { content, ...props } );
  };

  render() {
    const { handleSubmit } = this.props;
    const { getLabel } = this.context;

    return (
      <div>
        <h2>{getLabel( 'yourAgenda' )}</h2>
        <h4 className="text-muted">{getLabel( 'subtitle' )}</h4>
        <form onSubmit={handleSubmit}>
          <Field
            name="title"
            component={this.renderInput}
            type="text"
            placeholder={getLabel( 'namePlaceholder' )}
            className="form-control"
            label={`${getLabel( 'name' )} *`}
            max={agendaSchema.title.max}
          />
          <Field
            name="description"
            component={this.renderTextarea}
            rows={6}
            className="form-control"
            label={`${getLabel( 'description' )} *`}
            max={agendaSchema.description.max}
          />
          <Field
            type="text"
            name="url"
            component={this.renderInput}
            className="form-control"
            placeholder={getLabel( 'websitePlaceholder' )}
            label={getLabel( 'website' )}
          />
          <Field
            type="text"
            name="slug"
            component={this.renderInputGroup}
            className="form-control"
            placeholder="URL"
            label={getLabel( 'personalizedSlug' )}
            before={<div className="input-group-addon">openagenda.com/</div>}
            errorOnDirty={true}
          />
          <div className="pull-right">
            <button type="submit" className="btn btn-primary">{getLabel( 'next' )}</button>
          </div>
        </form>
      </div>
    );
  }

}
