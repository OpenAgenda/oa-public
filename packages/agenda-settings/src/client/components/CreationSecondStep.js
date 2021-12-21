import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';
import { Spinner } from '@openagenda/react-shared';
import { validate, asyncValidate } from '../containers/AgendaCreation/validate';
import { get } from 'lodash';

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
    const { previousPage, handleSubmit, errors, fields, title, submitting } = this.props;
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
                <Field
                  name="settings.contribution.type"
                  component="input"
                  type="radio"
                  value="2"
                  format={v => v == null ? '' : v.toString()}
                  parse={value => value === undefined ? undefined : parseInt( value )}
                />
                {getLabel( 'contribTypeChoosen' )}
              </label><br />
              <label>
                <Field
                  name="settings.contribution.type"
                  component="input"
                  type="radio"
                  value="1"
                  format={v => v == null ? '' : v.toString()}
                  parse={value => value === undefined ? undefined : parseInt( value )}
                />
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
                  format={v => v == null ? '' : v.toString()}
                  parse={value => value === undefined ? undefined : parseInt( value )}
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
                  format={v => v == null ? '' : v.toString()}
                  parse={value => value === undefined ? undefined : parseInt( value )}
                />
                {getLabel( 'contribDefaultStateUnpublished' )}<br />
                <span className="text-muted">{getLabel( 'contribDefaultStateUnpublishedText' )}</span>
              </label>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-default"
            onClick={previousPage}
            disabled={submitting}
          >
            {getLabel( 'previous' )}
          </button>
          <div className="pull-right">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={submitting}
            >
              {getLabel( 'createAgenda' )}

              {submitting ? (
                <span className="margin-left-xs">
                  <Spinner mode="inline" />
                </span>
              ) : null}
            </button>
          </div>
        </form>
      </div>
    );
  }

}
