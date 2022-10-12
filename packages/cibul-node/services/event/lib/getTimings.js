'use strict';

module.exports = function getTimings(inst) {
  const instTimings = inst.getTimings();

  if (instTimings.length) return instTimings;

  if (inst.timings && inst.timings.length) {
    return inst.timings;
  }

  return [];
};
