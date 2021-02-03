'use strict';

module.exports = inst => {
  const instTimings = inst.getTimings();

  if (instTimings.length) return instTimings;

  if (inst.timings && inst.timings.length) {
    return inst.timings;
  }

  return [];
}