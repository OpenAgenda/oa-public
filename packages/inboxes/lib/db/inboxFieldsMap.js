'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var fieldsMap = [{
  db: 'id',
  obj: 'id',
  protected: true // field is protected to modifications
  // internal: true, // field is visible only with this option set to true
  // json: true // format/parse this field as json
}, {
  db: 'type',
  obj: 'type'
}, {
  db: 'identifier',
  obj: 'identifier'
}];

exports.default = fieldsMap;
module.exports = exports['default'];
//# sourceMappingURL=inboxFieldsMap.js.map