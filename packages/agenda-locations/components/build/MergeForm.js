"use strict";

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _createReactClass = require('create-react-class');

var _createReactClass2 = _interopRequireDefault(_createReactClass);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _merge = require('@openagenda/labels/agenda-locations/merge');

var _merge2 = _interopRequireDefault(_merge);

var _labels = require('@openagenda/labels');

var _labels2 = _interopRequireDefault(_labels);

var _LocationForm = require('./LocationForm');

var _LocationForm2 = _interopRequireDefault(_LocationForm);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var getLabel = (0, _labels2.default)(_merge2.default);

module.exports = (0, _createReactClass2.default)({
  displayName: 'exports',


  propTypes: {
    actions: _propTypes2.default.object,
    res: _propTypes2.default.object
  },

  getSetRes: function getSetRes() {

    var formState = this.props.actions.getState().form;

    return this.props.res.merge + '?' + _qs2.default.stringify({
      uids: formState.alternatives.map(function (s) {
        return s.location.uid;
      }).concat(formState.location.uid)
    });
  },
  onSuccess: function onSuccess(location, complete) {

    if (!complete) {

      this.props.actions.updateEditedLocation(location);
    } else {

      this.props.actions.closeMerge();
    }
  },
  renderHeader: function renderHeader() {

    return _react2.default.createElement(
      'div',
      { className: 'form-head' },
      _react2.default.createElement(
        'a',
        { onClick: this.props.actions.closeForm },
        getLabel('back')
      ),
      _react2.default.createElement(
        'h2',
        null,
        getLabel('title')
      ),
      _react2.default.createElement(
        'span',
        { className: 'info' },
        getLabel('info')
      )
    );
  },
  render: function render() {

    var formState = this.props.actions.getState().form;

    log('displaying merge form for %s locations', formState.alternatives.length);

    return _react2.default.createElement(_LocationForm2.default, {
      Header: this.renderHeader(),
      labels: _merge2.default,
      showToggler: true,
      res: this.props.res,
      getSetRes: this.getSetRes,
      lang: this.props.lang,
      onCancel: this.props.actions.closeForm,
      onSuccess: this.onSuccess,
      detailedInfo: this.props.detailedInfo,
      settings: this.props.settings,
      location: formState.location,
      hideCurrentAlternative: true,
      alternatives: formState.alternatives
    });
  }
});

function log() {

  console.log.apply(console, arguments);
}
//# sourceMappingURL=MergeForm.js.map