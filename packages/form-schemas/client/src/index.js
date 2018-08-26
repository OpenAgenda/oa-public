"use strict";

import _ from 'lodash';
import ih from 'immutability-helper';
import React, { Component } from 'react';
import sa from 'superagent';

import formSchemaLabels from '@openagenda/labels/form-schemas';

import errorLabels from '@openagenda/labels/errors';
import flattenLabels from '@openagenda/labels/flatten';

import FormSchema from '../../iso/FormSchema';

import { flatten, post } from './lib/helpers';

const Field = require( './lib/Field' );

export default class FormSchemaComponent extends Component {

  constructor( props ) {

    super( props );

    const { lang, values } = props;

    const hasValues = _.isObject( values ) && _.keys( values ).length;

    const init = {
      labels: {
        errors: flattenLabels( errorLabels, lang ),
        main: flattenLabels( formSchemaLabels, lang )
      },
      fields: this._getFormSchema().getFields(),
      defaultLabelLanguage: this.props.lang,
      values,
      errors: [],
      editedFields: {} // fields that have been fiddled with by user
    }

    if ( !this.props.stateless ) {

      init.values = values;
      init.errors = [];

    }

    this.state = init;

    this.onSubmit = this.onSubmit.bind( this );
    this.onSubmitConfirm = this.onSubmitConfirm.bind( this );

    const { errors } = hasValues ? this.validate( values ) : { errors: [] };

    if ( errors && !this.props.stateless ) {

      this.state.errors = errors;

    } else if ( errors ) {

      this.set( { errors } );

    }

  }

  get( field ) {

    return _.get( this, [ this.props.stateless ? 'props' : 'state', field ], null );

  }

  set( update ) {

    if ( !this.props.stateless ) {

      this.setState( update );

    }

    if ( this.props.onChange ) {

      this.props.onChange( update );

    }

  }

  onSubmit( e ) {

    e.preventDefault();

    const { clean, errors } = this.validate( this.get( 'values' ) );

    if ( _.keys( errors ).length ) {

      return this.set( { errors } );

    }

    sa.post( _.get( this.props.res, 'post', '' ), clean ).then( res => {

      if ( res.statusCode === 200 && this.props.onSubmitSuccess ) {

        return this.props.onSubmitSuccess( this.get( 'values' ), res );

      }

      if ( res.statusCode === 200 ) {

        this.setState( {
          submitted: true
        } );

      }

    } );

  }

  getFieldErrors( field, value ) {

    const values = {};

    values[ field ] = value;

    const { clean, errors } = this.validate( values );



    return errors.filter( e => e.field === field );

  }

  _getFormSchema() {

    return new FormSchema( ih( this.props.schema, { 
      defaultLabelLanguage: { $set: this.props.lang } 
    } ) )

  }
  
  validate( values ) {

    try {

      const validate = this._getFormSchema().getValidate();

      const clean = validate( values );

      return { clean, errors: [] };

    } catch ( errors ) {

      // simpler to always keep errors as arrays.
      return { 
        clean: null, 
        errors: errors.map( e => {

          const errorLabel = _.get( this.state.labels.errors, e.code, e.message );

          return _.set( e, 'label', errorLabel );

        } )
      }

    }

  }

  onSubmitConfirm( e ) {

    e.preventDefault();

    window.location.href = this.props.res.redirect;

  }

  onChange( field, value ) {

    const updateValues = {};

    updateValues[ field ] = { $set: value };

    const updatedErrors = this.get( 'errors', [] )
      .filter( e => e.field !== field )
      .concat( this.getFieldErrors( field, value ) );

    this.set( {
      values: ih( this.get( 'values', {} ) || {}, updateValues ),
      errors: updatedErrors
    } );

  }

  render() {

    const { lang } = this.props;

    const { submitted } = this.state;

    const values = this.get( 'values' );

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

        const flatLabels = flatten( formSchemaLabels, lang );

        return <Field
          customComponents={this.props.components}
          lang={this.props.lang}
          labels={this.state.labels.main}
          type={f.fieldType}
          key={'field' + i}
          field={f}
          value={_.get( values, f.field, null )}
          error={ _.get( _.first( _.filter( this.get( 'errors' ), e => e.field === f.field ) ), 'label' )}
          onChange={this.onChange.bind( this, f.field )}
        />

      } )}
      {this.renderBottomActions()}
    </div>

  }

  renderBottomActions() {

    const matching = _.first( _.get( this.props, 'actionComponents', [] ).filter( a => a.position === 'bottom' ) );

    if ( matching ) {

      const { Component } = matching;

      return <Component onSubmit={this.onSubmit} />

    }

    return <div className="form-group">
      <button className="btn btn-default" type="submit" onClick={this.onSubmit}>Done</button>
    </div>

  }

}

FormSchemaComponent.defaultPropTypes = {
  stateless: false, // component handles its own state by default
  onSubmitSuccess: null,
  res: {
    post: '',
    redirect: null
  }
}
