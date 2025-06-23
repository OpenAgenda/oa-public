import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/Components/SelectField.js";
import "core-js/modules/es.array.iterator.js";
import "core-js/modules/web.dom-collections.iterator.js";
import _includesInstanceProperty from "@babel/runtime-corejs3/core-js/instance/includes";
import { useState, useCallback } from 'react';
import { ReactSelectInput } from '@openagenda/react-shared';
import classNames from 'classnames';
import labels from '@openagenda/labels/form-schemas/index.js';
import flattenLabels from '@openagenda/labels/flatten.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
const getSelectOptions = function (field) {
  let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  const {
    value
  } = opts;
  const {
    options
  } = field;
  return options.filter(o => {
    var _context, _context2;
    if (!o.display) {
      return false;
    }
    if (_includesInstanceProperty(_context = [undefined, null]).call(_context, value)) {
      return true;
    }
    return _includesInstanceProperty(_context2 = [].concat(value)).call(_context2, o.id);
  }).map(o => ({
    value: o.id,
    label: o.label,
    info: o.info
  }));
};
const getCurrentValue = _ref => {
  let {
    isFresh,
    field,
    value
  } = _ref;
  if (value) {
    return getSelectOptions(field, {
      value
    });
  }
  if (isFresh && field.default !== undefined) {
    return getSelectOptions(field, {
      value: field.default
    });
  }
};
const Option = props => {
  const {
    className,
    cx,
    getStyles,
    isDisabled,
    isFocused,
    isSelected,
    innerRef,
    innerProps,
    data
  } = props;
  const {
    label,
    info
  } = data;
  return /*#__PURE__*/_jsxDEV("div", _objectSpread(_objectSpread({
    style: getStyles('option', props),
    className: cx({
      option: true,
      'option--is-disabled': isDisabled,
      'option--is-focused': isFocused,
      'option--is-selected': isSelected
    }, className),
    ref: innerRef,
    "aria-disabled": isDisabled
  }, innerProps), {}, {
    children: [/*#__PURE__*/_jsxDEV("div", {
      children: label
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 70,
      columnNumber: 7
    }, this), info && /*#__PURE__*/_jsxDEV("div", {
      className: classNames({
        'text-muted': !isSelected
      }),
      children: info
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 72,
      columnNumber: 9
    }, this)]
  }), void 0, true, {
    fileName: _jsxFileName,
    lineNumber: 55,
    columnNumber: 5
  }, this);
};
export default function SelectField(props) {
  const {
    onChange: propsOnChange,
    field,
    value,
    lang,
    isMulti
  } = props;
  const [isFresh, setIsFresh] = useState(true);
  const onChange = useCallback(selected => {
    setIsFresh(false);
    if (selected === null) {
      propsOnChange(isMulti ? [] : undefined);
      return;
    }
    propsOnChange(isMulti ? selected.map(o => o.value) : selected.value);
  }, [propsOnChange, isMulti]);
  const {
    noOption,
    selectPlaceholder: defaultSelectPlaceholder
  } = flattenLabels(labels, lang);
  return /*#__PURE__*/_jsxDEV(ReactSelectInput, {
    value: getCurrentValue({
      isFresh,
      field,
      value
    }),
    options: getSelectOptions(field),
    onChange: onChange,
    isClearable: !isMulti && field.optional,
    noOptionsMessage: () => noOption,
    isMulti: isMulti,
    components: {
      Option
    },
    placeholder: field.placeholder || defaultSelectPlaceholder
  }, void 0, false, {
    fileName: _jsxFileName,
    lineNumber: 100,
    columnNumber: 5
  }, this);
}
//# sourceMappingURL=SelectField.js.map