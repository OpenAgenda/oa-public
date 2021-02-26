import _ from 'lodash';
import debug from 'debug';
import ih from 'immutability-helper';
import React, { Component } from 'react';

import formSchemaLabels from '@openagenda/labels/form-schemas';

import errorLabels from '@openagenda/labels/errors';
import flattenLabels from '@openagenda/labels/flatten';
import { Spinner } from '@openagenda/react-components';
import {
  unloadWarning
} from '@openagenda/react-shared';

import FormSchema from './iso/FormSchema';
import getErrorLabel from './iso/getErrorLabel';
import getWithFieldName from './iso/getWithFieldName';

import flatten from './lib/flatten';
import submit from './lib/submit';
import getRelatedFieldValues from './lib/getRelatedFieldValues';
import isFieldDisplayed from './lib/isFieldDisplayed';

const log = debug('FormSchemaComponent');
const Field = require('./Components/Field');

export default class FormSchemaComponent extends Component {

  constructor(props) {
    super(props);

    const {
      lang,
      values,
      withErrors,
      labels
    } = props;

    log('values at init: %j', values);

    const init = {
      labels: {
        errors: flattenLabels(_.assign({}, errorLabels, _.get(labels, 'errors', {})), lang, true),
        main: flattenLabels(formSchemaLabels, lang, true)
      },
      defaultLabelLanguage: this.props.lang
    }

    if (!this.props.stateless) {
      init.values = values;
      init.errors = [];
      init.loading = false;
    }

    this.state = init;

    this.onSubmit = this.onSubmit.bind(this);
    this.onSubmitConfirm = this.onSubmitConfirm.bind(this);

    const sanitized = this.sanitize(values);

    // display of errors at load
    const {
      errors,
      files
    } = withErrors ? sanitized : { errors: [] };

    if (errors && !this.props.stateless) {
      this.state.errors = errors;
    } else if (errors && errors.length) {
      this.set({ errors });
    }
  }

  get(field, defaultValue = null) {
    return _.get(this, [this.props.stateless ? 'props' : 'state', field], defaultValue);
  }

  set(update) {
    log('update', update);
    if (!this.props.stateless) {
      this.setState(update);
    }

    if (this.props.onChange) {
      this.props.onChange(update);
    }
  }

  onSubmit(e, options = {}) {
    log('onSubmit');
    if (e) e.preventDefault();

    const { draft } = Object.assign({
      draft: false
    }, options);

    const query = draft ? { draft: true } : null;

    const values = this.get('values');

    const {
      clean,
      errors
    } = this.sanitize(values, { draft });

    if (_.keys(errors).length) {
      return this.set({ errors });
    }

    if (this.props.onSubmit) {
      const p = this.props.onSubmit({
        values,
        clean,
        files: this.get('files')
      });

      if ((p instanceof Promise) && (this.props.unloadWarning)) {
        p.then(() => {
          unloadWarning.unset();
        });
      } else if (this.props.unloadWarning) {
        unloadWarning.unset();
      }
      return;
    }

    this.set({
      loading: true
    });

    submit({
      res: _.get(this.props.res, 'post', ''),
      formSchema: this._getFormSchema(),
      values, // values can be clean anew once received by server
      files: this.get('files'),
      query
    }).then(res => {
      if (res.statusCode !== 200) {
        this.onServerError(res);
        return;
      }
      
      if (this.props.unloadWarning) {
        unloadWarning.unset();
      }

      if (this.props.onSubmitSuccess) {
        this.props.onSubmitSuccess(this.get('values'), res);
      } else {
        this.set({
          submitted: true,
          globalError: null,
          errors: [],
          loading: false
        });
      }

    }).catch(err => {
      console.log('form-schemas: there was an error during submit', err);
    });
  }

  onServerError(res) {
    console.log('evaluating server error', res.body);

    const errors = _.get(res, 'body.errors');

    if (Array.isArray(errors) && errors.length) {
      this.set({
        globalError: null,
        errors,
        loading: false
      });
    } else {
      this.onServerException(res);
    }
  }

  onServerException(res) {
    let globalErrorPath = 'state.labels.errors.serverException';

    if (res.statusCode === 413) {
      globalErrorPath = 'state.labels.errors.serverErrorTooLargeFile';
    }

    this.set({
      globalError: _.get(this, globalErrorPath).replace('%max%', this.props.maxFileSize || 22),
      loading: false
    });
  }

  getCurrentValues() {
    return this.get('values', {}) || {};
  }

  /**
   * onChange focuses on current field. Should impacted fields be considered too?
   * if so, values of impacted fields should also be given to function
   * 
   */
  getFieldErrors(field, value, relatedFields = [], currentValues = {}) {
    const values = {};

    values[field.field] = value;

    relatedFields.forEach(relatedField => {
      values[relatedField.field] = currentValues[relatedField.field];
    });

    const {
      clean,
      errors
    } = this.sanitize(values);

    const keepFields = relatedFields.map(f => f.field).concat(field.field);

    const fieldErrors = (errors || []).filter(e => keepFields.includes(e.field));

    log('getFieldErrors', { field, value, fieldErrors });

    return fieldErrors;
  }

  _getFormSchema() {
    // building the formSchema is a bit costly, so memoizition is useful here

    const hasChanged = !!['hash', 'lang'].filter(
      memoizeKey => _.get(this.memoized, memoizeKey, '') !== _.get(this.props, memoizeKey, '')
   ).length;

    if (hasChanged || !this.memoized) {
      this.memoized = {
        formSchema: new FormSchema(
          ih(this.props.schema, {
            defaultLabelLanguage: { $set: this.props.lang }
          })
       ),
        hash: _.get(this, 'props.hash', ''),
        lang: _.get(this, 'props.lang', '')
      }
    }

    return this.memoized.formSchema;
  }

  sanitize(values, options) {
    const formSchema = this._getFormSchema();
    try {
      // options may contain draft bool at true.
      const validate = formSchema.getValidate(options);
      const clean = validate(values);

      return { clean, errors: [] };
    } catch (errors) {
      if (!Array.isArray(errors)) {
        throw errors;
      }

      // simpler to always keep errors as arrays.
      return {
        clean: null,
        errors: errors.map(e => {
          const field = formSchema.getField(e.field);
          if (!field) {
            throw new Error('did not find field matching validation error', e);
          }

          return ih(e, {
            label: {
              $set: getErrorLabel(this.state.labels.errors, field, e)
            },
            fieldLabel: {
              $set: _.get(field.label, this.props.lang)
            }
          });
        })
      }
    }
  }

  onSubmitConfirm(e) {
    e.preventDefault();

    window.location.href = this.props.res.redirect;
  }

  onChange(fieldName, value, files) {
    log('onChange', fieldName, value, files);

    const formSchema = this._getFormSchema();
    const field = formSchema.getField(fieldName);
    const currentValues = this.getCurrentValues();

    const updateValues = {};

    updateValues[fieldName] = { $set: value };

    const relatedFields = formSchema
      .getRelatedFields(field);
    const relatedFieldNames = relatedFields.map(f => f.field);

    const updatedErrors = this.get('errors', [])
      .filter(e => !relatedFieldNames.concat(fieldName).includes(e.field)) // keep other errors
      .concat(this.getFieldErrors(field, value, relatedFields, currentValues));

    log('onChange updating errors', updatedErrors);

    const isFileField = formSchema.getFileFields().map(f => f.field).includes(fieldName);

    const currentFiles = this.get('files', {});

    const filesUpdate = {};

    if (isFileField && value) {
      filesUpdate[fieldName] = { $set: files };
    } else if (isFileField) {
      filesUpdate['$unset'] = [fieldName];
    }

    if (this.props.unloadWarning) {
      unloadWarning.set();
    }

    this.set({
      files: ih(currentFiles, filesUpdate),
      values: ih(currentValues, updateValues),
      errors: updatedErrors
    });
  }

  render() {
    const { lang, classNames, role } = this.props;

    const { submitted } = this.state;

    const values = this.get('values');
    const loading = this.get('loading');
    const errors = this.get('errors', []);

    log('rendering', { values, errors });

    const { clean: cleanValues } = this.sanitize(values, {
      draft: true
    });

    if (submitted) {
      return <div className="text-center">
        <div className="padding-all-sm">
          <span>{this.state.labels.main.confirmation}</span>
        </div>
        <button className="btn btn-primary" onClick={this.onSubmitConfirm}>{this.state.labels.main.done}</button>
      </div>
    }

    return <div className="oa-form">
      <div className={_.get(classNames, 'fieldsCanvas', '') }>
        {this._getFormSchema().getFields().filter(isFieldDisplayed.bind(null, role)).map((f, i) => {

          const flatLabels = flatten(formSchemaLabels, lang);

          return <Field
            disabled={loading}
            className={_.get(classNames, 'field', 'form-group') }
            customComponents={this.props.components}
            lang={this.props.lang}
            labels={this.state.labels.main}
            type={f.fieldType}
            key={'field' + i}
            field={f}
            value={_.get(values, f.field, null)}
            relatedValues={getRelatedFieldValues(f, cleanValues === null ? values : cleanValues)}
            error={errors.filter(e => e.field === f.field).shift()?.label}
            onChange={this.onChange.bind(this, f.field)}
          />

        })}
      </div>
      {this.renderGroupedErrors()}
      {this.renderBottomActions()}
    </div>

  }

  renderGroupedErrors() {
    const errors = this.get('errors', []);

    const globalError = this.get('globalError');

    if (!errors.length && !globalError) return null;

    const matching = _.first(_.get(this.props, 'errorComponents', []).filter(a => a.position === 'bottom'));

    if (matching) {
      const { Component } = matching;

      return <Component errors={errors} global={globalError} />
    }

    return <div className={_.get(this.props, 'classNames.bottomErrorsCanvas') || 'error-summary boxed padding-v-sm padding-h-sm margin-v-md'}>
      { errors.length ? <div>
        <div className="padding-bottom-sm">{this.state.labels.main.groupErrorHeader}:</div>
        <ul className="list-unstyled margin-left-xs">
        {errors.map((e, i) => <li key={'error-' + i}>
          <label>{e.fieldLabel}</label>:&nbsp;
          <span>{e.label}</span>
        </li>)}
        </ul>
      </div> : null }
      { globalError ? <div className="text-center padding-top-xs">
        <label>{globalError}</label>
      </div>: null }
    </div>
  }

  renderBottomActions() {
    const matching = _.first(_.get(this.props, 'actionComponents', []).filter(a => a.position === 'bottom'));

    const loading = this.get('loading');

    if (matching) {
      const { Component } = matching;

      return <Component onSubmit={this.onSubmit} loading={loading} sanitize={this.sanitize.bind(this)} />
    }

    return <div style={{position: 'relative'}} className={_.get(this.props, 'classNames.bottomActionsCanvas') || 'form-group'}>
      <button className={loading ? 'btn btn-default' : 'btn btn-primary' } type="submit" disabled={loading} onClick={this.onSubmit}>{this.state.labels.main.submit }</button>
      {loading && <span className="margin-left-sm"><Spinner mode="inline" /></span>}
    </div>
  }

}

FormSchemaComponent.defaultPropTypes = {
  withErrors: false,
  stateless: false, // component handles its own state by default
  onSubmit: null,
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
