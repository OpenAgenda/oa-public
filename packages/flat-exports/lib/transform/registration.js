'use strict';

module.exports = ({ source, target }) => ({
  source,
  target,
  transform: registration => registration.map(reg => reg.value).join(', '),
});
