"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
var _interopRequireWildcard = require("@babel/runtime-corejs3/helpers/interopRequireWildcard").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
var _trim = _interopRequireDefault(require("@babel/runtime-corejs3/core-js/instance/trim"));
require("core-js/modules/es.regexp.constructor.js");
require("core-js/modules/es.regexp.exec.js");
var _defineProperty2 = _interopRequireDefault(require("@babel/runtime-corejs3/helpers/defineProperty"));
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _utils = _interopRequireDefault(require("@openagenda/utils"));
var _uniqueLoad = _interopRequireDefault(require("../lib/uniqueLoad"));
var _jsxDevRuntime = require("react/jsx-dev-runtime");
var _jsxFileName = "/home/clement/Project/oa/packages/react-form-components/components/HTMLComponent.jsx";
class HTMLComponent extends _react.Component {
  constructor(props) {
    super(props);
    _utils.default.extend(this, {
      loadTinyMce: this.loadTinyMce.bind(this),
      initializeTinyMceEditor: this.initializeTinyMceEditor.bind(this),
      updateTinyMceEditor: this.updateTinyMceEditor.bind(this)
    });
    this.state = {
      tinyMceReady: typeof tinymce !== 'undefined',
      editorId: null,
      uniqueClassName: this.props.uniqueClassName || 'js_' + generateUniqueIdentifier()
    };
    if (!this.state.tinyMceReady && typeof document !== 'undefined') this.loadTinyMce();
  }
  componentWillUnmount() {
    if (!this.state.editorId) return console.log('not loaded');
    tinymce.get(this.state.editorId).remove();
  }
  render() {
    if (!this.state.tinyMceReady) return null;
    if (!this.state.editorId) {
      setTimeout(this.initializeTinyMceEditor);
    } else {
      setTimeout(this.updateTinyMceEditor);
    }
    const {
      className,
      placeholder,
      label,
      value
    } = this.props;
    return /*#__PURE__*/(0, _jsxDevRuntime.jsxDEV)("div", {
      className: className,
      children: [label && /*#__PURE__*/(0, _jsxDevRuntime.jsxDEV)("label", {
        children: label
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 71,
        columnNumber: 19
      }, this), /*#__PURE__*/(0, _jsxDevRuntime.jsxDEV)("textarea", {
        placeholder: placeholder,
        className: this.state.uniqueClassName,
        value: value || '',
        style: {
          minHeight: '200px',
          visibility: 'hidden'
        },
        onChange: () => {}
      }, void 0, false, {
        fileName: _jsxFileName,
        lineNumber: 72,
        columnNumber: 9
      }, this)]
    }, void 0, true, {
      fileName: _jsxFileName,
      lineNumber: 70,
      columnNumber: 7
    }, this);
  }
  updateTinyMceEditor() {
    const editor = tinymce.get(this.state.editorId);
    if (!editor) return;
    if (this.state.html !== this.props.value) {
      // value in editor has diverged from value given in props. Needs to be updated
      tinymce.get(this.state.editorId).setContent(this.props.value || '');
    }
  }
  initializeTinyMceEditor() {
    tinymce.init({
      selector: '.' + this.state.uniqueClassName,
      language: this.props.lang == 'fr' ? 'fr_FR' : 'en_EN',
      menubar: false,
      plugins: 'autolink link lists print preview autoresize paste placeholder',
      toolbar: 'formatselect bold italic bullist link',
      statusbar: false,
      browser_spellcheck: true,
      block_formats: 'Paragraph=p;Header 2=h2;Header 3=h3;',
      autoresize_min_height: 100,
      // https://www.tinymce.com/docs/plugins/link/#link_title
      link_title: false,
      target_list: false,
      default_link_target: '_blank',
      link_assume_external_targets: false,
      // pasted iframe are not converted in editor
      invalid_elements: 'iframe',
      setup: editor => {
        this.setState({
          editorId: editor.id,
          html: this.props.value
        });
        makeUrlConverter(editor);
        editor.on('change', e => {
          const html = e.target.getContent();
          this.setState({
            html
          });
          this.props.onChange(html);
        });
      },
      paste_postprocess: (pl, o) => {
        // paste from word-type processors insert a mess of tags
        // in the html; these must be cleaned
        o.node = cleanNode(o.node);
      }
    });
  }
  loadTinyMce() {
    (0, _uniqueLoad.default)(this.props.tinyMceUrl, (err, script) => {
      this.setState({
        tinyMceReady: true
      });
    });
  }
}
exports.default = HTMLComponent;
(0, _defineProperty2.default)(HTMLComponent, "propTypes", {
  tinymceUrl: _propTypes.default.string,
  className: _propTypes.default.string,
  value: _propTypes.default.string,
  label: _propTypes.default.string,
  placeholder: _propTypes.default.string,
  onChange: _propTypes.default.func,
  tinyMceOptions: _propTypes.default.object,
  uniqueClassName: _propTypes.default.string,
  lang: _propTypes.default.string,
  loadComponent: _propTypes.default.node
});
(0, _defineProperty2.default)(HTMLComponent, "defaultProps", {
  className: 'form-group',
  value: '',
  tinyMceUrl: '/js/tinymce/tinymce.min.js',
  label: null,
  placeholder: null,
  onChange: () => {},
  uniqueClassName: null,
  lang: 'fr',
  loadComponent: null
});
function generateUniqueIdentifier() {
  return Math.ceil(Math.random() * 100000000);
}
function flattenChildren(node) {
  var flattened = '';
  if (!node.childNodes.length) {
    return getCleanTextContent(node);
  }
  for (var i = 0; i < node.childNodes.length; i++) {
    if (node.childNodes[i].childNodes.length) {
      flattened += flattenChildren(node.childNodes[i]);
    } else {
      flattened += node.childNodes[i].nodeValue || '';
    }
  }
  return flattened;
}
function cleanNode(node) {
  let clean = document.createElement(node.nodeName),
    cleanChild,
    i,
    type,
    child,
    cleanType;
  for (i = 0; i < node.childNodes.length; i++) {
    child = node.childNodes[i];
    type = child.nodeName.toLowerCase();
    cleanType = ['p', 'h1', 'h2', 'h3'].indexOf(type) !== -1 ? type : 'p';
    cleanChild = document.createElement(cleanType);
    cleanChild.innerHTML = flattenChildren(child);
    if (cleanChild.innerHTML.length) {
      clean.appendChild(cleanChild);
    }
  }
  return clean;
}
function makeUrlConverter(editor) {
  var fn = editor.convertURL;
  editor.convertURL = convertURL_;
  function convertURL_(url, name, elm) {
    fn.apply(this, arguments);
    var regex = new RegExp('(http:|https:)?//');
    if (!regex.test(url)) {
      return url = 'http://' + url;
    }
    return url;
  }
}
function getCleanTextContent(elem) {
  var _context;
  let attr = 'innerText' in elem ? 'innerText' : 'textContent';
  return (0, _trim.default)(_context = _utils.default.cleanString(elem[attr] || '')).call(_context);
}
module.exports = exports.default;
//# sourceMappingURL=HTMLComponent.js.map