import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { validate, asyncValidate, schema as agendaSchema } from '../containers/AgendaCreation/validate';
import { renderInput, renderTextarea, renderInputGroup } from '../utils/inputs';

@reduxForm( {
  form: 'agendaCreation',
  destroyOnUnmount: false,
  validate,
  asyncValidate,
  asyncBlurFields: [ 'title', 'slug' ],
  initialValues: {
    settings: {
      contribution: {
        type: agendaSchema.settings.contribution.type.default.toString(),
        defaultState: agendaSchema.settings.contribution.defaultState.default.toString()
      }
    }
  }
} )
export default class CreationFirstStep extends Component {

  static contextTypes = {
    getLabel: PropTypes.func
  };

  constructor( props ) {
    super( props );
    this.renderInput = renderInput.bind( this );
    this.renderTextarea = renderTextarea.bind( this );
    this.renderInputGroup = renderInputGroup.bind( this );
  }

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
            spellCheck={false}
          />
          <div className="pull-right">
            <button type="submit" className="btn btn-primary">
              {getLabel( 'next' )}
            </button>
          </div>
        </form>
      </div>
    );
  }

}
