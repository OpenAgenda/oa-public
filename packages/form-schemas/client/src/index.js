"use strict";

import _ from 'lodash';
import ih from 'immutability-helper';
import React, { Component } from 'react';
import sa from 'superagent';

import labels from '@openagenda/labels/form-schemas';

import errorLabels from '@openagenda/labels/errors';
import flattenLabels from '@openagenda/labels/flatten';

import FormSchema from '../../iso/FormSchema';

import { flatten, post } from './lib/helpers';

const Field = require( './lib/Field' );

export default class FormSchemaComponent extends Component {

  constructor( props ) {

    super( props );

    this.state = {
      labels: {
        errors: flattenLabels( errorLabels, this.props.lang ),
        main: flattenLabels( labels, this.props.lang )
      },
      fields: ( new FormSchema( this.props.schema ) ).getFields(),
      values: this.props.values,
      errors: {}, // errors by field
      editedFields: {} // fields that have been fiddled with by user
    }

    this.onSubmit = this.onSubmit.bind( this );
    this.onSubmitConfirm = this.onSubmitConfirm.bind( this );

  }

  onSubmit( e ) {

    e.preventDefault();

    const { clean, errors } = this.validate( this.state.values );

    if ( _.keys( errors ).length ) {

      return this.setState( { errors } );

    }

    sa.post( _.get( this.props.res, 'post', '' ), clean ).then( res => {

      if ( res.statusCode === 200 ) {

        this.setState( {
          submitted: true
        } );

      }

    } );

  }

  getFieldError( field, value ) {

    const values = {};

    values[ field ] = value;

    const { clean, errors } = this.validate( values );

    return _.get( errors, field, null );

  }
  
  validate( values ) {
    
    try {

      const validate = ( new FormSchema( this.props.schema ) ).getValidate();

      const clean = validate( values );

      return { clean, errors: {} };

    } catch ( errors ) {

      console.log( errors );

      return { clean: null, errors: errors.reduce( ( errors, e ) => {

        const errorLabel = _.get( this.state.labels.errors, e.code, e.message );

        const error = e.lang ? _.set( errors[ e.field ] || {}, e.lang, errorLabel ) : errorLabel;

        errors[ e.field ] = error;

        return errors;

      }, {} ) }

    }

  }

  onSubmitConfirm( e ) {

    e.preventDefault();

    window.location.href = this.props.res.redirect;

  }

  onChange( field, value ) {

    const updateValues = {};

    updateValues[ field ] = { $set: value };

    const updateErrors = {};

    updateErrors[ field ] = { $set: this.getFieldError( field, value ) };

    const data = {
      values: ih( this.state.values || {}, updateValues ),
      errors: ih( this.state.errors, updateErrors )
    };

    this.setState( data );

    if ( this.props.onChange ) this.props.onChange( data );

  }

  render() {

    const { lang } = this.props;

    const { values, submitted } = this.state;

    if ( submitted ) {

      return <div className="text-center">
        <div className="padding-all-sm">
          <span>{this.state.labels.main.confirmation}</span>
        </div>
        <button className="btn btn-primary" onClick={this.onSubmitConfirm}>{this.state.labels.main.done}</button>
      </div>

    }

    return <div className="oa-form">
      {this.state.fields.map( ( f, i ) => {

        const flatLabels = flatten( labels, lang );

        return <Field
          customComponents={this.props.components}
          lang={this.props.lang}
          labels={this.state.labels.main}
          type={f.fieldType}
          key={'field' + i}
          field={f}
          value={_.get( values, f.field, null )}
          placeholder={_.get( values, f.field, null )}
          error={_.get( this.state.errors, f.field, null )}
          onChange={this.onChange.bind( this, f.field )}
        />

      } )}
      <div className="form-group">
        <button className="btn btn-default" type="submit" onClick={this.onSubmit}>Done</button>
      </div>
    </div>

  }

}

FormSchemaComponent.defaultPropTypes = {
  res: {
    post: '',
    redirect: null
  }
}