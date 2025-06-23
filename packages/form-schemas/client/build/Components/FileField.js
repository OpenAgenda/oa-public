import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _get from "lodash/get.js";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/Components/FileField.js";
import Dropzone from '@openagenda/react-dropzone';
import { Component } from 'react';
import multilingualLabels from '@openagenda/labels/form-schemas/fileUpload.js';
import flattenLabels from '@openagenda/labels/flatten.js';
import extensionsToAccept from '../lib/extensionsToAccept.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
export default class FileField extends Component {
  constructor(props) {
    super(props);
    this.onRemove = this.onRemove.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.hasValue = this.hasValue.bind(this);
  }
  onRemove() {
    const {
      onChange
    } = this.props;
    onChange(null);
  }
  onDrop(acceptedFiles, _rejectedFiles) {
    const {
      onChange
    } = this.props;
    onChange({
      originalName: _get(acceptedFiles, '0.name')
    }, acceptedFiles);
  }
  hasValue() {
    return !!_get(this.props, 'value.originalName');
  }
  render() {
    const {
      field,
      lang,
      value
    } = this.props;
    const labels = flattenLabels(multilingualLabels, lang);
    const {
      field: name,
      // placeholder,
      extensions
      // store,
    } = field;
    return /*#__PURE__*/_jsxDEV("div", {
      className: "file-upload",
      children: [/*#__PURE__*/_jsxDEV(Dropzone, {
        disabled: field.enable === false,
        accept: extensionsToAccept(extensions),
        multiple: false,
        name: name,
        onDrop: this.onDrop,
        children: _ref => {
          let {
            getRootProps,
            getInputProps
          } = _ref;
          return /*#__PURE__*/_jsxDEV("div", _objectSpread(_objectSpread({
            className: "file-dropzone"
          }, getRootProps()), {}, {
            children: [/*#__PURE__*/_jsxDEV("input", _objectSpread({}, getInputProps()), void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 59,
              columnNumber: 15
            }, this), /*#__PURE__*/_jsxDEV("div", {
              className: "margin-top-lg margin-bottom-sm",
              children: [/*#__PURE__*/_jsxDEV("button", {
                type: "button",
                className: "btn btn-primary margin-top-sm",
                children: /*#__PURE__*/_jsxDEV("label", {
                  children: labels.upload
                }, void 0, false, {
                  fileName: _jsxFileName,
                  lineNumber: 62,
                  columnNumber: 19
                }, this)
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 61,
                columnNumber: 17
              }, this), this.hasValue() && /*#__PURE__*/_jsxDEV("div", {
                className: "margin-v-xs",
                children: /*#__PURE__*/_jsxDEV("label", {
                  className: "control-label",
                  children: [/*#__PURE__*/_jsxDEV("i", {
                    className: "fa fa-check margin-right-xs"
                  }, void 0, false, {
                    fileName: _jsxFileName,
                    lineNumber: 67,
                    columnNumber: 23
                  }, this), /*#__PURE__*/_jsxDEV("span", {
                    children: _get(this.props, 'value.originalName')
                  }, void 0, false, {
                    fileName: _jsxFileName,
                    lineNumber: 68,
                    columnNumber: 23
                  }, this)]
                }, void 0, true, {
                  fileName: _jsxFileName,
                  lineNumber: 66,
                  columnNumber: 21
                }, this)
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 65,
                columnNumber: 19
              }, this)]
            }, void 0, true, {
              fileName: _jsxFileName,
              lineNumber: 60,
              columnNumber: 15
            }, this), /*#__PURE__*/_jsxDEV("span", {
              className: "accepted-info",
              children: [labels.acceptedExtensions, ":\xA0 .", [].concat(extensions).join(', .')]
            }, void 0, true, {
              fileName: _jsxFileName,
              lineNumber: 73,
              columnNumber: 15
            }, this)]
          }), void 0, true, {
            fileName: _jsxFileName,
            lineNumber: 58,
            columnNumber: 13
          }, this);
        }
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 50,
        columnNumber: 9
      }, this), value ? /*#__PURE__*/_jsxDEV("button", {
        type: "button",
        onClick: this.onRemove,
        className: "btn btn-danger margin-left-xs remove-file",
        title: labels.remove,
        "aria-label": labels.remove,
        children: /*#__PURE__*/_jsxDEV("i", {
          className: "fa fa-trash"
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 88,
          columnNumber: 13
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 81,
        columnNumber: 11
      }, this) : null]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 49,
      columnNumber: 7
    }, this);
  }
}
//# sourceMappingURL=FileField.js.map