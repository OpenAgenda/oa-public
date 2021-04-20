import _extends from "@babel/runtime-corejs3/helpers/extends";
import _objectWithoutProperties from "@babel/runtime-corejs3/helpers/objectWithoutProperties";
import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
var _jsxFileName = "/home/clement/Project/oa/packages/react-shared/src/components/ReactSelectInput.js";
import React, { useMemo } from 'react';
import CreatableSelect from 'react-select/creatable';
import ReactSelect from 'react-select';
import { jsx as ___EmotionJSX } from "@emotion/core";
var BLUE = '#41acdd';
var WHITE = '#fff';
var GRAY = '#ccc';
var LIGHTGRAY = '#f8f8f8';
var BLACK = '#333';
var defaultStyles = {
  clearIndicator: function clearIndicator(provided) {
    return _objectSpread(_objectSpread({}, provided), {}, {
      padding: '5px',
      cursor: 'pointer'
    });
  },
  control: function control(provided, _ref) {
    var isFocused = _ref.isFocused;
    return _objectSpread(_objectSpread(_objectSpread({}, provided), {}, {
      minHeight: '35px',
      borderColor: GRAY
    }, isFocused ? {
      borderColor: '#66afe9',
      outline: '0',
      WebkitBoxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6)',
      boxShadow: 'inset 0 1px 1px rgba(0, 0, 0, 0.075), 0 0 8px rgba(102, 175, 233, 0.6)'
    } : {}), {}, {
      '&:hover': {
        borderColor: isFocused ? '#66afe9' : GRAY
      }
    });
  },
  dropdownIndicator: function dropdownIndicator(provided) {
    return _objectSpread(_objectSpread({}, provided), {}, {
      padding: '5px',
      cursor: 'pointer'
    });
  },
  indicatorsContainer: function indicatorsContainer(base, state) {
    var _state$selectProps$op;

    return state.selectProps.isCreatable && !((_state$selectProps$op = state.selectProps.options) === null || _state$selectProps$op === void 0 ? void 0 : _state$selectProps$op.length) ? {
      display: 'none'
    } : base;
  },
  menu: function menu(base, state) {
    var _state$selectProps$op2;

    return state.selectProps.isCreatable && !((_state$selectProps$op2 = state.selectProps.options) === null || _state$selectProps$op2 === void 0 ? void 0 : _state$selectProps$op2.length) ? {
      display: 'none'
    } : base;
  },
  multiValue: function multiValue(provided) {
    return _objectSpread(_objectSpread({}, provided), {}, {
      margin: '1px',
      padding: '0px',
      borderRadius: '2px',
      overflow: 'hidden'
    });
  },
  multiValueLabel: function multiValueLabel(provided) {
    return _objectSpread(_objectSpread({}, provided), {}, {
      fontSize: '100%',
      padding: '3px',
      paddingLeft: '5px',
      paddingRight: '0',
      backgroundColor: BLUE,
      color: WHITE,
      borderRadius: '0'
    });
  },
  multiValueRemove: function multiValueRemove(provided) {
    return _objectSpread(_objectSpread({}, provided), {}, {
      cursor: 'pointer',
      backgroundColor: BLUE,
      color: WHITE,
      borderRadius: '0',
      '&:hover': {
        backgroundColor: BLUE,
        color: WHITE
      }
    });
  },
  option: function option(provided, state) {
    var backgroundColor = WHITE;

    if (state.isSelected) {
      backgroundColor = BLUE;
    } else if (state.isFocused) {
      backgroundColor = LIGHTGRAY;
    }

    return _objectSpread(_objectSpread({}, provided), {}, {
      color: state.isSelected ? WHITE : BLACK,
      backgroundColor: backgroundColor
    });
  },
  valueContainer: function valueContainer(provided) {
    return _objectSpread(_objectSpread({}, provided), {}, {
      padding: '2px 4px'
    });
  }
};

function ReactSelectField(_ref2) {
  var innerRef = _ref2.innerRef,
      isCreatable = _ref2.isCreatable,
      input = _ref2.input,
      meta = _ref2.meta,
      stylesProp = _ref2.styles,
      rest = _objectWithoutProperties(_ref2, ["innerRef", "isCreatable", "input", "meta", "styles"]);

  var SelectComponent = isCreatable ? CreatableSelect : ReactSelect;
  var styles = useMemo(function () {
    return _objectSpread(_objectSpread({}, defaultStyles), stylesProp);
  }, [stylesProp]);
  return ___EmotionJSX(React.Fragment, null, ___EmotionJSX(SelectComponent, _extends({
    ref: innerRef
  }, input, {
    isCreatable: isCreatable,
    isClearable: !isCreatable,
    styles: styles
  }, rest, {
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 117,
      columnNumber: 7
    }
  })), !(meta === null || meta === void 0 ? void 0 : meta.dirtySinceLastSubmit) && (meta === null || meta === void 0 ? void 0 : meta.submitError) ? ___EmotionJSX("div", {
    className: "margin-top-xs margin-bottom-sm text-danger",
    __self: this,
    __source: {
      fileName: _jsxFileName,
      lineNumber: 127,
      columnNumber: 9
    }
  }, meta.submitError) : null);
}

ReactSelectField.defaultStyles = defaultStyles;
export default ReactSelectField;
//# sourceMappingURL=ReactSelectInput.js.map