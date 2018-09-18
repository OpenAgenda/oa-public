"use strict";

import _ from 'lodash';
import ih from 'immutability-helper';
import React, { Component } from 'react';

import formSchemaLabels from '@openagenda/labels/form-schemas';

import errorLabels from '@openagenda/labels/errors';
import flattenLabels from '@openagenda/labels/flatten';

import FormSchema from '../../iso/FormSchema';

import { flatten } from './lib/helpers';
import submit from './lib/submit';

const Field = require( './Components/Field' );

export default class FormSchemaComponent extends Component {

  constructor( props ) {

    super( props );

    const { lang, values, withErrors } = props;

    const init = {
      labels: {
        errors: flattenLabels( errorLabels, lang ),
        main: flattenLabels( formSchemaLabels, lang )
      },
      defaultLabelLanguage: this.props.lang,
      // values,
      // errors: []
    }

    if ( !this.props.stateless ) {

      init.values = values;
      init.errors = [];

    }

    this.state = init;

    this.onSubmit = this.onSubmit.bind( this );
    this.onSubmitConfirm = this.onSubmitConfirm.bind( this );

    const {
      errors,
      files
    } = withErrors ? this.sanitize( values ) : { errors: [] };

    if ( errors && !this.props.stateless ) {

      this.state.errors = errors;

    } else if ( errors ) {

      this.set( { errors } );

    }

  }

  get( field, defaultValue = null) {

    return _.get( this, [ this.props.stateless ? 'props' : 'state', field ], defaultValue );

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

    const values = this.get( 'values' );

    const { clean, errors } = this.sanitize( values );

    if ( _.keys( errors ).length ) {

      return this.set( { errors } );

    }

    submit( {
      res: _.get( this.props.res, 'post', '' ),
      formSchema: this._getFormSchema(),
      values, // values can be clean anew once received by server
      files: this.get( 'files' )
    } ).then( res => {

      if ( res.statusCode === 200 && this.props.onSubmitSuccess ) {

        return this.props.onSubmitSuccess( this.get( 'values' ), res );

      } else if ( res.statusCode === 200 ) {

        this.setState( { submitted: true } );

      } else {

        console.log( 'response status code is %s', res.statusCode );
        console.log( res );

      }

    }, err => {

      throw err;

    } );

  }

  getFieldErrors( field, value ) {

    const values = {};

    values[ field ] = value;

    const { clean, errors } = this.sanitize( values );

    return errors.filter( e => e.field === field );

  }

  _getFormSchema() {

    return new FormSchema( ih( this.props.schema, { 
      defaultLabelLanguage: { $set: this.props.lang } 
    } ) );

  }
  

  sanitize( values ) {

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

  onChange( field, value, files ) {

    const updateValues = {};

    updateValues[ field ] = { $set: value };

    const updatedErrors = this.get( 'errors', [] )
      .filter( e => e.field !== field )
      .concat( this.getFieldErrors( field, value ) );

    const isFileField = this._getFormSchema().getFileFields().map( f => f.field ).includes( field );

    const currentFiles = this.get( 'files', {} );

    this.set( {
      files: isFileField ? _.set( currentFiles, field, files ) : currentFiles,
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
      {this._getFormSchema().getFields().map( ( f, i ) => {

        const flatLabels = flatten( formSchemaLabels, lang );

        return <Field
          customComponents={this.props.components}
          lang={this.props.lang}
          labels={this.state.labels.main}
          type={f.fieldType}
          key={'field' + i}
          field={f}
          value={_.get( values, f.field, null )}
          error={ _.get( _.first( _.filter( this.get( 'errors', [] ), e => e.field === f.field ) ), 'label' )}
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
  withErrors: false,
  stateless: false, // component handles its own state by default
  onSubmitSuccess: null,
  res: {
    post: '',
    redirect: null
  },
  fileKey: null
}
