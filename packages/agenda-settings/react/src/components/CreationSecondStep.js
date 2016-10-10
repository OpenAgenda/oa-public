import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { validate, asyncValidate } from '../containers/AgendaCreation/validate';
import get from 'lodash.get';

@reduxForm( {
  form: 'agendaCreation',
  destroyOnUnmount: false,
  validate,
  asyncValidate
} )
@connect( state => ({
  title: state.form.agendaCreation.values.title,
  errors: state.form.agendaCreation.syncErrors,
  fields: state.form.agendaCreation.fields
}) )
export default class CreationSecondStep extends Component {

  static contextTypes = {
    getLabel: PropTypes.func
  };

  render() {
    const { previousPage, handleSubmit, errors, fields, title } = this.props;
    const { getLabel } = this.context;

    const getError = fieldname => {
      return get( fields, fieldname ) && get( fields, fieldname, {} ).touched && errors && errors[ fieldname ];
    };

    return (
      <div>
        <h2>{title}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <div className={`radio ${getError( 'settings.contribution.type' ) ? 'has-error' : ''}`}>
              <p><b>{getLabel( 'contribType' )}</b></p>
              <label>
                <Field name="settings.contribution.type" component="input" type="radio" value="0" />
                {getLabel( 'contribTypeChoosen' )}
              </label><br />
              <label>
                <Field name="settings.contribution.type" component="input" type="radio" value="1" />
                {getLabel( 'contribTypeAll' )}
              </label>
            </div>
          </div>
          <div className="form-group">
            <div className={`radio ${getError( 'settings.contribution.defaultState' ) ? 'has-error' : ''}`}>
              <p><b>{getLabel( 'contribDefaultState' )}</b></p>
              <label>
                <Field
                  name="settings.contribution.defaultState"
                  component="input"
                  type="radio"
                  value="2"
                />
                {getLabel( 'contribDefaultStatePublished' )}<br />
                <span className="text-muted">{getLabel( 'contribDefaultStatePublishedText' )}</span>
              </label><br />
              <label>
                <Field
                  name="settings.contribution.defaultState"
                  component="input"
                  type="radio"
                  value="0"
                />
                {getLabel( 'contribDefaultStateUnpublished' )}<br />
                <span className="text-muted">{getLabel( 'contribDefaultStateUnpublishedText' )}</span>
              </label>
            </div>
          </div>
          <button type="button" className="btn btn-default" onClick={previousPage}>{getLabel( 'previous' )}</button>
          <div className="pull-right">
            <button type="submit" className="btn btn-primary">{getLabel( 'createAgenda' )}</button>
          </div>
        </form>
      </div>
  );
  }

  }
