"use strict";

import _ from 'lodash';
import ih from 'immutability-helper';
import sa from 'superagent';

import FormSchema from '@openagenda/form-schemas/iso/FormSchema';

import React, { Component } from 'react';
import { flatten, post } from './helpers';

const Field = require( './Field' );

export default class FormSchemaComponent extends Component {

  constructor( props ) {

    super( props );

    this.state = {
      values: {}, // values by field
      errors: {}, // errors by field
      editedFields: {} // fields that have been fiddled with by user
    }

    this.onSubmit = this.onSubmit.bind( this );
    this.onSubmitConfirm = this.onSubmitConfirm.bind( this );

  }

  onSubmit( e ) {

    e.preventDefault();

    const { clean, errors } = this.validate( this.state.values );

    if ( errors ) {

      return this.setState( { errors } );

    }

    sa.post( this.props.res.post, clean ).then( res => {

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

      return { clean: null, errors: errors.reduce( ( errors, e ) => {

        errors[ e.field ] = e.message;

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

    this.setState( {
      values: ih( this.state.values, updateValues ),
      errors: ih( this.state.errors, updateErrors )
    } );

  }

  render() {

    const { lang } = this.props;

    const { values, submitted } = this.state;

    if ( submitted ) {

      return <div>
        <span>Done!</span>
        <button onClick={this.onSubmitConfirm}>Ok</button>
      </div>

    }

    return <div>
      {this.props.schema.fields.map( ( f, i ) => {

        const flatField = flatten( f, lang );

        return <Field
          type={f.fieldType}
          key={'field' + i}
          field={flatField}
          value={_.get( values, f.field, null )}
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
