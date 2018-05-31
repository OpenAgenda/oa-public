"use strict";

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _languages = require('languages');

var _languages2 = _interopRequireDefault(_languages);

var _reactSelect = require('react-select');

var _reactSelect2 = _interopRequireDefault(_reactSelect);

var _labels = require('../labels');

var _labels2 = _interopRequireDefault(_labels);

var _makeLabelGetter = require('../lib/makeLabelGetter');

var _makeLabelGetter2 = _interopRequireDefault(_makeLabelGetter);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _createReactClass2.default)({

  displayName: 'LanguageBar',

  propTypes: {

    enabled: _propTypes2.default.array,

    // if languages can be added removed or changed
    editable: _propTypes2.default.bool,

    // used by component to load labels
    getLabel: _propTypes2.default.func,

    // notify parent of new language selection
    onChange: _propTypes2.default.func

  },

  getInitialState: function getInitialState() {

    return {
      displaySelect: false,
      sortedLanguageCodes: this.sortLanguageCodes(),
      edited: false
    };
  },
  getDefaultProps: function getDefaultProps() {

    return {
      editable: true,
      getLabel: (0, _makeLabelGetter2.default)(_labels2.default)
    };
  },
  onRemove: function onRemove(code) {

    this.props.onChange(this.props.languages.filter(function (l) {

      return l !== code;
    }));
  },
  isEnabled: function isEnabled(lang) {

    if (!this.props.enabled) return true;

    return this.props.enabled.indexOf(lang) !== -1;
  },
  sortLanguageCodes: function sortLanguageCodes() {

    return _languages2.default.getAllLanguageCode().map(function (c) {

      return {
        code: c,
        label: _languages2.default.getLanguageInfo(c).nativeName
      };
    }).sort(function (a, b) {

      if (a.label < b.label) return -1;

      if (a.label > b.label) return 1;

      return 0;
    }).map(function (a) {

      return a.code;
    });
  },
  getRemainingLanguages: function getRemainingLanguages() {
    var _this = this;

    var self = this;

    return this.state.sortedLanguageCodes.filter(function (c) {
      return _this.props.languages.indexOf(c) == -1;
    }).map(function (c) {

      return {
        value: c,
        label: _languages2.default.getLanguageInfo(c).nativeName
      };
    });
  },
  showSelect: function showSelect() {

    this.setState({
      displaySelect: true
    });
  },
  hideSelect: function hideSelect() {

    this.setState({
      displaySelect: false
    });
  },
  languageAdd: function languageAdd(newCode) {

    var languages = this.props.languages.slice();

    languages.push(newCode.value);

    this.hideSelect();

    this.props.onChange(languages);
  },
  languageEdit: function languageEdit(code) {

    this.setState({ edited: code });
  },
  languageChange: function languageChange(previousCode, newCode) {

    var languages = this.props.languages.slice();

    languages.splice(languages.indexOf(previousCode), 1, newCode);

    this.setState({ edited: false });

    this.props.onChange(languages);
  },
  render: function render() {
    var _this2 = this;

    var languageItem = function languageItem(l) {

      return _react2.default.createElement(LanguageItem, {
        enabled: _this2.isEnabled(l),
        editable: _this2.props.editable,
        code: l,
        key: l,
        edited: l == _this2.state.edited,
        languages: _this2.props.languages,
        getRemainingLanguages: _this2.getRemainingLanguages,
        onRemove: _this2.onRemove,
        onChange: _this2.languageChange,
        onEdit: _this2.languageEdit.bind(null, l) });
    };

    return _react2.default.createElement(
      'div',
      { className: 'language-bar' },
      _react2.default.createElement(
        'ul',
        null,
        this.props.languages.map(function (l) {
          return languageItem(l);
        })
      ),
      this.props.editable ? _react2.default.createElement(
        'span',
        { className: 'language-add cform' },
        this.state.displaySelect ? _react2.default.createElement(_reactSelect2.default, {
          options: this.getRemainingLanguages(),
          onChange: this.languageAdd,
          clearable: false }) : _react2.default.createElement(
          'a',
          { className: 'url', onClick: this.showSelect },
          this.props.getLabel('addLanguage')
        )
      ) : null
    );
  }
});

var LanguageItem = (0, _createReactClass2.default)({
  displayName: 'LanguageItem',


  onRemove: function onRemove() {

    if (!this.props.editable) return;

    this.props.onRemove(this.props.code);
  },

  getDefaultProps: function getDefaultProps() {

    return {
      enabled: true,
      editable: true
    };
  },
  renderCross: function renderCross() {

    return _react2.default.createElement(
      'span',
      { onClick: this.onRemove, className: 'remove' },
      '\u2715'
    );
  },


  onChange: function onChange(language) {

    this.props.onChange(this.props.code, language.value);
  },

  render: function render() {

    var lInfo = _languages2.default.getLanguageInfo(this.props.code);

    if (this.props.edited) {

      return _react2.default.createElement(
        'li',
        null,
        _react2.default.createElement(_reactSelect2.default, {
          value: lInfo.nativeName,
          options: this.props.getRemainingLanguages(),
          onChange: this.onChange,
          clearable: false })
      );
    } else {

      return _react2.default.createElement(
        'li',
        { className: this.props.enabled ? '' : 'disabled' },
        _react2.default.createElement(
          'div',
          { className: 'language-item' },
          _react2.default.createElement(
            'span',
            { onClick: this.props.onEdit },
            lInfo.nativeName
          ),
          this.props.languages.length > 1 && this.props.editable ? this.renderCross() : null
        )
      );
    }

    return _react2.default.createElement(
      'li',
      null,
      this.props.edited ? 'edited' : _react2.default.createElement(
        'span',
        { onClick: this.props.onEdit },
        lInfo.nativeName
      ),
      this.props.languages.length > 1 ? this.renderCross() : null
    );
  }

});