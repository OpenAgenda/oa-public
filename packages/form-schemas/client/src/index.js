import _ from 'lodash';
import ih from 'immutability-helper';
import React, { Component } from 'react';

import formSchemaLabels from '@openagenda/labels/form-schemas';

import errorLabels from '@openagenda/labels/errors';
import flattenLabels from '@openagenda/labels/flatten';
import Spinner from '@openagenda/react-components/build/Spinner';

import FormSchema from './iso/FormSchema';

import flatten from './lib/flatten';
import submit from './lib/submit';
import getRelatedFieldValues from './lib/getRelatedFieldValues';

const Field = require( './Components/Field' );

export default class FormSchemaComponent extends Component {

  constructor( props ) {

    super( props );

    const { lang, values, withErrors, labels } = props;

    const init = {
      labels: {
        errors: flattenLabels( _.assign( {}, errorLabels, _.get( labels, 'errors', {} ) ), lang, true ),
        main: flattenLabels( formSchemaLabels, lang, true )
      },
      defaultLabelLanguage: this.props.lang
    }

    if ( !this.props.stateless ) {

      init.values = values;
      init.errors = [];
      init.loading = false;

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

    } else if ( errors && errors.length ) {

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

  onSubmit( e, options = {} ) {

    if ( e ) e.preventDefault();

    const { draft } = _.assign( {
      draft: false
    }, options );

    const query = draft ? { draft: true } : null;

    const values = this.get( 'values' );

    const { clean, errors } = this.sanitize( values, { draft } );

    if ( _.keys( errors ).length ) {

      return this.set( { errors } );

    }

    this.set( { loading: true } );

    submit( {
      res: _.get( this.props.res, 'post', '' ),
      formSchema: this._getFormSchema(),
      values, // values can be clean anew once received by server
      files: this.get( 'files' ),
      query
    } ).then( res => {

      if ( res.statusCode === 200 && this.props.onSubmitSuccess ) {

        this.props.onSubmitSuccess( this.get( 'values' ), res );

      } else if ( res.statusCode === 200 ) {

        this.set( {
          submitted: true,
          globalError: null,
          errors: [],
          loading: false
        } );

      } else {

        this.onServerError( res );

      }

    } ).catch( err => {

      console.log( 'form-schemas: there was an error during submit', err );

    } );

  }

  onServerError( res ) {

    console.log( 'evaluating server error', res.body );

    const errors = _.get( res, 'body.errors' );

    if ( _.isArray( errors ) && errors.length ) {

      this.set( {
        globalError: null,
        errors,
        loading: false
      } );

    } else {

      this.onServerException();

    }

  }

  onServerException( err ) {

    this.set( {
      globalError: _.get( this, 'state.labels.errors.serverException' ),
      loading: false
    } );

  }

  getFieldErrors( field, value, impactedFields = [] ) {

    const values = {};

    values[ field ] = value;

    const { clean, errors } = this.sanitize( values );

    const keepFields = impactedFields.concat( field );

    return errors.filter( e => keepFields.includes( e.field ) );

  }

  _getFormSchema() {

    // building the formSchema is a bit costly, so memoizition is useful here

    const hasChanged = !![ 'hash', 'lang' ].filter(
      memoizeKey => _.get( this.memoized, memoizeKey, '' ) !== _.get( this.props, memoizeKey, '' )
    ).length;

    if ( hasChanged || !this.memoized ) {

      this.memoized = {
        formSchema: new FormSchema(
          ih( this.props.schema, {
            defaultLabelLanguage: { $set: this.props.lang }
          } )
        ),
        hash: _.get( this, 'props.hash', '' ),
        lang: _.get( this, 'props.lang', '' )
      }

    }

    return this.memoized.formSchema;

  }

  sanitize( values, options ) {

    try {

      // options may contain draft bool at true.
      const validate = this._getFormSchema().getValidate( options );

      const clean = validate( values );

      return { clean, errors: [] };

    } catch ( errors ) {

      if ( !_.isArray( errors ) ) throw errors;

      // simpler to always keep errors as arrays.
      return {
        clean: null,
        errors: errors.map( e => {

          const field = _.first( this._getFormSchema().getFields().filter( f => f.field == e.field ) );

          if ( !field ) {

            throw new Error( 'did not find field matching validation error', e );

          }

          return ih( e, {
            label: { $set: _.get( this.state.labels.errors, e.code, e.message ) },
            fieldLabel: { $set: _.get( field.label, this.props.lang ) }
          } );

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

    const impactedFields = this._getFormSchema().getFields().filter( f => f.enableWith === field ).map( f => f.field );

    const updatedErrors = this.get( 'errors', [] )
      .filter( e => !impactedFields.concat( field ).includes( e.field ) ) // keep other errors
      .concat( this.getFieldErrors( field, value, impactedFields ) )

    const isFileField = this._getFormSchema().getFileFields().map( f => f.field ).includes( field );

    const currentFiles = this.get( 'files', {} );

    const filesUpdate = {};

    if ( isFileField && value ) {

      filesUpdate[ field ] = { $set: files };

    } else if ( isFileField ) {

      filesUpdate[ '$unset' ] = [ field ];

    }

    this.set( {
      files: ih( currentFiles, filesUpdate ),
      values: ih( this.get( 'values', {} ) || {}, updateValues ),
      errors: updatedErrors
    } );

  }

  render() {

    const { lang, classNames } = this.props;

    const { submitted } = this.state;

    const values = this.get( 'values' );
    const loading = this.get( 'loading' );

    if ( submitted ) {

      return <div className="text-center">
        <div className="padding-all-sm">
          <span>{this.state.labels.main.confirmation}</span>
        </div>
        <button className="btn btn-primary" onClick={this.onSubmitConfirm}>{this.state.labels.main.done}</button>
      </div>

    }

    return <div className="oa-form">
      <div className={_.get( classNames, 'fieldsCanvas', '' ) }>
        {this._getFormSchema().getFields().filter( f => f.display ).map( ( f, i ) => {

          const flatLabels = flatten( formSchemaLabels, lang );

          return <Field
            disabled={loading}
            className={_.get( classNames, 'field', 'form-group' ) }
            customComponents={this.props.components}
            lang={this.props.lang}
            labels={this.state.labels.main}
            type={f.fieldType}
            key={'field' + i}
            field={f}
            value={_.get( values, f.field, null )}
            relatedValues={getRelatedFieldValues( f, values )}
            error={ _.get( _.first( _.filter( this.get( 'errors', [] ), e => e.field === f.field ) ), 'label' )}
            onChange={this.onChange.bind( this, f.field )}
          />

        } )}
      </div>
      {this.renderGroupedErrors()}
      {this.renderBottomActions()}
    </div>

  }

  renderGroupedErrors() {

    const errors = this.get( 'errors', [] );

    const globalError = this.get( 'globalError' );

    if ( !errors.length && !globalError ) return null;

    const matching = _.first( _.get( this.props, 'errorComponents', [] ).filter( a => a.position === 'bottom' ) );

    if ( matching ) {

      const { Component } = matching;

      return <Component errors={errors} global={globalError} />

    }

    return <div className={_.get( this.props, 'classNames.bottomErrorsCanvas' ) || 'error-summary boxed padding-v-sm padding-h-sm margin-v-md'}>
      { errors.length ? <div>
        <div className="padding-bottom-sm">{this.state.labels.main.groupErrorHeader}:</div>
        <ul className="list-unstyled margin-left-xs">
        {errors.map( ( e, i ) => <li key={'error-' + i}>
          <label>{e.fieldLabel}</label>:&nbsp;
          <span>{e.label}</span>
        </li> )}
        </ul>
      </div> : null }
      { globalError ? <div className="text-center padding-top-xs">
        <label>{globalError}</label>
      </div>: null }
    </div>

  }

  renderBottomActions() {

    const matching = _.first( _.get( this.props, 'actionComponents', [] ).filter( a => a.position === 'bottom' ) );

    const loading = this.get( 'loading' );

    if ( matching ) {

      const { Component } = matching;

      return <Component onSubmit={this.onSubmit} loading={loading} sanitize={this.sanitize.bind( this )} />

    }

    return <div style={{position: 'relative'}} className={_.get( this.props, 'classNames.bottomActionsCanvas' ) || 'form-group'}>
      <button className={loading ? 'btn btn-default' : 'btn btn-primary' } type="submit" disabled={loading} onClick={this.onSubmit}>{this.state.labels.main.submit }</button>
      {loading && <span className="margin-left-sm"><Spinner mode="inline" /></span>}
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
  labels: {
    errors: {}
  },
  fileKey: null
}
