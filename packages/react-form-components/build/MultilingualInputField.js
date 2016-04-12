"use strict";

var React = require('react'),
    makeLabelGetter = require('../lib/makeLabelGetter'),
    labels = require('../labels');

module.exports = React.createClass({

  displayName: 'MultilingualInputField',

  propTypes: {

    // list of language codes to display
    languages: React.PropTypes.array,

    // language-indexed values. ex: { fr: 'v1', en: 'v2' }
    value: React.PropTypes.object,

    // used by component to load labels
    getLabel: React.PropTypes.func,

    // called when value changes
    onChange: React.PropTypes.func,

    // rows to display if field is textarea
    rows: React.PropTypes.number,

    // type of the field. either text or textarea
    type: React.PropTypes.string

  },

  getDefaultProps: function getDefaultProps() {

    return {
      type: 'text',
      getLabel: makeLabelGetter(labels)
    };
  },

  onChange: function onChange(lang) {

    var self = this;

    return function (e) {

      var newValue = JSON.parse(JSON.stringify(self.props.value));

      newValue[lang] = e.target.value;

      self.props.onChange(self.props.name, newValue);
    };
  },

  renderField: function renderField(lang) {

    var name = this.props.languages.length > 1 ? this.props.name + '_' + lang : this.props.name;

    if (this.props.type == 'textarea') {

      return React.createElement('textarea', {
        name: name,
        rows: this.props.rows,
        value: this.props.value[lang],
        className: 'form-control',
        onChange: this.onChange(lang) });
    } else {

      return React.createElement('input', {
        name: name,
        type: 'text',
        value: this.props.value[lang],
        className: 'form-control',
        onChange: this.onChange(lang) });
    }
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

    var self = this;

    return React.createElement(
      'div',
      { className: 'multilingual-input-field form-group' },
      React.createElement(
        'label',
        null,
        this.props.getLabel(this.props.name)
      ),
      React.createElement(
        'ul',
        { className: 'list-unstyled' },
        this.props.languages.map(function (lang) {
          return React.createElement(
            'li',
            { key: lang },
            self.renderLanguageBlock(lang)
          );
        }),
        this.props.info ? React.createElement(
          'li',
          { className: 'info' },
          this.props.info
        ) : null
      )
    );
  }

});