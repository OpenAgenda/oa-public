"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs2/helpers/interopRequireDefault");

var _interopRequireWildcard = require("@babel/runtime-corejs2/helpers/interopRequireWildcard");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.regexp.constructor");

var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/classCallCheck"));

var _createClass2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/createClass"));

var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/possibleConstructorReturn"));

var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/getPrototypeOf"));

var _inherits2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/inherits"));

var _assertThisInitialized2 = _interopRequireDefault(require("@babel/runtime-corejs2/helpers/assertThisInitialized"));

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _utils = _interopRequireDefault(require("@openagenda/utils"));

var _uniqueLoad = _interopRequireDefault(require("../lib/uniqueLoad"));

var _jsxFileName = "/home/bertho/oa/packages/react-form-components/components/HTMLComponent.jsx";

var HTMLComponent =
/*#__PURE__*/
function (_Component) {
  (0, _inherits2.default)(HTMLComponent, _Component);

  function HTMLComponent(props) {
    var _this;

    (0, _classCallCheck2.default)(this, HTMLComponent);
    _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(HTMLComponent).call(this, props));

    _utils.default.extend((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)), {
      loadTinyMce: _this.loadTinyMce.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this))),
      initializeTinyMceEditor: _this.initializeTinyMceEditor.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this))),
      updateTinyMceEditor: _this.updateTinyMceEditor.bind((0, _assertThisInitialized2.default)((0, _assertThisInitialized2.default)(_this)))
    });

    _this.state = {
      tinyMceReady: typeof tinymce !== 'undefined',
      editorId: null,
      uniqueClassName: _this.props.uniqueClassName || 'js_' + generateUniqueIdentifier()
    };
    if (!_this.state.tinyMceReady && typeof document !== 'undefined') _this.loadTinyMce();
    return _this;
  }

  (0, _createClass2.default)(HTMLComponent, [{
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      if (!this.state.editorId) return console.log('not loaded');
      tinymce.get(this.state.editorId).remove();
    }
  }, {
    key: "render",
    value: function render() {
      if (!this.state.tinyMceReady) return null;

      if (!this.state.editorId) {
        setTimeout(this.initializeTinyMceEditor);
      } else {
        setTimeout(this.updateTinyMceEditor);
      }

      var _this$props = this.props,
          className = _this$props.className,
          placeholder = _this$props.placeholder,
          label = _this$props.label,
          value = _this$props.value;
      return _react.default.createElement("div", {
        className: className,
        __source: {
          fileName: _jsxFileName,
          lineNumber: 81
        },
        __self: this
      }, label && _react.default.createElement("label", {
        __source: {
          fileName: _jsxFileName,
          lineNumber: 82
        },
        __self: this
      }, label), _react.default.createElement("textarea", {
        placeholder: placeholder,
        className: this.state.uniqueClassName,
        value: value || '',
        style: {
          minHeight: '200px',
          visibility: 'hidden'
        },
        onChange: function onChange() {},
        __source: {
          fileName: _jsxFileName,
          lineNumber: 83
        },
        __self: this
      }));
    }
  }, {
    key: "updateTinyMceEditor",
    value: function updateTinyMceEditor() {
      var editor = tinymce.get(this.state.editorId);
      if (!editor) return;

      if (this.state.html !== this.props.value) {
        // value in editor has diverged from value given in props. Needs to be updated
        tinymce.get(this.state.editorId).setContent(this.props.value || '');
      }
    }
  }, {
    key: "initializeTinyMceEditor",
    value: function initializeTinyMceEditor() {
      var _this2 = this;

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
        setup: function setup(editor) {
          _this2.setState({
            editorId: editor.id,
            html: _this2.props.value
          });

          makeUrlConverter(editor);
          editor.on('change', function (e) {
            var html = e.target.getContent();

            _this2.setState({
              html: html
            });

            _this2.props.onChange(html);
          });
        },
        paste_postprocess: function paste_postprocess(pl, o) {
          // paste from word-type processors insert a mess of tags
          // in the html; these must be cleaned
          o.node = cleanNode(o.node);
        }
      });
    }
  }, {
    key: "loadTinyMce",
    value: function loadTinyMce() {
      var _this3 = this;

      (0, _uniqueLoad.default)(this.props.tinyMceUrl, function (err, script) {
        _this3.setState({
          tinyMceReady: true
        });
      });
    }
  }]);
  return HTMLComponent;
}(_react.Component);

exports.default = HTMLComponent;
HTMLComponent.propTypes = {
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
};
HTMLComponent.defaultProps = {
  className: 'form-group',
  value: '',
  tinyMceUrl: '/js/tinymce/tinymce.min.js',
  label: null,
  placeholder: null,
  onChange: function onChange() {},
  uniqueClassName: null,
  lang: 'fr',
  loadComponent: null
};

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
  var clean = document.createElement(node.nodeName),
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
    var regex = new RegExp("(http:|https:)?\/\/");

    if (!regex.test(url)) {
      return url = "http://" + url;
    }

    return url;
  }
}

function getCleanTextContent(elem) {
  var attr = 'innerText' in elem ? 'innerText' : 'textContent';
  return _utils.default.cleanString(elem[attr] || '').trim();
}

module.exports = exports["default"];
//# sourceMappingURL=HTMLComponent.js.map