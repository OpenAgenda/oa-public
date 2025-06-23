import _objectSpread from "@babel/runtime-corejs3/helpers/objectSpread2";
import _get from "lodash/get.js";
var _jsxFileName = "/home/kaore/Dev/lib/oa/packages/form-schemas/client/src/Components/ImageField.js";
import _URL from "@babel/runtime-corejs3/core-js/url";
import Dropzone from '@openagenda/react-dropzone';
import { Component } from 'react';
import multilingualLabels from '@openagenda/labels/form-schemas/imageUpload.js';
import flattenLabels from '@openagenda/labels/flatten.js';
import storePaths from '../lib/storePaths.js';
import extensionsToAccept from '../lib/extensionsToAccept.js';
import { jsxDEV as _jsxDEV } from "react/jsx-dev-runtime";
export default class ImageField extends Component {
  constructor(props) {
    super(props);
    const {
      field: {
        store
      }
    } = this.props;
    const filename = _get(this.props, 'value.filename');
    this.state = {
      preview: filename ? [storePaths(store), filename].join('/') : null
    };
    this.onDrop = this.onDrop.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }
  onRemove() {
    const {
      onChange
    } = this.props;
    this.setState({
      preview: null
    });
    onChange(null);
  }
  onDrop(acceptedFiles) {
    const {
      onChange
    } = this.props;
    const files = acceptedFiles.map(file => Object.assign(file, {
      preview: _URL.createObjectURL(file)
    }));
    this.setState({
      preview: _get(files, '0.preview')
    });
    onChange({
      originalName: _get(files, '0.name')
    }, files);
  }
  render() {
    const {
      lang,
      field,
      value
    } = this.props;
    const labels = flattenLabels(multilingualLabels, lang, true);
    const {
      field: name,
      extensions
    } = field;
    const {
      preview
    } = this.state;
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
            className: preview ? 'file-dropzone image-preview' : 'file-dropzone'
          }, getRootProps()), {}, {
            children: [/*#__PURE__*/_jsxDEV("input", _objectSpread({}, getInputProps()), void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 84,
              columnNumber: 15
            }, this), preview && /*#__PURE__*/_jsxDEV("div", {
              className: "center-button margin-bottom-sm",
              children: /*#__PURE__*/_jsxDEV("button", {
                type: "button",
                className: "btn btn-primary margin-all-sm",
                children: labels.update
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 87,
                columnNumber: 19
              }, this)
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 86,
              columnNumber: 17
            }, this), preview && /*#__PURE__*/_jsxDEV("img", {
              alt: "",
              className: "padding-all-sm",
              src: preview
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 96,
              columnNumber: 17
            }, this), !preview && /*#__PURE__*/_jsxDEV("div", {
              className: "center-button margin-bottom-sm",
              children: /*#__PURE__*/_jsxDEV("button", {
                type: "button",
                className: "btn btn-primary",
                children: labels.upload
              }, void 0, false, {
                fileName: _jsxFileName,
                lineNumber: 100,
                columnNumber: 19
              }, this)
            }, void 0, false, {
              fileName: _jsxFileName,
              lineNumber: 99,
              columnNumber: 17
            }, this), /*#__PURE__*/_jsxDEV("span", {
              className: "accepted-image-info",
              children: [labels.acceptedExtensions, ":\xA0 .", [].concat(extensions).join(', .')]
            }, void 0, true, {
              fileName: _jsxFileName,
              lineNumber: 105,
              columnNumber: 15
            }, this)]
          }), void 0, true, {
            fileName: _jsxFileName,
            lineNumber: 78,
            columnNumber: 13
          }, this);
        }
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 70,
        columnNumber: 9
      }, this), value ? /*#__PURE__*/_jsxDEV("button", {
        type: "button",
        onClick: this.onRemove,
        className: "btn btn-danger margin-all-sm remove-file",
        title: labels.remove,
        "aria-label": labels.remove,
        children: /*#__PURE__*/_jsxDEV("i", {
          className: "fa fa-trash"
        }, void 0, false, {
          fileName: _jsxFileName,
          lineNumber: 120,
          columnNumber: 13
        }, this)
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 113,
        columnNumber: 11
      }, this) : null]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 69,
      columnNumber: 7
    }, this);
  }
}
//# sourceMappingURL=ImageField.js.map