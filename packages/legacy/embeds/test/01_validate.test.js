'use strict';

const validate = require('../lib/validate');

describe('01 - embeds - validate', () => {
  describe('root', () => {
    const defaults = validate();

    it('facebookappid is false by default', () => {
      expect(defaults.facebookappid).toBe(false);
    });

    it('siteurl is empty string by default', () => {
      expect(defaults.siteurl).toBe('');
    });

    it('facebookappid is a string', () => {
      const {
        facebookappid
      } = validate({
        facebookappid: '123'
      });

      expect(facebookappid).toBe('123');
    });

    it('siteurl is a link', () => {
      const {
        siteurl
      } = validate({
        siteurl: 'https://openagenda.com'
      });

      expect(siteurl).toBe('https://openagenda.com');
    });
  });

  describe('layout', () => {
    const defaults = validate();

    it('lang is en by default', () => {
      expect(defaults.layout.lang).toEqual('en');
    });

    it('lang is 2 characters long', () => {
      const errors = {};
      try {
        validate({
          layout: {
            lang: 'fra'
          }
        });
      } catch (e) {
        errors.long = e;
      }
      try {
        validate({
          layout: {
            lang: 'f'
          }
        });
      } catch (e) {
        errors.short = e;
      }
      expect(errors.long[0].code).toBe('string.toolong');
      expect(errors.short[0].code).toBe('string.tooshort');
    });

    it('mapTiles is false when not specified', () => {
      const {
        layout
      } = defaults;

      expect(layout.mapTiles).toEqual(false);
    });

    it('mapTiles can be a tile link', () => {
      const tiles = 'https://maps.geoapify.com/v1/tile/positron/{z}/{x}/{y}@2x.png?apiKey=9f8da49724b645f48';

      const {
        layout
      } = validate({
        layout: {
          mapTiles: tiles
        }
      });

      expect(layout.mapTiles).toBe(tiles);
    });

    it('layoutmode is standard by default', () => {
      const {
        layout
      } = defaults;

      expect(layout.layoutmode).toBe('standard');
    });

    it('layoutmode can be tiled', () => {
      const {
        layout
      } = validate({
        layout: {
          layoutmode: 'tiled'
        }
      });

      expect(layout.layoutmode).toBe('tiled');
    });

    it('autoscroll is true if unspecified', () => {
      const {
        layout
      } = defaults;

      expect(layout.autoscroll).toBe(true);
    });

    it('use_event_slug is false by default', () => {
      const {
        layout
      } = defaults;

      expect(layout.use_event_slug).toBe(false);
    });

    it('use_default_css is an object of truths by default', () => {
      const {
        layout
      } = defaults;

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
      expect(defaults.layout.shares).toEqual({
        fb: false,
        tw: false,
        li: false,
        pi: false,
        em: false
      });
    });
  });
});
