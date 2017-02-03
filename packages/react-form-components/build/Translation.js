"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _languages = require('languages');

var _languages2 = _interopRequireDefault(_languages);

var _reactSelect = require('react-select');

var _reactSelect2 = _interopRequireDefault(_reactSelect);

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
      sets: [{
        source: 'fr',
        target: ['de', 'en', 'es', 'it'],
        checked: []
      }],
      labels: {
        translationTitle: 'Translation',
        sourceLanguage: 'Source Language',
        targetLanguages: 'Automatic translation',
        translationHelp: 'Find out more',
        sourceChange: 'Choose'
      },
      helpLink: 'https://openagenda.zendesk.com/hc/fr/articles/213573709-Traduction-automatique-des-%C3%A9v%C3%A9nements',
      check: function check() {},
      uncheck: function uncheck() {},
      sourceChange: function sourceChange() {}
    };
  },
  getInitialState: function getInitialState() {

    return {
      editingSource: false
    };
  },
  sourceChange: function sourceChange(e) {

    e.preventDefault();

    this.setState({ editingSource: true });
  },
  updateSource: function updateSource(newSource) {

    this.setState({
      editingSource: false
    });

    this.props.sourceChange(newSource);
  },
  render: function render() {
    var _this = this;

    var labels = this.props.labels;

    return _react2.default.createElement(
      'div',
      { className: 'form-group translation-form' },
      _react2.default.createElement(
        'a',
        { className: 'pull-right help', target: '_blank', href: this.props.helpLink },
        _react2.default.createElement('i', { className: 'fa fa-question-circle' }),
        _react2.default.createElement(
          'label',
          { style: { display: 'none' } },
          labels.translationHelp
        )
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
          this.state.editingSource ? _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(_reactSelect2.default, {
              value: this.props.source,
              options: this.props.sets.map(function (s) {
                return {
                  value: s.source,
                  label: _languages2.default.getLanguageInfo(s.source).nativeName
                };
              }),
              onChange: this.updateSource,
              clearable: false })
          ) : _react2.default.createElement(
            'div',
            { className: 'line' },
            _react2.default.createElement(
              'span',
              { className: 'disabled' },
              _languages2.default.getLanguageInfo(this.props.source).nativeName
            ),
            _react2.default.createElement(
              'span',
              null,
              ' - ',
              _react2.default.createElement(
                'a',
                { href: '#', onClick: this.sourceChange },
                labels.sourceChange
              )
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
            { className: 'list-unstyled line' },
            this.props.sets.filter(function (s) {
              return s.source === _this.props.source;
            }).map(function (s) {
              return s.target.map(function (l) {
                return _react2.default.createElement(
                  'li',
                  { key: l, className: 'checkbox margin-right-sm' },
                  _react2.default.createElement(
                    'label',
                    null,
                    _react2.default.createElement('input', {
                      type: 'checkbox',
                      onChange: function onChange(e) {
                        return s.checked.indexOf(l) !== -1 ? _this.props.uncheck(s.source, l) : _this.props.check(s.source, l);
                      },
                      checked: s.checked.indexOf(l) !== -1 }),
                    l.toUpperCase()
                  )
                );
              });
            })
          )
        )
      )
    );
  }
});
module.exports = exports['default'];