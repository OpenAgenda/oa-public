"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _languages = require('languages');

var _languages2 = _interopRequireDefault(_languages);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Translation = function Translation(props) {
  return _react2.default.createElement(TranslationComponent, props);
};

exports.default = Translation;


Translation.propTypes = {
  source: _react.PropTypes.string,
  languages: _react.PropTypes.array,
  labels: _react.PropTypes.object,
  checked: _react.PropTypes.array,
  check: _react.PropTypes.func,
  uncheck: _react.PropTypes.func,
  helpLink: _react.PropTypes.string
};

var TranslationComponent = _react2.default.createClass({
  displayName: 'TranslationComponent',
  getDefaultProps: function getDefaultProps() {

    return {
      source: 'fr',
      languages: ['de', 'en', 'es', 'it'],
      labels: {
        translationTitle: 'Translation',
        sourceLanguage: 'Source Language',
        targetLanguages: 'Automatic translation',
        translationHelp: 'Find out more'
      },
      helpLink: 'https://openagenda.zendesk.com/hc/fr/articles/213573709-Traduction-automatique-des-%C3%A9v%C3%A9nements'
    };
  },
  render: function render() {
    var _this = this;

    var labels = this.props.labels;

    return _react2.default.createElement(
      'div',
      { className: 'form-group' },
      _react2.default.createElement(
        'a',
        { className: 'pull-right', target: '_blank', href: this.props.helpLink },
        labels.translationHelp
      ),
      _react2.default.createElement(
        'h2',
        null,
        labels.translationTitle
      ),
      _react2.default.createElement(
        'div',
        { className: 'form-inline row' },
        _react2.default.createElement(
          'div',
          { className: 'col-sm-6' },
          _react2.default.createElement(
            'label',
            null,
            labels.sourceLanguage
          ),
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              'span',
              { className: 'disabled' },
              _languages2.default.getLanguageInfo(this.props.source).nativeName
            )
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'col-sm-6' },
          _react2.default.createElement(
            'label',
            null,
            labels.targetLanguages
          ),
          _react2.default.createElement(
            'ul',
            { className: 'list-unstyled' },
            this.props.languages.map(function (l) {
              return _react2.default.createElement(
                'li',
                { key: l, className: 'checkbox margin-right-sm' },
                _react2.default.createElement(
                  'label',
                  null,
                  _react2.default.createElement('input', {
                    type: 'checkbox',
                    onChange: function onChange(e) {
                      return _this.props.checked.indexOf(l) !== -1 ? _this.props.uncheck(l) : _this.props.check(l);
                    },
                    checked: _this.props.checked.indexOf(l) !== -1 }),
                  l.toUpperCase()
                )
              );
            })
          )
        )
      )
    );
  }
});
module.exports = exports['default'];