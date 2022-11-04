"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _reactQuery = require("react-query");

var _axios = _interopRequireDefault(require("axios"));

var _useRes = _interopRequireDefault(require("./useRes"));

var _default = function _default(agenda) {
  var res = (0, _useRes.default)(agenda);

  var _useQuery = (0, _reactQuery.useQuery)(['agenda-eventSchema', agenda.uid], function () {
    return _axios.default.get(res.eventSchema, {
      params: {
        split: 1
      }
    }).then(function (response) {
      return response.data;
    });
  }, {
    staleTime: Infinity
  }),
      isLoading = _useQuery.isLoading,
      error = _useQuery.error,
      data = _useQuery.data;

  return {
    isLoading: isLoading,
    error: error,
    schema: (data === null || data === void 0 ? void 0 : data.schema) || null,
    parents: data === null || data === void 0 ? void 0 : data.parents
  };
};

exports.default = _default;
module.exports = exports.default;
//# sourceMappingURL=useEventSchemas.js.map