'use strict';

module.exports = function getTimings(inst) {
  if (inst.timings && inst.timings.length) {
    return inst.timings;
  }

  const instTimings = inst.getTimings();

  if (instTimings.length) return instTimings;

  return [];
};
