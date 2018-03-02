"use strict";

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _utils = require('@openagenda/utils');

var _utils2 = _interopRequireDefault(_utils);

var _form = require('@openagenda/labels/agenda-locations/form');

var _form2 = _interopRequireDefault(_form);

var _update = require('@openagenda/labels/agenda-locations/update');

var _update2 = _interopRequireDefault(_update);

var _labels = require('@openagenda/labels');

var _labels2 = _interopRequireDefault(_labels);

var _LocationForm = require('./LocationForm');

var _LocationForm2 = _interopRequireDefault(_LocationForm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getLabel = (0, _labels2.default)(_utils2.default.extend({}, _form2.default, _update2.default));

module.exports = (0, _createReactClass2.default)({
  displayName: 'exports',


  propTypes: {
    actions: _propTypes2.default.object,
    res: _propTypes2.default.object,
    settings: _propTypes2.default.object
  },

  renderHeader: function renderHeader(location) {

    return _react2.default.createElement(
      'div',
      { className: 'form-head' },
      _react2.default.createElement(
        'a',
        { onClick: this.props.actions.closeForm },
        getLabel('back', this.props.lang)
      ),
      _react2.default.createElement(
        'h2',
        null,
        getLabel('title', this.props.lang)
      ),
      _react2.default.createElement(
        'span',
        { className: 'info' },
        getLabel('info', this.props.lang)
      )
    );
  },
  render: function render() {

    var formState = this.props.actions.getState().form;

    return _react2.default.createElement(_LocationForm2.default, {
      Header: this.renderHeader(formState.location),
      location: formState.location,
      labels: _update2.default,
      showToggler: true,
      res: this.props.res,
      lang: this.props.lang,
      onCancel: this.props.actions.closeForm,
      onSuccess: this.props.actions.updateEditedLocation,
      detailedInfo: this.props.detailedInfo,
      settings: this.props.settings
    });
  }
});
//# sourceMappingURL=UpdateForm.js.map