'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = openConversationForm;
var onReady = exports.onReady = void 0;

function openConversationForm(event) {
  if (typeof window !== 'undefined' && window.openConversationForm) {
    window.openConversationForm(event);
  } else {
    exports.onReady = onReady = event;
  }
};
//# sourceMappingURL=openConversationForm.js.map