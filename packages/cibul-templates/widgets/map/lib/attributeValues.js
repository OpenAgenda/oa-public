'use strict';

const get = elem => [{
  attr: 'data-cbctl',
  key: 'cbctl',
  fn: v => v.split('|')
}, {
  attr: 'data-coords',
  key: 'coords',
  fn: v => v.split('|')
}, {
  attr: 'data-tiles',
  key: 'tiles'
}, {
  attr: 'data-auto',
  key: 'auto',
  fn: v => !!v
}, {
  attr: 'data-lang',
  key: 'lang'
}, {
  attr: 'data-latitude',
  key: 'latitude'
}, {
  attr: 'data-longitude',
  key: 'longitude'
}, {
  attr: 'data-zoom',
  key: 'zoom'
}, {
  attr: 'data-event-uid',
  key: 'eventUid'
}, {
  attr: 'data-style',
  key: 'style'
}].reduce((values, { attr, key, fn }) => {
  if (elem.hasAttribute(attr)) {
    const raw = elem.getAttribute(attr);
    values[key] = fn ? fn(raw) : raw;
  }
  return values;
}, {});

module.exports.get = get;

module.exports.has = elem => !!Object.keys(get(elem)).length;