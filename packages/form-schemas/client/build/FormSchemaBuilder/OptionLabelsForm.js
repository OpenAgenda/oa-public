import _keys from "lodash/keys.js";
import _isString from "lodash/isString.js";
import _get from "lodash/get.js";
import _first from "lodash/first.js";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/FormSchemaBuilder/OptionLabelsForm.js";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/web.dom-collections.iterator.js";
import { Component } from 'react';
import makeLabelGetter from '@openagenda/labels/makeLabelGetter.js';
import FormSchemaComponent from '../index.js';
import slugFromLabel from './lib/slugFromLabel.js';
import labels from './lib/labels.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const focusOnFirstInput = () => {
  try {
    document.querySelector('.js_add_option_input textarea').focus();
  } catch (e) {
    console.log(e);
  }
};
const getLabel = makeLabelGetter(labels);
export default class OptionAdd extends Component {
  constructor(props) {
    super(props);
    this.state = {
      option: this.isEdit() ? {
        label: props.option.label
      } : {},
      error: null
    };
  }
  onChange(_ref) {
    let {
      values,
      errors
    } = _ref;
    this.setState({
      option: values,
      error: errors.length ? this.getErrorLabel(_first(errors).code) : null
    });
  }
  onSubmit() {
    const {
      error
    } = this.state;
    const {
      lang,
      otherOptions,
      onSubmit,
      index
    } = this.props;
    if (error) return;
    const optionLabel = _get(this, 'state.option.label');
    const isEmpty = !optionLabel || (_isString(optionLabel) ? !optionLabel.length : _keys(optionLabel).filter(k => _isString(optionLabel[k]) && optionLabel[k].length).length !== _keys(optionLabel).length);

    // add option must be unique
    const option = isEmpty ? null : {
      value: slugFromLabel(optionLabel, lang),
      label: optionLabel
    };
    if (isEmpty) {
      this.setState({
        error: this.getErrorLabel('optionEmpty')
      });
    } else if (otherOptions.filter(o => o.value === option.value).length) {
      this.setState({
        error: this.getErrorLabel('optionDuplicate')
      });
    } else {
      onSubmit(index, option);
      this.setState({
        option: null,
        error: null
      });
      focusOnFirstInput();
    }
  }
  getErrorLabel(errorCode) {
    const {
      lang
    } = this.props;
    if (labels["".concat(errorCode, "Error")]) {
      return getLabel("".concat(errorCode, "Error"), lang);
    }
    return errorCode;
  }
  isEdit() {
    const {
      option
    } = this.props;
    return !!option;
  }
  render() {
    const {
      languages,
      lang,
      onCancel
    } = this.props;
    const {
      error,
      option
    } = this.state;
    return /*#__PURE__*/_jsxDEV(FormSchemaComponent, {
      stateless: true,
      onChange: _ref2 => {
        let {
          values,
          errors
        } = _ref2;
        return this.onChange({
          values,
          errors
        });
      },
      globalError: error,
      values: option,
      lang: this.lang,
      schema: {
        fields: [{
          label: this.isEdit() ? labels.optionEdit : labels.optionAdd,
          field: 'label',
          fieldType: 'text',
          languages
        }]
      },
      classNames: {
        field: 'js_add_option_input',
        bottomErrorsCanvas: 'error margin-bottom-sm'
      },
      actionComponents: [{
        position: 'bottom',
        Component: () => /*#__PURE__*/_jsxDEV("div", {
          children: [/*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: "btn btn-primary",
            onClick: () => this.onSubmit(),
            children: getLabel(this.isEdit() ? 'optionUpdateAction' : 'optionAddAction', lang)
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 130,
            columnNumber: 17
          }, this), onCancel ? /*#__PURE__*/_jsxDEV("button", {
            type: "button",
            className: "btn btn-default pull-right",
            onClick: () => onCancel(),
            children: getLabel('optionEditCancel', lang)
          }, void 0, false, {
            fileName: _jsxFileName,
            lineNumber: 141,
            columnNumber: 19
          }, this) : null]
        }, void 0, true, {
          fileName: _jsxFileName,
          lineNumber: 129,
          columnNumber: 15
        }, this)
      }]
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 105,
      columnNumber: 7
    }, this);
  }
}
//# sourceMappingURL=OptionLabelsForm.js.map