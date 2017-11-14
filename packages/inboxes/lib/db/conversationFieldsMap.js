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
  obj: 'type',
  protected: true
}, {
  db: 'type_identifier',
  obj: 'typeIdentifier',
  protected: true
}, {
  db: 'store',
  obj: 'store',
  json: true
}, {
  db: 'creator_inbox_user_id',
  obj: 'creatorInboxUserId',
  protected: true
}, {
  db: 'created_at',
  obj: 'createdAt',
  protected: true
}, {
  db: 'updated_at',
  obj: 'updatedAt',
  protected: true
}, {
  db: 'resolved_at',
  obj: 'resolvedAt'
}];

exports.default = fieldsMap;
module.exports = exports['default'];
//# sourceMappingURL=conversationFieldsMap.js.map