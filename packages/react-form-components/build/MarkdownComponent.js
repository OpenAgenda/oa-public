"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _utils = require('utils');

var _utils2 = _interopRequireDefault(_utils);

var _uniqueLoad = require('../lib/uniqueLoad');

var _uniqueLoad2 = _interopRequireDefault(_uniqueLoad);

var _toMarkdown = require('to-markdown');

var _toMarkdown2 = _interopRequireDefault(_toMarkdown);

var _marked = require('marked');

var _marked2 = _interopRequireDefault(_marked);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var MarkdownComponent = (_temp = _class = function (_Component) {
  _inherits(MarkdownComponent, _Component);

  function MarkdownComponent(props) {
    _classCallCheck(this, MarkdownComponent);

    var _this = _possibleConstructorReturn(this, (MarkdownComponent.__proto__ || Object.getPrototypeOf(MarkdownComponent)).call(this, props));

    _utils2.default.extend(_this, {
      loadTinyMce: _this.loadTinyMce.bind(_this),
      initializeTinyMceEditor: _this.initializeTinyMceEditor.bind(_this),
      updateTinyMceEditor: _this.updateTinyMceEditor.bind(_this)
    });

    _this.state = {
      tinyMceReady: false,
      editorId: null,
      uniqueClassName: _this.props.uniqueClassName || 'js_' + generateUniqueIdentifier()
    };

    if (!_this.state.tinyMceReady) _this.loadTinyMce();

    return _this;
  }

  _createClass(MarkdownComponent, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {

      if (!this.state.editorId) return console.log('not loaded');

      tinymce.get(this.state.editorId).remove();
    }
  }, {
    key: 'render',
    value: function render() {

      if (!this.state.tinyMceReady) return null;

      if (!this.state.editorId) {

        setTimeout(this.initializeTinyMceEditor);
      } else {

        setTimeout(this.updateTinyMceEditor);
      }

      if (typeof document !== 'undefined') setTimeout(this.initializeTinyMce);

      var _props = this.props,
          className = _props.className,
          placeholder = _props.placeholder,
          label = _props.label,
          value = _props.value;


      return _react2.default.createElement(
        'div',
        { className: className },
        label && _react2.default.createElement(
          'label',
          null,
          label
        ),
        _react2.default.createElement('textarea', {
          placeholder: placeholder,
          className: this.state.uniqueClassName,
          value: (0, _marked2.default)(value),
          style: { minHeight: '200px', visibility: 'hidden' },
          onChange: function onChange() {
            console.log('?');
          }
        })
      );
    }
  }, {
    key: 'updateTinyMceEditor',
    value: function updateTinyMceEditor() {

      var editor = tinymce.get(this.state.editorId);

      if (!editor) return;

      if (this.state.editorMarkdown !== this.props.value) {

        // value in editor has diverged from value given in props. Needs to be updated
        tinymce.get(this.state.editorId).setContent((0, _marked2.default)(this.props.value));
      }
    }
  }, {
    key: 'initializeTinyMceEditor',
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
            editorMarkdown: _this2.props.value
          });

          makeUrlConverter(editor);

          editor.on('change', function (e) {

            _this2.onTinyMCEChange(e.target.getContent());
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
    key: 'onTinyMCEChange',
    value: function onTinyMCEChange(html) {

      var editorMarkdown = (0, _toMarkdown2.default)(html);

      this.setState({
        editorMarkdown: editorMarkdown
      });

      this.props.onChange(editorMarkdown);
    }
  }, {
    key: 'loadTinyMce',
    value: function loadTinyMce() {
      var _this3 = this;

      (0, _uniqueLoad2.default)(this.props.tinyMceUrl, function (err, script) {

        _this3.setState({
          tinyMceReady: true
        });
      });
    }
  }]);

  return MarkdownComponent;
}(_react.Component), _class.propTypes = {
  tinymceUrl: _propTypes2.default.string,
  className: _propTypes2.default.string,
  value: _propTypes2.default.string,
  label: _propTypes2.default.string,
  placeholder: _propTypes2.default.string,
  onChange: _propTypes2.default.func,
  tinyMceOptions: _propTypes2.default.object,
  uniqueClassName: _propTypes2.default.string,
  lang: _propTypes2.default.string,
  loadComponent: _propTypes2.default.node
}, _class.defaultProps = {
  className: 'form-group',
  value: '',
  tinyMceUrl: '/js/tinymce/tinymce.min.js',
  label: null,
  placeholder: null,
  onChange: function onChange() {},
  uniqueClassName: null,
  lang: 'fr',
  loadComponent: null
}, _temp);
exports.default = MarkdownComponent;


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
      cleanChild = void 0,
      i = void 0,
      type = void 0,
      child = void 0,
      cleanType = void 0;

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

  return _utils2.default.cleanString(elem[attr] || '').trim();
}
module.exports = exports['default'];