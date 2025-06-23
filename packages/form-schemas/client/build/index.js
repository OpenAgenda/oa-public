import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _pick from "lodash/pick.js";
import _first from "lodash/first.js";
import _keys from "lodash/keys.js";
import _get from "lodash/get.js";
import _assign from "lodash/assign.js";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/index.js";
import _Promise from "@babel/runtime-corejs3/core-js/promise";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/es.regexp.exec.js";
import "core-js/modules/es.string.replace.js";
import "core-js/modules/web.dom-collections.iterator.js";
import debug from 'debug';
import ih from 'immutability-helper';
import { Component } from 'react';
import { flushSync } from 'react-dom';
import classNames from 'classnames';
import formSchemaLabels from '@openagenda/labels/form-schemas/index.js';
import errorLabels from '@openagenda/labels/errors/index.js';
import flattenLabels from '@openagenda/labels/flatten.js';
import { Spinner, LeaveWarningPrompt } from '@openagenda/react-shared';
import FormSchema from './iso/FormSchema.js';
import getErrorLabel from './iso/getErrorLabel.js';
import submit from './lib/submit.js';
import isItemDisplayed from './lib/isItemDisplayed.js';
import Section from './Components/Section.js';
import Field from './Components/Field.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const log = debug('FormSchemaComponent');
export default class FormSchemaComponent extends Component {
  constructor(props) {
    super(props);
    const {
      lang,
      values,
      withErrors,
      labels,
      stateless
    } = props;
    this.sanitize = this.sanitize.bind(this);
    this.onChange = this.onChange.bind(this);
    const init = {
      labels: {
        errors: flattenLabels(_assign({}, errorLabels, _get(labels, 'errors', {})), lang, true),
        main: flattenLabels(formSchemaLabels, lang, true)
      },
      defaultLabelLanguage: lang
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
      errors
    } = withErrors ? sanitized : {
      errors: []
    };
    if (errors && !stateless) {
      this.state.errors = errors;
    } else if (errors && errors.length) {
      this.set({
        errors
      });
    }
  }
  onSubmit(e) {
    let options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    if (e) e.preventDefault();
    const {
      res,
      method,
      onSubmit,
      unloadWarning: enableUnloadWarning,
      onSubmitSuccess
    } = this.props;
    const {
      draft = undefined
    } = options;
    const values = this.get('values');
    const {
      clean,
      errors
    } = this.sanitize(values, {
      draft
    });
    if (_keys(errors).length) {
      log('%s errors at submission attempt', Object.keys(errors).length);
      return this.set({
        errors
      });
    }
    if (onSubmit) {
      const p = onSubmit({
        values: draft !== undefined ? _objectSpread(_objectSpread({}, values), {}, {
          draft
        }) : values,
        clean,
        files: this.get('files')
      });
      if (p instanceof _Promise && enableUnloadWarning) {
        p.then(() => {
          flushSync(() => {
            this.setState({
              unloadWarningEnabled: false
            });
          });
        });
      } else if (enableUnloadWarning) {
        flushSync(() => {
          this.setState({
            unloadWarningEnabled: false
          });
        });
      }
      return;
    }
    this.set({
      loading: true
    });
    submit({
      method,
      res: _get(res, method, ''),
      formSchema: this._getFormSchema(),
      values: draft !== undefined ? _objectSpread(_objectSpread({}, values), {}, {
        draft
      }) : values,
      // values can be clean anew once received by server
      files: this.get('files')
    }).then(response => {
      if (response.statusCode !== 200) {
        this.onServerError(response);
        return;
      }
      if (enableUnloadWarning) {
        flushSync(() => {
          this.setState({
            unloadWarningEnabled: false
          });
        });
      }
      if (onSubmitSuccess) {
        onSubmitSuccess(this.get('values'), response);
      } else {
        this.set({
          submitted: true,
          globalError: null,
          errors: [],
          loading: false
        });
      }
    }).catch(errorResponse => this.onServerError(errorResponse));
  }
  onServerError(res) {
    const errors = _get(res, 'body.errors');
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
    const {
      maxFileSize
    } = this.props;
    let globalErrorPath = 'state.labels.errors.serverException';
    if (res.statusCode === 413) {
      globalErrorPath = 'state.labels.errors.serverErrorTooLargeFile';
    }
    this.set({
      globalError: _get(this, globalErrorPath).replace('%max%', maxFileSize || 22),
      loading: false
    });
  }
  onSubmitConfirm(e) {
    const {
      res
    } = this.props;
    e.preventDefault();
    window.location.href = res.redirect;
  }
  onChange(fieldName, value, files) {
    var _context2;
    const {
      unloadWarning: enableUnloadWarning
    } = this.props;
    log('onChange', fieldName, value, files);
    const formSchema = this._getFormSchema();
    const field = formSchema.getField(fieldName);
    const currentValues = this.getCurrentValues();
    const updateValues = {};
    updateValues[fieldName] = {
      $set: value
    };
    const relatedFields = formSchema.getRelatedFields(field);
    const relatedFieldNames = relatedFields.map(f => f.field);
    const updatedErrors = this.get('errors', []).filter(e => {
      var _context;
      return !_includesInstanceProperty(_context = relatedFieldNames.concat(fieldName)).call(_context, e.field);
    }) // keep other errors
    .concat(this.getFieldErrors(field, value, relatedFields, currentValues));
    log('onChange updating errors', updatedErrors);
    const isFileField = _includesInstanceProperty(_context2 = formSchema.getFileFields().map(f => f.field)).call(_context2, fieldName);
    const currentFiles = this.get('files', {});
    const filesUpdate = {};
    if (isFileField && value) {
      filesUpdate[fieldName] = {
        $set: files
      };
    } else if (isFileField) {
      filesUpdate.$unset = [fieldName];
    }
    if (enableUnloadWarning) {
      flushSync(() => {
        this.setState({
          unloadWarningEnabled: true
        });
      });
    }
    this.set({
      files: ih(currentFiles, filesUpdate),
      values: ih(currentValues, updateValues),
      errors: updatedErrors
    });
  }
  getFieldErrors(field, value) {
    let relatedFields = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
    let currentValues = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
    const values = {};
    values[field.field] = value;
    relatedFields.forEach(relatedField => {
      values[relatedField.field] = currentValues[relatedField.field];
    });
    const {
      errors
    } = this.sanitize(values);
    const keepFields = relatedFields.map(f => f.field).concat(field.field);
    const fieldErrors = (errors || []).filter(e => _includesInstanceProperty(keepFields).call(keepFields, e.field));
    log('getFieldErrors', {
      field,
      value,
      fieldErrors
    });
    return fieldErrors;
  }
  getCurrentValues() {
    return this.get('values', {}) || {};
  }
  get(field) {
    let defaultValue = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    const {
      stateless
    } = this.props;
    return _get(this, [stateless ? 'props' : 'state', field], defaultValue);
  }
  set(update) {
    const {
      stateless,
      onChange
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
      lang
    } = this.props;
    // building the formSchema is a bit costly, so memoizition is useful here

    const hasChanged = !!['hash', 'lang'].filter(memoizeKey => _get(this.memoized, memoizeKey, '') !== _get(this.props, memoizeKey, '')).length;
    if (hasChanged || !this.memoized) {
      this.memoized = {
        formSchema: new FormSchema(ih(schema, {
          defaultLabelLanguage: {
            $set: lang
          }
        })),
        hash: _get(this, 'props.hash', ''),
        lang: _get(this, 'props.lang', '')
      };
    }
    return this.memoized.formSchema;
  }
  sanitize(values, options) {
    const {
      lang
    } = this.props;
    const {
      labels
    } = this.state;
    const formSchema = this._getFormSchema();
    try {
      // options may contain draft bool at true.
      const validate = formSchema.getValidate(options);
      const clean = validate(values);
      return {
        clean,
        errors: []
      };
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
              $set: getErrorLabel(labels.errors, field, e)
            },
            fieldLabel: {
              $set: _get(field.label, lang)
            }
          });
        })
      };
    }
  }
  renderGroupedErrors() {
    const errors = this.get('errors', []);
    const globalError = this.get('globalError');
    if (!errors.length && !globalError) return null;
    const matching = _first(_get(this.props, 'errorComponents', []).filter(a => a.position === 'bottom'));
    if (matching) {
      const {
        Component: ErrorComponent
      } = matching;
      return /*#__PURE__*/_jsxDEV(ErrorComponent, {
        errors: errors,
        global: globalError
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 356,
        columnNumber: 14
      }, this);
    }
    const {
      labels
    } = this.state;
    return /*#__PURE__*/_jsxDEV("div", {
      className: _get(this.props, 'classNames.bottomErrorsCanvas') || 'error-summary boxed padding-v-sm padding-h-sm margin-v-md',
      children: [errors.length ? /*#__PURE__*/_jsxDEV("div", {
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "padding-bottom-sm",
          children: [labels.main.groupErrorHeader, ":"]
        }, void 0, true, {
          fileName: _jsxFileName,
          lineNumber: 370,
          columnNumber: 13
        }, this), /*#__PURE__*/_jsxDEV("ul", {
          className: "list-unstyled margin-left-xs",
          children: errors.map(e => {
            var _e$lang;
            return /*#__PURE__*/_jsxDEV("li", {
              children: [/*#__PURE__*/_jsxDEV("label", {
                htmlFor: e.code,
                children: [e.fieldLabel, e.lang ? " (".concat(e.lang.toUpperCase(), ")") : '']
              }, void 0, true, {
                fileName: _jsxFileName,
                lineNumber: 376,
                columnNumber: 19
              }, this), ":\xA0", /*#__PURE__*/_jsxDEV("span", {
                children: e.label
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 381,
                columnNumber: 19
              }, this)]
            }, "error-".concat(e.field, "-").concat((_e$lang = e.lang) !== null && _e$lang !== void 0 ? _e$lang : '', "-").concat(e.code), true, {
              fileName: _jsxFileName,
              lineNumber: 375,
              columnNumber: 17
            }, this);
          })
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 373,
          columnNumber: 13
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 369,
        columnNumber: 11
      }, this) : null, globalError ? /*#__PURE__*/_jsxDEV("div", {
        className: "text-center padding-top-xs",
        children: /*#__PURE__*/_jsxDEV("label", {
          htmlFor: globalError.code,
          children: globalError
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 389,
          columnNumber: 13
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 388,
        columnNumber: 11
      }, this) : null]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 362,
      columnNumber: 7
    }, this);
  }
  renderBottomActions() {
    const {
      onCancel
    } = this.props;
    const matching = _first(_get(this.props, 'actionComponents', []).filter(a => a.position === 'bottom'));
    const loading = this.get('loading');
    if (matching) {
      const {
        Component: BottomActionsComponent
      } = matching;
      return /*#__PURE__*/_jsxDEV(BottomActionsComponent, {
        onSubmit: this.onSubmit,
        loading: loading,
        sanitize: this.sanitize
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 410,
        columnNumber: 9
      }, this);
    }
    const {
      labels
    } = this.state;
    return /*#__PURE__*/_jsxDEV("div", {
      style: {
        position: 'relative'
      },
      className: _get(this.props, 'classNames.bottomActionsCanvas') || 'form-group',
      children: [onCancel ? /*#__PURE__*/_jsxDEV("button", {
        type: "button",
        className: "btn btn-default",
        onClick: () => onCancel(),
        children: labels.main.cancel
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 428,
        columnNumber: 11
      }, this) : null, /*#__PURE__*/_jsxDEV("div", {
        className: classNames('margin-top-sm', {
          'pull-right': onCancel
        }),
        children: [loading && /*#__PURE__*/_jsxDEV("span", {
          className: "margin-left-sm",
          children: /*#__PURE__*/_jsxDEV(Spinner, {
            mode: "inline"
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 441,
            columnNumber: 15
          }, this)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 440,
          columnNumber: 13
        }, this), /*#__PURE__*/_jsxDEV("button", {
          className: loading ? 'btn btn-default' : 'btn btn-primary',
          type: "submit",
          disabled: loading,
          onClick: this.onSubmit,
          children: labels.main.submit
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 444,
          columnNumber: 11
        }, this)]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 436,
        columnNumber: 9
      }, this)]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 421,
      columnNumber: 7
    }, this);
  }
  renderUnloadWarning() {
    const {
      unloadWarning
    } = this.props;
    if (!unloadWarning) {
      return null;
    }
    const warnBeforePageUnload = typeof unloadWarning === 'object' ? unloadWarning.page : true;
    const warnBeforeRouteTransition = typeof unloadWarning === 'object' ? unloadWarning.router : false;
    const {
      unloadWarningEnabled: enabled
    } = this.state;
    return /*#__PURE__*/_jsxDEV(LeaveWarningPrompt, {
      enabled: enabled,
      warnBeforePageUnload: warnBeforePageUnload,
      warnBeforeRouteTransition: warnBeforeRouteTransition
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 470,
      columnNumber: 7
    }, this);
  }
  render() {
    const {
      lang,
      classNames: propsClassNames,
      components,
      role
    } = this.props;
    const {
      labels,
      submitted
    } = this.state;
    const values = this.get('values');
    const loading = this.get('loading');
    const errors = this.get('errors', []);
    log('rendering', {
      values,
      errors
    });
    const {
      clean: cleanValues
    } = this.sanitize(values, {
      draft: true
    });
    if (submitted) {
      return /*#__PURE__*/_jsxDEV("div", {
        className: "text-center",
        children: [/*#__PURE__*/_jsxDEV("div", {
          className: "padding-all-sm",
          children: /*#__PURE__*/_jsxDEV("span", {
            children: labels.main.confirmation
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 497,
            columnNumber: 13
          }, this)
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 496,
          columnNumber: 11
        }, this), /*#__PURE__*/_jsxDEV("button", {
          type: "submit",
          className: "btn btn-primary",
          onClick: this.onSubmitConfirm,
          children: labels.main.done
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 499,
          columnNumber: 11
        }, this), this.renderUnloadWarning()]
      }, void 0, true, {
        fileName: _jsxFileName,
        lineNumber: 495,
        columnNumber: 9
      }, this);
    }
    const formSchema = this._getFormSchema();
    return /*#__PURE__*/_jsxDEV("div", {
      className: "oa-form",
      children: [/*#__PURE__*/_jsxDEV("div", {
        className: _get(propsClassNames, 'fieldsCanvas', ''),
        children: formSchema.getFields().filter(isItemDisplayed.bind(null, role)).map(f => {
          var _errors$filter$shift;
          if (f.type === 'section') {
            return /*#__PURE__*/_jsxDEV(Section, {
              lang: lang,
              section: f
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 521,
              columnNumber: 24
            }, this);
          }
          return /*#__PURE__*/_jsxDEV(Field, {
            disabled: loading,
            className: _get(propsClassNames, 'field', 'form-group'),
            customComponents: components,
            lang: lang,
            labels: labels.main,
            type: f.fieldType,
            field: f,
            value: _get(values, f.field, null),
            relatedValues: _pick(cleanValues === null ? values : cleanValues, formSchema.getRelatedFields(f).map(rf => rf.field)),
            error: (_errors$filter$shift = errors.filter(e => e.field === f.field).shift()) === null || _errors$filter$shift === void 0 ? void 0 : _errors$filter$shift.label,
            onChange: (value, files) => this.onChange(f.field, value, files),
            role: role
          }, "field".concat(f.field), false, {
            fileName: _jsxFileName,
            lineNumber: 525,
            columnNumber: 17
          }, this);
        })
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 515,
        columnNumber: 9
      }, this), this.renderGroupedErrors(), this.renderBottomActions(), this.renderUnloadWarning()]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 514,
      columnNumber: 7
    }, this);
  }
}
//# sourceMappingURL=index.js.map