'use strict';

module.exports = function age({ source, target }) {
  return {
    source,
    target,
    transform: v => {
      if (!v?.min && !v?.max) {
        return '';
      }
      if (!v.min) {
        return `≤ ${v.max}`;
      }
      if (!v.max) {
        return `≥ ${v.min}`;
      }
      return `${v.min} → ${v.max}`;
    },
  };
};
