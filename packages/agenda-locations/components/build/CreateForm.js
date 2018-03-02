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

var _LocationForm = require('./LocationForm');

var _LocationForm2 = _interopRequireDefault(_LocationForm);

var _CreateFormHeader = require('./CreateFormHeader');

var _CreateFormHeader2 = _interopRequireDefault(_CreateFormHeader);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getLabel = (0, _labels2.default)(_utils2.default.extend({}, _form2.default, _create2.default));

module.exports = (0, _createReactClass2.default)({
  displayName: 'exports',


  propTypes: {
    lang: _propTypes2.default.string,
    actions: _propTypes2.default.object,
    res: _propTypes2.default.object,
    settings: _propTypes2.default.object
  },

  renderHeader: function renderHeader() {

    return _react2.default.createElement(_CreateFormHeader2.default, {
      settings: this.props.settings,
      actions: this.props.actions,
      lang: this.props.lang
    });
  },
  render: function render() {

    return _react2.default.createElement(_LocationForm2.default, {
      Header: this.renderHeader(),
      location: null,
      labels: _create2.default,
      showToggler: false,
      res: this.props.res,
      lang: this.props.lang,
      onCancel: this.props.actions.closeForm,
      onSuccess: this.props.actions.addLocation,
      detailedInfo: this.props.detailedInfo,
      settings: this.props.settings
    });
  }
});
//# sourceMappingURL=CreateForm.js.map