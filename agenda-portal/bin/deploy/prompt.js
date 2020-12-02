'use strict';

const PromptInput = require('prompt-input');
const PromptConfirm = require('prompt-confirm');

module.exports = {
  term(message, options = {}) {
    return new PromptInput(Object.assign(options, { message })).run();
  },
  confirm(message, options = {}) {
    return new PromptConfirm(Object.assign(options, { message })).run();
  }
};
