"use strict";

const TOKEN_REGEX_STRING = '\\w{8}-\\w{4}-\\w{4}-\\w{4}-\\w{12}';

module.exports = {
  TOKEN_REGEX_STRING: TOKEN_REGEX_STRING,
  TOKEN_REGEX: new RegExp(`^${TOKEN_REGEX_STRING}$`)
}
