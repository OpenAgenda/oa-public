"use strict";

var _interopRequireDefault = require("@babel/runtime-corejs3/helpers/interopRequireDefault").default;
Object.defineProperty(exports, "__esModule", {
  value: true
});
var _exportNames = {
  OaSdk: true
};
Object.defineProperty(exports, "OaSdk", {
  enumerable: true,
  get: function () {
    return _api.default;
  }
});
var _api = _interopRequireDefault(require("./api"));
var _schemaOrg = require("./schema-org");
Object.keys(_schemaOrg).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  if (Object.prototype.hasOwnProperty.call(_exportNames, key)) return;
  if (key in exports && exports[key] === _schemaOrg[key]) return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _schemaOrg[key];
    }
  });
});
//# sourceMappingURL=index.js.map