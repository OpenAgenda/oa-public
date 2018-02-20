'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getDestinationInbox;
function getDestinationInbox(_ref) {
  var user = _ref.user,
      conversation = _ref.conversation;
  var inboxes = conversation.inboxes,
      inboxContextId = conversation.inboxContextId;


  var _inboxes = inboxes.sort(function (o) {
    return Number(o.type === 'agenda');
  }).filter(function (v) {
    return !(v.type === 'user' && v.identifier === user.uid);
  });

  return _inboxes.filter(function (v) {
    return v.id !== inboxContextId;
  })[0] || _inboxes[0];
}
module.exports = exports['default'];
//# sourceMappingURL=getDestinationInbox.js.map