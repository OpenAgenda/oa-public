'use strict';

const _ = require('lodash');

const iso = require('../iso');

const customValidator = require('../stories/custom/wigglypoof.validator');

describe('form-schemas -06- validateField', () => {
  describe('simple cases', () => {
    it('validates a text field definition', () => {
      expect(iso.validateField({
        field: 'atextfield',
        fieldType: 'text',
        label: {
          fr: 'Un champ texte'
        }
      })).toStrictEqual({
        field: 'atextfield',
        label: { fr: 'Un champ texte' },
        info: null,
        placeholder: null,
        optional: undefined,
        optionalWith: null,
        read: null,
        write: null,
        display: true,
        min: null,
        max: null,
        sub: null,
        help: null,
        helpLink: null,
        helpContent: null,
        fieldType: 'text',
        origin: null,
        enableWith: null,
        related: {
          enable: [],
          optional: []
        },
        default: undefined,
        constraints: undefined,
        selfHandled: [],
        enable: true
      });
    });

    it('field labels can be strings', () => {
      expect(iso.validateField({
        field: 'atextfield',
        fieldType: 'text',
        label: 'Un champ texte'
      }).label).toBe('Un champ texte');
    });

    it('validates a multilingual text field definition', () => {
      expect(iso.validateField({
        field: 'amultilingualtextfield',
        fieldType: 'text',
        languages: ['fr', 'en', 'it'],
        label: {
          fr: 'Un champ texte multilingue'
        }
      })).toStrictEqual({
        field: 'amultilingualtextfield',
        label: { fr: 'Un champ texte multilingue' },
        info: null,
        placeholder: null,
        sub: null,
        help: null,
        helpLink: null,
        helpContent: null,
        write: null,
        read: null,
        optional: undefined,
        optionalWith: null,
        display: true,
        origin: null,
        languages: ['fr', 'en', 'it'],
        min: null,
        max: null,
        fieldType: 'text',
        enableWith: null,
        related: {
          enable: [],
          optional: []
        },
        default: undefined,
        constraints: undefined,
        selfHandled: [],
        enable: true
      });
    });

    it('validates a radio field definition', () => {
      expect(iso.validateField({
        field: 'anoptionlist',
        fieldType: 'radio',
        label: { fr: 'Choix multiples' },
        options: [{
          value: 1,
          label: { fr: 'Un' }
        }, {
          value: 2,
          label: { fr: 'Deux' }
        }],
        origin: null
      })).toStrictEqual({
        field: 'anoptionlist',
        label: { fr: 'Choix multiples' },
        info: null,
        placeholder: null,
        sub: null,
        help: null,
        helpLink: null,
        helpContent: null,
        read: null,
        write: null,
        optional: undefined,
        optionalWith: null,
        display: true,
        options: [
          {
            id: undefined,
            value: '1',
            label: { fr: 'Un' },
            display: true,
            info: null
          },
          {
            id: undefined,
            value: '2',
            label: { fr: 'Deux' },
            display: true,
            info: null
          }
        ],
        fieldType: 'radio',
        origin: null,
        enableWith: null,
        related: {
          enable: [],
          optional: []
        },
        default: undefined,
        constraints: undefined,
        selfHandled: [],
        enable: true
      });
    });

    it('radio field definition can be monolingual', () => {
      expect(iso.validateField({
        field: 'anoptionlist',
        fieldType: 'radio',
        label: 'Choix multiples',
        options: [{
          id: 1,
          value: '1',
          label: 'Un'
        }, {
          id: 2,
          value: '2',
          label: 'Deux'
        }],
        origin: null
      }).options).toStrictEqual([{
        id: 1,
        value: '1',
        label: 'Un',
        display: true,
        info: null
      }, {
        id: 2,
        value: '2',
        label: 'Deux',
        display: true,
        info: null
      }]);
    });

    it('validates a text field that includes min and max', () => {
      expect(iso.validateField({
        field: 'atextfield',
        fieldType: 'textarea',
        label: { fr: 'Un champ de texte libre' },
        info: { fr: 'Avec un détail explicatif' },
        min: 3,
        max: 10,
        origin: null
      })).toStrictEqual({
        field: 'atextfield',
        label: { fr: 'Un champ de texte libre' },
        info: { fr: 'Avec un détail explicatif' },
        placeholder: null,
        sub: null,
        help: null,
        helpLink: null,
        helpContent: null,
        read: null,
        write: null,
        optional: undefined,
        optionalWith: null,
        display: true,
        min: 3,
        max: 10,
        fieldType: 'textarea',
        origin: null,
        enableWith: null,
        related: {
          enable: [],
          optional: []
        },
        default: undefined,
        constraints: undefined,
        selfHandled: [],
        enable: true
      });
    });

    it('validate a field requiring a custom validator', () => {
      expect(iso.validateField({
        field: 'acustomfield',
        fieldType: 'someCustomType',
        label: {
          fr: 'Un champ au type personnalisé'
        }
      }, {
        custom: {
          someCustomType: customValidator
        }
      })).toStrictEqual({
        field: 'acustomfield',
        label: { fr: 'Un champ au type personnalisé' },
        info: null,
        placeholder: null,
        sub: null,
        help: null,
        helpLink: null,
        helpContent: null,
        write: null,
        read: null,
        optional: undefined,
        optionalWith: null,
        display: true,
        origin: null,
        fieldType: 'someCustomType',
        min: null,
        max: null,
        enableWith: null,
        related: {
          enable: [],
          optional: []
        },
        default: undefined,
        constraints: undefined,
        selfHandled: [],
        enable: true
      });
    });

    it('validate a field with labels specified only in one language', () => {
      expect(iso.validateField({
        field: 'afield',
        fieldType: 'text',
        label: 'A monolingual label',
      }, { defaultLabelLanguage: 'fr' }).label)
        .toStrictEqual({
          fr: 'A monolingual label'
        });
    });

    it('abstract fields do not have required values', () => {
      expect(iso.validateField({
        field: 'afield',
        fieldType: 'abstract',
        optional: false
      })).toStrictEqual({
        field: 'afield',
        optional: false,
        fieldType: 'abstract'
      });
    });

    it(
      'a field with an enableWith value set will have the value added to the related fields list',
      () => {
        expect(iso.validateField({
          field: 'afield',
          fieldType: 'text',
          label: 'A label',
          enableWith: 'anotherfield'
        }).related).toStrictEqual({ enable: ['anotherfield'], optional: [] });
      }
    );

    it('enableWith can be an object', () => {
      const field = iso.validateField({
        field: 'textfield',
        fieldType: 'text',
        optional: false,
        label: 'Write in that',
        info: 'Activated if "Or that" value is checked',
        enableWith: {
          field: 'checkboxes',
          value: 2
        }
      }, {
        custom: null,
        defaultLabelLanguage: 'fr',
        requireLabels: true
      });
      expect(field.enableWith).toStrictEqual({
        field: 'checkboxes',
        value: 2
      });
    });
  });

  describe('read and write field values', () => {
    it('defaults are null', () => {
      expect(_.pick(iso.validateField({
        field: 'afield',
        fieldType: 'text',
        label: 'A label',
      }), ['write', 'read'])).toStrictEqual({
        read: null,
        write: null
      });
    });

    it('multiple values can be specified', () => {
      expect(iso.validateField({
        field: 'f',
        fieldType: 'text',
        label: 'alabel',
        read: ['steve', 'janine']
      }).read).toStrictEqual(['steve', 'janine']);
    });
  });
});
