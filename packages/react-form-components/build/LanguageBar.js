"use strict";

var React = require('react'),
    languages = require('languages'),
    Select = require('react-select'),
    labels = require('../labels'),
    makeLabelGetter = require('../lib/makeLabelGetter');

module.exports = React.createClass({
  displayName: 'exports',


  propTypes: {

    // used by component to load labels
    getLabel: React.PropTypes.func,

    // notify parent of new language selection
    onChange: React.PropTypes.func

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
      getLabel: makeLabelGetter(labels)
    };
  },
  onRemove: function onRemove(code) {

    this.props.onChange(this.props.languages.filter(function (l) {

      return l !== code;
    }));
  },
  sortLanguageCodes: function sortLanguageCodes() {

    return languages.getAllLanguageCode().map(function (c) {

      return {
        code: c,
        label: languages.getLanguageInfo(c).nativeName
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
        label: languages.getLanguageInfo(c).nativeName
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

    languages.push(newCode);

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

      return React.createElement(LanguageItem, {
        code: l,
        key: l,
        edited: l == _this2.state.edited,
        languages: _this2.props.languages,
        getRemainingLanguages: _this2.getRemainingLanguages,
        onRemove: _this2.onRemove,
        onChange: _this2.languageChange,
        onEdit: _this2.languageEdit.bind(null, l) });
    };

    return React.createElement(
      'div',
      { className: 'language-bar' },
      React.createElement(
        'ul',
        null,
        this.props.languages.map(languageItem)
      ),
      React.createElement(
        'span',
        { className: 'language-add cform' },
        this.state.displaySelect ? React.createElement(Select, {
          options: this.getRemainingLanguages(),
          onChange: this.languageAdd,
          clearable: false }) : React.createElement(
          'a',
          { className: 'url', onClick: this.showSelect },
          this.props.getLabel('addLanguage')
        )
      )
    );
  }
});

var LanguageItem = React.createClass({
  displayName: 'LanguageItem',


  onRemove: function onRemove() {

    this.props.onRemove(this.props.code);
  },

  renderCross: function renderCross() {

    return React.createElement(
      'span',
      { onClick: this.onRemove, className: 'remove' },
      '✕'
    );
  },


  onChange: function onChange(code) {

    this.props.onChange(this.props.code, code);
  },

  render: function render() {

    var lInfo = languages.getLanguageInfo(this.props.code);

    if (this.props.edited) {

      return React.createElement(
        'li',
        null,
        React.createElement(Select, {
          value: lInfo.nativeName,
          options: this.props.getRemainingLanguages(),
          onChange: this.onChange,
          clearable: false })
      );
    } else {

      return React.createElement(
        'li',
        null,
        React.createElement(
          'div',
          { className: 'language-item' },
          React.createElement(
            'span',
            { onClick: this.props.onEdit },
            lInfo.nativeName
          ),
          this.props.languages.length > 1 ? this.renderCross() : null
        )
      );
    }

    return React.createElement(
      'li',
      null,
      this.props.edited ? 'edited' : React.createElement(
        'span',
        { onClick: this.props.onEdit },
        lInfo.nativeName
      ),
      this.props.languages.length > 1 ? this.renderCross() : null
    );
  }

});