var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/Components/FieldCounter.js";
import { Component } from 'react';
import classNames from 'classnames';
import isArray from 'lodash/isArray.js';
import isObject from 'lodash/isObject.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
export default class FieldCounter extends Component {
  remaining() {
    const {
      value: propValue,
      max
    } = this.props;
    const value = isArray(propValue) && !isObject(propValue[0]) ? propValue.join('') : propValue;
    if (!value) return max;
    return max - value.length;
  }
  render() {
    const remaining = this.remaining();
    return /*#__PURE__*/_jsxDEV("div", {
      className: classNames({
        'field-counter': true,
        error: remaining < 0
      }),
      children: remaining
    }, void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 22,
      columnNumber: 7
    }, this);
  }
}
//# sourceMappingURL=FieldCounter.js.map