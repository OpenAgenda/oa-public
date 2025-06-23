import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/Components/MarkdownField.js";
import ih from 'immutability-helper';
import { Component } from 'react';
import { fromMarkdownToHTML, fromHTMLToMarkdown } from '@openagenda/md';
import SlateField from './SlateField.js';
import HTMLSerializer from './HTMLSerializer.js';
import { fromBRToP, fromPToBR } from './breaksAndParagraphs.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
export default class MarkdownField extends Component {
  shouldComponentUpdate(nextProps, _nextState) {
    const {
      value
    } = this.props;
    return value !== nextProps.value;
  }
  onChange(value) {
    const {
      onChange
    } = this.props;
    onChange(fromHTMLToMarkdown(fromPToBR(HTMLSerializer.serialize(value))));
  }
  render() {
    const {
      value,
      field: {
        default: defaultValue
      }
    } = this.props;
    const appliedValue = value === null && defaultValue ? defaultValue : value;
    return /*#__PURE__*/_jsxDEV(SlateField, _objectSpread(_objectSpread({}, ih(this.props, {
      value: {
        $set: HTMLSerializer.deserialize(fromBRToP(fromMarkdownToHTML(appliedValue)))
      },
      onChange: {
        $set: this.onChange.bind(this)
      },
      raw: {
        $set: true
      }
    })), {}, {
      parentValue: appliedValue
    }), void 0, false, {
      fileName: _jsxFileName,
      lineNumber: 31,
      columnNumber: 7
    }, this);
  }
}
//# sourceMappingURL=MarkdownField.js.map