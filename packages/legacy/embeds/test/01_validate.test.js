'use strict';

const validate = require('../service/lib/validate');

describe('01 - embeds - validate', () => {
  describe('root', () => {
    const defaults = validate();

    it('facebookappid is false by default', () => {
      expect(defaults.config.facebookappid).toBe(false);
    });

    it('siteurl is empty string by default', () => {
      expect(defaults.config.siteurl).toBe('');
    });

    it('facebookappid is a string', () => {
      const {
        config: {
          facebookappid
        }
      } = validate({
        config: {
          facebookappid: '123'
        }
      });

      expect(facebookappid).toBe('123');
    });

    it('siteurl is a link', () => {
      const {
        config: {
          siteurl
        }
      } = validate({
        config: {
          siteurl: 'https://openagenda.com'
        }
      });

      expect(siteurl).toBe('https://openagenda.com');
    });
  });

  describe('layout', () => {
    const defaults = validate();

    it('lang is en by default', () => {
      expect(defaults.config.layout.lang).toEqual('en');
    });

    it('lang is 2 characters long', () => {
      const errors = {};
      try {
        validate({
          config: {
            layout: {
              lang: 'fra'
            }
          }
        });
      } catch (e) {
        errors.long = e;
      }
      try {
        validate({
          config: {
            layout: {
              lang: 'f'
            }
          }
        });
      } catch (e) {
        errors.short = e;
      }
      expect(errors.long.info.errors[0].code).toBe('string.toolong');
      expect(errors.short.info.errors[0].code).toBe('string.tooshort');
    });

    it('mapTiles is false when not specified', () => {
      const {
        layout
      } = defaults.config;

      expect(layout.mapTiles).toEqual(false);
    });

    it('mapTiles can be a tile link', () => {
      const tiles = 'https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}@2x.png?apiKey=9f8da49724b645f48';

      const {
        config: {
          layout
        }
      } = validate({
        config: {
          layout: {
            mapTiles: tiles
          }
        }
      });

      expect(layout.mapTiles).toBe(tiles);
    });

    it('layoutmode is standard by default', () => {
      const {
        layout
      } = defaults.config;

      expect(layout.layoutmode).toBe('standard');
    });

    it('layoutmode can be tiled', () => {
      const {
        config: {
          layout
        }
      } = validate({
        config: {
          layout: {
            layoutmode: 'tiled'
          }
        }
      });

      expect(layout.layoutmode).toBe('tiled');
    });

    it('autoscroll is true if unspecified', () => {
      const {
        layout
      } = defaults.config;

      expect(layout.autoscroll).toBe(true);
    });

    it('use_event_slug is false by default', () => {
      const {
        layout
      } = defaults.config;

      expect(layout.use_event_slug).toBe(false);
    });

    it('use_default_css is an object of truths by default', () => {
      const {
        layout
      } = defaults.config;

      expect(layout.use_default_css).toEqual({
        list: true,
        map: true,
        search: true,
        categories: true,
        tags: true,
        calendar: true
      });
    });

    it('shares defaults are false', () => {
      expect(defaults.config.layout.shares).toEqual({
        fb: false,
        tw: false,
        li: false,
        pi: false,
        em: false
      });
    });
  });

  describe('templates', () => {
    it('templates are in template key', () => {
      const clean = validate({
        template: {
          header: 'something'
        }
      });

      expect(clean.template.header).toBe('something');
    });
  });
});
