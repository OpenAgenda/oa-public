"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = showBackLink;
function showBackLink(settings, conversations) {
  var focusFistConversation = settings.focusFistConversation,
      hideEmptyList = settings.hideEmptyList;


  if (focusFistConversation) {
    if (hideEmptyList) {
      if (conversations && conversations.length && conversations[0].resolvedAt) {
        return true; // focusFistConversation && hideEmptyList && conversations not empty
      }
    } else {
      return true; // focusFistConversation && !hideEmptyList
    }
  } else {
    if (hideEmptyList) {
      if (conversations && conversations.length) {
        return true; // !focusFistConversation && hideEmptyList && conversations not empty
      }
    } else {
      return true; // !focusFistConversation && !hideEmptyList
    }
  }

  return false;
}
module.exports = exports["default"];
//# sourceMappingURL=showBackLink.js.map