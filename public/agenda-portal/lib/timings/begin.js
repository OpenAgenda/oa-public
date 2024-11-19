export function getKey(timing) {
  return timing.start ? 'start' : 'begin';
}

export function getValue(timing) {
  return timing.start || timing.begin;
}
