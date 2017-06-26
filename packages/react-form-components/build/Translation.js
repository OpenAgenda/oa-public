"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Translation = function Translation(props) {
  return _react2.default.createElement(TranslationComponent, props);
};

exports.default = Translation;


Translation.propTypes = {
  source: _propTypes2.default.string,
  languages: _propTypes2.default.array,
  labels: _propTypes2.default.object,
  checked: _propTypes2.default.array,
  check: _propTypes2.default.func,
  uncheck: _propTypes2.default.func,
  helpLink: _propTypes2.default.string
};

var TranslationComponent = (0, _createReactClass2.default)({
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

    this.props.sourceChange(newSource.value);
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
            this.props.sets.length > 1 ? _react2.default.createElement(
              'span',
              null,
              ' - ',
              _react2.default.createElement(
                'a',
                { href: '#', onClick: this.sourceChange },
                labels.sourceChange
              )
            ) : null
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