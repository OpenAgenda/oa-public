"use strict";

var React = require('react'),
    createReactClass = require('create-react-class'),
    PropTypes = require('prop-types'),
    makeLabelGetter = require('../lib/makeLabelGetter'),
    labels = require('../labels'),
    utils = require('@openagenda/utils');

module.exports = createReactClass({

  displayName: 'MultilingualInputField',

  propTypes: {

    // enabled boolean
    enabled: PropTypes.array,

    // list of language codes to display
    languages: PropTypes.array,

    // language-indexed values. ex: { fr: 'v1', en: 'v2' }
    value: PropTypes.object,

    // used by component to load labels
    getLabel: PropTypes.func,

    // used to optionnally bypass getLabel and load main label as is
    label: PropTypes.string,

    // used to optionnally bypass getLabel and load info as is
    info: PropTypes.string,

    // called when value changes
    onChange: PropTypes.func,

    // rows to display if field is textarea
    rows: PropTypes.number,

    // type of the field. either text or textarea
    type: PropTypes.string,

    // bottom is a component generator that takes a lang
    bottom: PropTypes.func

  },

  getDefaultProps: function getDefaultProps() {

    return {
      type: 'text',
      getLabel: makeLabelGetter(labels),
      bottom: function bottom() {
        return null;
      }
    };
  },
  onChange: function onChange(lang) {
    var _this = this;

    return function (e) {

      var newValue = JSON.parse(JSON.stringify(_this.props.value));

      newValue[lang] = e.target.value;

      _this.props.onChange(_this.props.name, newValue);
    };
  },
  renderField: function renderField(lang) {

    var name = this.props.languages.length > 1 ? this.props.name + '_' + lang : this.props.name;

    return React.createElement(
      'div',
      null,
      this.props.type == 'textarea' ? React.createElement('textarea', {
        name: name,
        rows: this.props.rows,
        value: this.props.value[lang],
        className: 'form-control',
        onChange: this.onChange(lang),
        disabled: !this.isEnabled(lang) }) : React.createElement('input', {
        name: name,
        type: 'text',
        value: this.props.value[lang],
        className: 'form-control',
        onChange: this.onChange(lang),
        disabled: !this.isEnabled(lang) }),
      this.props.bottom(lang)
    );
  },
  isEnabled: function isEnabled(lang) {

    if (!utils.isArray(this.props.enabled)) return true;

    return this.props.enabled.indexOf(lang) !== -1;
  },
  renderLanguageBlock: function renderLanguageBlock(lang) {

    if (this.props.languages.length > 1) {

      return React.createElement(
        'div',
        { className: 'lang-unit' },
        React.createElement(
          'label',
          null,
          lang
        ),
        React.createElement(
          'div',
          null,
          this.renderField(lang)
        )
      );
    } else {

      return this.renderField(lang);
    }
  },
  render: function render() {
    var _this2 = this;

    var classes = ['multilingual-input-field', 'form-group'];

    if (this.props.enabled && !this.props.enabled.length) {

      classes.push('disabled');
    }

    return React.createElement(
      'div',
      { className: classes.join(' ') },
      React.createElement(
        'label',
        null,
        this.props.label || this.props.getLabel(this.props.name)
      ),
      this.props.info ? React.createElement(
        'span',
        { className: 'info' },
        this.props.info
      ) : null,
      React.createElement(
        'ul',
        { className: 'list-unstyled' },
        this.props.languages.map(function (lang) {
          return React.createElement(
            'li',
            { key: lang, className: _this2.isEnabled(lang) ? '' : 'disabled' },
            _this2.renderLanguageBlock(lang)
          );
        })
      )
    );
  }
});