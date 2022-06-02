'use strict';

const {
  BadRequest
} = require('@openagenda/verror');
const schema = require('@openagenda/validators/schema');
const boolean = require('@openagenda/validators/boolean');
const choice = require('@openagenda/validators/choice');
const number = require('@openagenda/validators/number');
const text = require('@openagenda/validators/text');
const link = require('@openagenda/validators/link');

schema.register({
  text,
  link,
  choice,
  boolean,
  number
});

const fieldCollection = (type, codes, options = {}) => codes.reduce((fields, code) => ({
  ...fields,
  [code]: {
    type,
    ...options
  }
}), {});

const validate = schema({
  config: {
    facebookappid: {
      type: 'text',
      default: false,
      max: 100
    },
    head: {
      type: 'text',
      default: ''
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
        type: 'text',
        default: false
      },
      mapPositionMode: {
        type: 'choice',
        unique: true,
        options: ['all', 'manual'],
        default: 'all'
      },
      mapCorners: fieldCollection('text', ['neLat', 'neLng', 'swLat', 'swLng'], null),
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
      use_default_css: fieldCollection('boolean', ['list', 'map', 'search', 'categories', 'tags', 'calendar'], { default: true }),
      shares: fieldCollection('boolean', ['fb', 'tw', 'li', 'pi', 'em'], { default: false })
    }
  },
  template: fieldCollection('text', ['header', 'event', 'eventitem'], { default: false, max: 10000 })
});

module.exports = (data = {}) => {
  try {
    const clean = validate(data);
    if (clean.config.layout.mapCorners.neLat === 'false') {
      Object.keys(clean.config.layout.mapCorners).forEach(corner => {
        clean.config.layout.mapCorner[corner] = false;
      });
    }
    ['customcss', 'mapTiles'].forEach(field => {
      if (clean.config.layout[field] === 'false') {
        clean.config.layout[field] = false;
      }
    });

    Object.keys(clean.template).forEach(type => {
      if (clean.template[type] === 'false') {
        clean.template[type] = false;
      }
    });
    return clean;
  } catch (errors) {
    throw new BadRequest({
      info: { errors },
      message: 'Submitted data is not valid'
    });
  }
};
