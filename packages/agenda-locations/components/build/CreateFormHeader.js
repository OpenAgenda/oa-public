"use strict";

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _utils = require('@openagenda/utils');

var _utils2 = _interopRequireDefault(_utils);

var _create = require('@openagenda/labels/agenda-locations/create');

var _create2 = _interopRequireDefault(_create);

var _form = require('@openagenda/labels/agenda-locations/form');

var _form2 = _interopRequireDefault(_form);

var _labels = require('@openagenda/labels');

var _labels2 = _interopRequireDefault(_labels);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _getLabel = (0, _labels2.default)(_utils2.default.extend({}, _form2.default, _create2.default));

module.exports = (0, _createReactClass2.default)({
  displayName: 'exports',


  propTypes: {
    lang: _propTypes2.default.string,
    actions: _propTypes2.default.object,
    settings: _propTypes2.default.object
  },

  getLabel: function getLabel(name) {

    var str = void 0;

    if (this.props.settings && this.props.settings.labels && this.props.settings.labels.create && this.props.settings.labels.create[name]) {

      str = this.props.settings.labels.create[name][this.props.lang];
    } else {

      str = _getLabel(name, this.props.lang);
    }

    return str;
  },
  render: function render() {

    return _react2.default.createElement(
      'div',
      { className: 'head' },
      this.props.actions && this.props.actions.closeForm ? _react2.default.createElement(
        'a',
        { onClick: this.props.actions.closeForm },
        this.getLabel('back')
      ) : null,
      _react2.default.createElement(
        'h2',
        null,
        this.getLabel('title', this.props.lang)
      ),
      _react2.default.createElement(
        'span',
        { className: 'info' },
        this.getLabel('info', this.props.lang)
      )
    );
  }
});
//# sourceMappingURL=CreateFormHeader.js.map