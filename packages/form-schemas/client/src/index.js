import _ from 'lodash';
import debug from 'debug';
import ih from 'immutability-helper';
import { Component } from 'react';
import { flushSync } from 'react-dom';
import classNames from 'classnames';

import formSchemaLabels from '@openagenda/labels/form-schemas';

import errorLabels from '@openagenda/labels/errors';
import flattenLabels from '@openagenda/labels/flatten';
import { Spinner, LeaveWarningPrompt } from '@openagenda/react-shared';

import FormSchema from './iso/FormSchema';
import getErrorLabel from './iso/getErrorLabel';

import submit from './lib/submit';
import getRelatedFieldValues from './lib/getRelatedFieldValues';
import isItemDisplayed from './lib/isItemDisplayed';
import Section from './Components/Section';
import Field from './Components/Field';

const log = debug('FormSchemaComponent');

export default class FormSchemaComponent extends Component {
  constructor(props) {
    super(props);

    const {
      lang,
      values,
      withErrors,
      labels,
      stateless,
    } = props;

    this.sanitize = this.sanitize.bind(this);
    this.onChange = this.onChange.bind(this);

    const init = {
      labels: {
        errors: flattenLabels(_.assign({}, errorLabels, _.get(labels, 'errors', {})), lang, true),
        main: flattenLabels(formSchemaLabels, lang, true),
      },
      defaultLabelLanguage: lang,
    };

    if (!stateless) {
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
    } = withErrors ? sanitized : { errors: [] };

    if (errors && !stateless) {
      this.state.errors = errors;
    } else if (errors && errors.length) {
      this.set({ errors });
    }
  }

  onSubmit(e, options = {}) {
    if (e) e.preventDefault();

    const {
      res,
      method,
      onSubmit,
      unloadWarning: enableUnloadWarning,
      onSubmitSuccess,
    } = this.props;

    const {
      draft = false,
    } = options;

    const query = draft ? { draft: true } : null;

    const values = this.get('values');

    const {
      clean,
      errors,
    } = this.sanitize(values, { draft });

    if (_.keys(errors).length) {
      log('%s errors at submission attempt', Object.keys(errors).length);
      return this.set({ errors });
    }

    if (onSubmit) {
      const p = onSubmit({
        values,
        clean,
        files: this.get('files'),
      });

      if ((p instanceof Promise) && enableUnloadWarning) {
        p.then(() => {
          flushSync(() => {
            this.setState({ unloadWarningEnabled: false });
          });
        });
      } else if (enableUnloadWarning) {
        flushSync(() => {
          this.setState({ unloadWarningEnabled: false });
        });
      }
      return;
    }

    this.set({
      loading: true,
    });

    submit({
      method,
      res: _.get(res, method, ''),
      formSchema: this._getFormSchema(),
      values, // values can be clean anew once received by server
      files: this.get('files'),
      query,
    }).then(response => {
      if (response.statusCode !== 200) {
        this.onServerError(response);
        return;
      }

      if (enableUnloadWarning) {
        flushSync(() => {
          this.setState({ unloadWarningEnabled: false });
        });
      }

      if (onSubmitSuccess) {
        onSubmitSuccess(this.get('values'), response);
      } else {
        this.set({
          submitted: true,
          globalError: null,
          errors: [],
          loading: false,
        });
      }
    }).catch(() => {
      // console.log('form-schemas: there was an error during submit', err);
    });
  }

  onServerError(res) {
    // console.log('evaluating server error', res.body);

    const errors = _.get(res, 'body.errors');

    if (Array.isArray(errors) && errors.length) {
      this.set({
        globalError: null,
        errors,
        loading: false,
      });
    } else {
      this.onServerException(res);
    }
  }

  onServerException(res) {
    const {
      maxFileSize,
    } = this.props;

    let globalErrorPath = 'state.labels.errors.serverException';

    if (res.statusCode === 413) {
      globalErrorPath = 'state.labels.errors.serverErrorTooLargeFile';
    }

    this.set({
      globalError: _.get(this, globalErrorPath).replace('%max%', maxFileSize || 22),
      loading: false,
    });
  }

  onSubmitConfirm(e) {
    const {
      res,
    } = this.props;
    e.preventDefault();

    window.location.href = res.redirect;
  }

  onChange(fieldName, value, files) {
    const {
      unloadWarning: enableUnloadWarning,
    } = this.props;

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
      filesUpdate.$unset = [fieldName];
    }

    if (enableUnloadWarning) {
      flushSync(() => {
        this.setState({ unloadWarningEnabled: true });
      });
    }

    this.set({
      files: ih(currentFiles, filesUpdate),
      values: ih(currentValues, updateValues),
      errors: updatedErrors,
    });
  }

  getFieldErrors(field, value, relatedFields = [], currentValues = {}) {
    const values = {};

    values[field.field] = value;

    relatedFields.forEach(relatedField => {
      values[relatedField.field] = currentValues[relatedField.field];
    });

    const {
      errors,
    } = this.sanitize(values);

    const keepFields = relatedFields.map(f => f.field).concat(field.field);

    const fieldErrors = (errors || []).filter(e => keepFields.includes(e.field));

    log('getFieldErrors', { field, value, fieldErrors });

    return fieldErrors;
  }

  getCurrentValues() {
    return this.get('values', {}) || {};
  }

  get(field, defaultValue = null) {
    const {
      stateless,
    } = this.props;
    return _.get(this, [stateless ? 'props' : 'state', field], defaultValue);
  }

  set(update) {
    const {
      stateless,
      onChange,
    } = this.props;
    log('update', update);
    if (!stateless) {
      this.setState(update);
    }

    if (onChange) {
      onChange(update);
    }
  }

  _getFormSchema() {
    const {
      schema,
      lang,
    } = this.props;
    // building the formSchema is a bit costly, so memoizition is useful here

    const hasChanged = !!['hash', 'lang'].filter(
      memoizeKey => _.get(this.memoized, memoizeKey, '') !== _.get(this.props, memoizeKey, ''),
    ).length;

    if (hasChanged || !this.memoized) {
      this.memoized = {
        formSchema: new FormSchema(
          ih(schema, {
            defaultLabelLanguage: { $set: lang },
          }),
        ),
        hash: _.get(this, 'props.hash', ''),
        lang: _.get(this, 'props.lang', ''),
      };
    }

    return this.memoized.formSchema;
  }

  sanitize(values, options) {
    const {
      lang,
    } = this.props;
    const {
      labels,
    } = this.state;
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
              $set: getErrorLabel(labels.errors, field, e),
            },
            fieldLabel: {
              $set: _.get(field.label, lang),
            },
          });
        }),
      };
    }
  }

  renderGroupedErrors() {
    const errors = this.get('errors', []);

    const globalError = this.get('globalError');

    if (!errors.length && !globalError) return null;

    const matching = _.first(_.get(this.props, 'errorComponents', []).filter(a => a.position === 'bottom'));

    if (matching) {
      const {
        Component: ErrorComponent,
      } = matching;

      return <ErrorComponent errors={errors} global={globalError} />;
    }

    const {
      labels,
    } = this.state;

    return (
      <div className={_.get(this.props, 'classNames.bottomErrorsCanvas') || 'error-summary boxed padding-v-sm padding-h-sm margin-v-md'}>
        { errors.length ? (
          <div>
            <div className="padding-bottom-sm">{labels.main.groupErrorHeader}:</div>
            <ul className="list-unstyled margin-left-xs">
              {errors.map(e => (
                <li key={`error-${e.field}-${e.lang ?? ''}-${e.code}`}>
                  <label htmlFor={e.code}>{e.fieldLabel}{e.lang ? ` (${e.lang.toUpperCase()})` : ''}</label>:&nbsp;
                  <span>{e.label}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null }
        {globalError ? (
          <div className="text-center padding-top-xs">
            <label htmlFor={globalError.code}>{globalError}</label>
          </div>
        ) : null}
      </div>
    );
  }

  renderBottomActions() {
    const {
      onCancel,
    } = this.props;
    const matching = _.first(_.get(this.props, 'actionComponents', []).filter(a => a.position === 'bottom'));

    const loading = this.get('loading');

    if (matching) {
      const { Component: BottomActionsComponent } = matching;

      return <BottomActionsComponent onSubmit={this.onSubmit} loading={loading} sanitize={this.sanitize} />;
    }

    const {
      labels,
    } = this.state;

    return (
      <div style={{ position: 'relative' }} className={_.get(this.props, 'classNames.bottomActionsCanvas') || 'form-group'}>
        {onCancel ? <button type="button" className="btn btn-default" onClick={() => onCancel()}>{labels.main.cancel}</button> : null}
        <div className={classNames('margin-top-sm', { 'pull-right': onCancel })}>
          {loading && <span className="margin-left-sm"><Spinner mode="inline" /></span>}
          <button className={loading ? 'btn btn-default' : 'btn btn-primary'} type="submit" disabled={loading} onClick={this.onSubmit}>{labels.main.submit}</button>
        </div>
      </div>
    );
  }

  renderUnloadWarning() {
    const {
      unloadWarning,
    } = this.props;

    if (!unloadWarning) {
      return null;
    }

    const warnBeforePageUnload = typeof unloadWarning === 'object' ? unloadWarning.page : true;
    const warnBeforeRouteTransition = typeof unloadWarning === 'object' ? unloadWarning.router : false;

    const {
      unloadWarningEnabled: enabled,
    } = this.state;

    return (
      <LeaveWarningPrompt
        enabled={enabled}
        warnBeforePageUnload={warnBeforePageUnload}
        warnBeforeRouteTransition={warnBeforeRouteTransition}
      />
    );
  }

  render() {
    const {
      lang,
      classNames: propsClassNames,
      components,
      role,
    } = this.props;

    const {
      labels,
      submitted,
    } = this.state;

    const values = this.get('values');
    const loading = this.get('loading');
    const errors = this.get('errors', []);

    log('rendering', { values, errors });

    const { clean: cleanValues } = this.sanitize(values, {
      draft: true,
    });

    if (submitted) {
      return (
        <div className="text-center">
          <div className="padding-all-sm">
            <span>{labels.main.confirmation}</span>
          </div>
          <button type="submit" className="btn btn-primary" onClick={this.onSubmitConfirm}>{labels.main.done}</button>
          {this.renderUnloadWarning()}
        </div>
      );
    }

    return (
      <div className="oa-form">
        <div className={_.get(propsClassNames, 'fieldsCanvas', '')}>
          {this._getFormSchema().getFields().filter(isItemDisplayed.bind(null, role)).map(f => {
            if (f.type === 'section') {
              return (
                <Section
                  lang={lang}
                  section={f}
                />
              );
            }

            return (
              <Field
                disabled={loading}
                className={_.get(propsClassNames, 'field', 'form-group')}
                customComponents={components}
                lang={lang}
                labels={labels.main}
                type={f.fieldType}
                key={`field${f.field}`}
                field={f}
                value={_.get(values, f.field, null)}
                relatedValues={getRelatedFieldValues(f, cleanValues === null ? values : cleanValues)}
                error={errors.filter(e => e.field === f.field).shift()?.label}
                onChange={(value, files) => this.onChange(f.field, value, files)}
              />
            );
          })}
        </div>
        {this.renderGroupedErrors()}
        {this.renderBottomActions()}
        {this.renderUnloadWarning()}
      </div>
    );
  }
}

FormSchemaComponent.defaultPropTypes = {
  withErrors: false,
  stateless: false, // component handles its own state by default
  onSubmit: null,
  onSubmitSuccess: null,
  method: 'post',
  res: {
    patch: '',
    post: '',
    redirect: null,
  },
  labels: {
    errors: {},
  },
  fileKey: null,
};
