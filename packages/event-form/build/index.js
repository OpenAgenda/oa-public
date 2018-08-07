"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _build = require('@openagenda/form-schemas/client/build');

var _build2 = _interopRequireDefault(_build);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var eventFormComponents = {
  age: require('./components/Age'),
  registration: require('./components/Registration'),
  keywords: require('./components/Keywords'),
  timings: require('./components/Timings'),
  locationUid: require('./components/Location')
};

var eventSchema = require('./eventSchema');

exports.default = function (props) {
  return _react2.default.createElement(_build2.default, {
    lang: props.lang,
    components: eventFormComponents,
    values: props.values,
    schema: eventSchema,
    actionComponents: props.actionComponents
  });
};
//# sourceMappingURL=index.js.map