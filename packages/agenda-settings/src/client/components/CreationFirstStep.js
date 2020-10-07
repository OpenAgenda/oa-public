import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { reduxForm, Field } from 'redux-form';
import { ImageInput } from '@openagenda/react-shared';
import { validate, asyncValidate, schema as agendaSchema } from '../containers/AgendaCreation/validate';
import { renderInput, renderTextarea, renderInputGroup } from '../utils/inputs';

const MAX_SIZE = 1024 * 1024 * 20; // 20MB

@reduxForm( {
  form: 'agendaCreation',
  destroyOnUnmount: false,
  validate,
  asyncValidate,
  asyncBlurFields: [ 'title', 'slug' ],
  initialValues: {
    settings: {
      contribution: {
        type: agendaSchema.settings.fields.contribution.fields.type.default.toString(),
        defaultState: agendaSchema.settings.fields.contribution.fields.defaultState.default.toString()
      }
    }
  }
} )
export default class CreationFirstStep extends Component {

  static contextTypes = {
    getLabel: PropTypes.func,
    lang: PropTypes.string
  };

  constructor( props ) {
    super( props );
    this.renderInput = renderInput.bind( this );
    this.renderTextarea = renderTextarea.bind( this );
    this.renderInputGroup = renderInputGroup.bind( this );
  }

  render() {
    const { handleSubmit } = this.props;
    const { getLabel, lang } = this.context;

    return (
      <div>
        <h2>{getLabel( 'yourAgenda' )}</h2>
        <h4 className="text-muted">{getLabel( 'subtitle' )}</h4>
        <form onSubmit={handleSubmit}>
          <Field
            name="title"
            component={this.renderInput}
            type="text"
            placeholder={getLabel( 'titlePlaceholder' )}
            className="form-control"
            label={`${getLabel( 'title' )} *`}
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
          <div className="form-group">
            <label htmlFor="image">{getLabel('image')}</label>
            <Field
              name="image"
              component={ImageInput}
              type="file"
              locale={lang}
              maxSize={MAX_SIZE}
              width="300px"
              height="300px"
              rounded
            />
          </div>
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
