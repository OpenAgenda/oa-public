'use strict';

const schema = require('@openagenda/validators/schema');
const boolean = require('@openagenda/validators/boolean');
const choice = require('@openagenda/validators/choice');
const text = require('@openagenda/validators/text');
const link = require('@openagenda/validators/link');

schema.register({
  text,
  link,
  choice,
  boolean
});

const fieldCollection = (type, codes, defaultValue) => codes.reduce((fields, code) => ({
  ...fields,
  [code]: {
    type,
    default: defaultValue
  }
}), {});

module.exports = schema({
  facebookappid: {
    type: 'text',
    default: false,
    max: 100
  },
  siteurl: {
    type: 'link',
    default: '',
    max: 1000
  },
  layout: {
    lang: {
      type: 'text',
      default: 'en',
      max: 2,
      min: 2
    },
    mapTiles: {
      type: 'link',
      default: false
    },
    mapPositionMode: {
      type: 'choice',
      unique: true,
      options: ['all', 'manual'],
      default: 'all'
    },
    mapCorners: fieldCollection('number', ['neLat', 'neLng', 'swLat', 'swLng'], null),
    mapAuto: {
      type: 'boolean',
      default: false
    },
    layoutmode: {
      type: 'choice',
      options: ['standard', 'tiled', 'cascading', 'nocss'],
      default: 'standard',
      unique: true
    },
    autoscroll: {
      type: 'boolean',
      default: true
    },
    use_event_slug: {
      type: 'boolean',
      default: false
    },
    synchref: {
      type: 'boolean',
      default: true
    },
    customcss: {
      type: 'text',
      default: false
    },
    linkcss: {
      type: 'link',
      default: false
    },
    use_default_css: fieldCollection('boolean', ['list', 'map', 'search', 'categories', 'tags', 'calendar'], true),
    shares: fieldCollection('boolean', ['fb', 'tw', 'li', 'pi', 'em'], false)
  }
});
