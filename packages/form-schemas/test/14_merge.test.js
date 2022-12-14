'use strict';

const _ = require('lodash');

const merge = require('../iso/merge');

describe('unit - assigning schema properties to another schema', () => {
  describe('simple merge', () => {
    let merged;

    beforeAll(() => {
      const networkSchema = {
        id: 1,
        type: 'network',
        fields: [{
          field: 'somenetworkfield',
          fieldType: 'checkbox',
          options: [{
            id: 1,
            value: 'dogs',
            label: 'Dogs',
          }, {
            id: 2,
            value: 'tics',
            label: 'Tics',
          }],
        }],
      };

      const agendaSchema = {
        id: 2,
        type: 'agenda',
        fields: [{
          field: 'someagendafield',
          fieldType: 'radio',
          options: [{
            id: 1,
            value: 'clubs',
            label: 'Clubs',
          }, {
            id: 2,
            value: 'comite',
            label: 'Comités',
          }],
        }],
      };

      merged = merge(networkSchema, agendaSchema);
    });

    it(
      'in each field, type of schema where field is defined is provided in schemaType key',
      () => {
        expect(merged.fields.map(f => _.pick(f, ['field', 'schemaType']))).toStrictEqual(
          [
            { field: 'someagendafield', schemaType: 'agenda' },
            { field: 'somenetworkfield', schemaType: 'network' },
          ],
        );
      },
    );

    it('ids of options of merged schemas are no longer unique', () => {
      expect(merged.fields.map(f => f.options)).toStrictEqual(
        [
          [
            { id: 1, value: 'clubs', label: 'Clubs' },
            { id: 2, value: 'comite', label: 'Comités' },
          ], [
            { id: 1, value: 'dogs', label: 'Dogs' },
            { id: 2, value: 'tics', label: 'Tics' },
          ],
        ],
      );
    });

    it('in-field identifier of schema shows where field was defined', () => {
      expect(merged.fields.map(f => _.pick(f, ['field', 'schemaId']))).toStrictEqual(
        [{
          field: 'someagendafield',
          schemaId: 2,
        }, {
          field: 'somenetworkfield',
          schemaId: 1,
        }],
      );
    });
  });

  describe('filter by access', () => {
    const networkSchema = {
      id: 1,
      fields: [{
        field: 'somenetworkfield',
        fieldType: 'checkbox',
        options: [{
          id: 1,
          value: 'dogs',
          label: 'Dogs',
        }, {
          id: 2,
          value: 'tics',
          label: 'Tics',
        }],
      }],
    };

    const agendaSchema = {
      id: 2,
      fields: [{
        field: 'someagendafield',
        read: ['administrator'],
        write: ['administrator', 'moderator'],
        fieldType: 'radio',
        options: [{
          id: 1,
          value: 'clubs',
          label: 'Clubs',
        }, {
          id: 2,
          value: 'comite',
          label: 'Comités',
        }],
      }],
    };

    it('if access option is not provided, all fields are returned', () => {
      expect(
        merge(networkSchema, agendaSchema)
          .fields
          .map(f => f.field),
      ).toStrictEqual(['someagendafield', 'somenetworkfield']);
    });

    it(
      'if access option is provided and field does not include provided value, field is excluded',
      () => {
        expect(
          merge(networkSchema, agendaSchema, { access: { read: 'contributor' } }).fields
            .map(f => f.field),
        ).toStrictEqual(
          ['somenetworkfield'],
        );
      },
    );

    it(
      'if access option is provided and field includes provided value, field is included',
      () => {
        expect(
          merge(networkSchema, agendaSchema, { access: { read: 'administrator' } }).fields
            .map(f => f.field),
        ).toStrictEqual(
          ['someagendafield', 'somenetworkfield'],
        );
      },
    );

    it(
      'if both read and write access options are provided and field does not match for one, field is excluded',
      () => {
        expect(
          merge(networkSchema, agendaSchema, {
            access: {
              read: 'moderator',
              write: 'moderator',
            },
          }).fields.map(f => f.field),
        ).toStrictEqual(
          ['somenetworkfield'],
        );
      },
    );
  });

  describe('other', () => {
    // ids will need to be prefixed by formschema id before they can make sense
    it('order of fields is dictated by outer-most schema', () => {
      const eventSchema = {
        fields: [{
          field: 'title',
          fieldType: 'text',
          label: 'Le titre',
        }, {
          field: 'description',
          fieldType: 'text',
          label: 'La description',
        }],
      };

      const networkSchema = {
        fields: [{
          field: 'theme',
          fieldType: 'text',
          label: 'Thème',
        }],
      };

      const agendaSchema = {
        fields: [{
          field: 'title',
          fieldType: 'abstract',
          label: 'Nom de la manifestation',
        }, {
          field: 'participants',
          fieldType: 'integer',
          label: 'Participants',
        }, {
          field: 'description',
          fieldType: 'abstract',
        }],
      };

      expect(
        merge(eventSchema, networkSchema, agendaSchema).fields.map(f => f.field),
      ).toStrictEqual(
        ['title', 'participants', 'description', 'theme'],
      );
    });

    it('merge extends schemas', () => {
      const s1 = {
        id: 1,
        fields: [{
          field: 'participants',
          optional: false,
          fieldType: 'integer',
          label: 'Participants',
          info: 'Combien de participants',
        }, {
          field: 'keywords',
          fieldType: 'keywords',
          optional: true,
          max: 255,
          label: 'Mots clés',
        }],
      };

      const s2 = {
        id: 2,
        fields: [{
          field: 'organizer',
          optional: false,
          fieldType: 'text',
          label: 'Organizer',
        }, {
          field: 'keywords',
          fieldType: 'abstract',
          display: false,
        }],
      };

      const s3 = {
        id: 3,
        fields: [{
          field: 'budget',
          optional: false,
          fieldType: 'text',
          label: 'Budget',
        }],
      };

      expect(
        merge(s1, s2, s3),
      ).toStrictEqual(
        {
          custom: {},
          fields: [{
            field: 'budget',
            optional: false,
            fieldType: 'text',
            label: 'Budget',
            schemaId: 3,
            schemaType: null,
          }, {
            field: 'organizer',
            optional: false,
            fieldType: 'text',
            label: 'Organizer',
            schemaId: 2,
            schemaType: null,
          }, {
            field: 'keywords',
            fieldType: 'keywords',
            label: 'Mots clés',
            max: 255,
            optional: true,
            display: false,
            schemaId: 1,
            schemaType: null,
          }, {
            field: 'participants',
            optional: false,
            fieldType: 'integer',
            label: 'Participants',
            info: 'Combien de participants',
            schemaId: 1,
            schemaType: null,
          }],
        },
      );
    });

    it('merge can render optional field non-optional', () => {
      const schema = {
        fields: [{
          field: 'image',
          fieldType: 'text',
          label: 'Image',
          optional: true,
        }, {
          field: 'imageCredits',
          fieldType: 'text',
          optional: true,
          label: 'Image credits',
          enableWith: 'image',
        }],
      };

      const abstract = {
        fields: [{
          field: 'imageCredits',
          fieldType: 'abstract',
          optional: false,
        }],
      };

      expect(merge(schema, abstract).fields.filter(f => f.field === 'imageCredits')[0].optional).toBeFalsy();
    });

    it('merge can relabel fields', () => {
      const schema = {
        id: 1,
        fields: [{
          field: 'participants',
          optional: true,
          fieldType: 'integer',
          min: null,
          max: null,
          label: {
            fr: 'Participants',
            en: 'Participants',
          },
          info: {
            fr: 'Combien de participants',
            en: 'How many participants',
          },
          placeholder: null,
          sub: null,
        }],
      };

      const abstract = {
        id: 2,
        fields: [{
          field: 'participants',
          fieldType: 'abstract',
          label: {
            fr: 'Les gens',
            en: 'People',
          },
          info: {
            fr: 'Combien de gens',
            en: 'How many people',
          },
        }],
      };

      expect(
        merge(schema, abstract),
      ).toStrictEqual(
        {
          custom: {},
          fields: [{
            field: 'participants',
            optional: true,
            fieldType: 'integer',
            min: null,
            max: null,
            label: {
              fr: 'Les gens',
              en: 'People',
            },
            info: {
              fr: 'Combien de gens',
              en: 'How many people',
            },
            placeholder: null,
            sub: null,
            schemaId: 1,
            schemaType: null,
          }],
        },
      );
    });

    it(
      'an abstract field is maintained as abstract as long as no field with the same name is added to the merge',
      () => {
        const schema = {
          id: 1,
          fields: [{
            field: 'title',
            fieldType: 'text',
            label: 'Titre',
          }],
        };

        const abstract = {
          id: 2,
          fields: [{
            field: 'references',
            fieldType: 'abstract',
            label: 'Références',
          }],
        };

        expect(merge(schema, abstract)).toStrictEqual(
          {
            custom: {},
            fields: [{
              field: 'references',
              fieldType: 'abstract',
              label: 'Références',
              schemaId: null,
              schemaType: null,
            }, {
              field: 'title',
              fieldType: 'text',
              label: 'Titre',
              schemaId: 1,
              schemaType: null,
            }],
          },
        );
      },
    );

    it('all values of an abstract field trickle down to merge', () => {
      const schema = {
        id: 1,
        fields: [{
          field: 'references',
          label: 'Evénements liés',
          fieldType: 'references',
          suggest: false,
          related: ['title', 'description', 'location'],
          res: '/references',
        }],
      };

      const abstract = {
        id: 2,
        fields: [{
          field: 'references',
          fieldType: 'abstract',
          suggest: true,
        }],
      };

      expect(merge(schema, abstract)).toStrictEqual(
        {
          custom: {},
          fields: [{
            field: 'references',
            label: 'Evénements liés',
            fieldType: 'references',
            suggest: true,
            related: ['title', 'description', 'location'],
            res: '/references',
            schemaId: 1,
            schemaType: null,
          }],
        },
      );
    });

    it('null schemas are ignored', () => {
      const schema = {
        id: 1,
        fields: [{
          field: 'title',
          fieldType: 'text',
          label: 'Titre',
        }],
      };

      expect(merge(null, schema)).toStrictEqual(
        {
          custom: {},
          fields: [{
            field: 'title',
            fieldType: 'text',
            label: 'Titre',
            schemaId: 1,
            schemaType: null,
          }],
        },
      );

      expect(merge(schema, null)).toStrictEqual(
        {
          custom: {},
          fields: [{
            field: 'title',
            fieldType: 'text',
            label: 'Titre',
            schemaId: 1,
            schemaType: null,
          }],
        },
      );
    });

    it('origin value is maintained when present', () => {
      const schema = {
        id: 1,
        fields: [{
          field: 'chooseyouravatar',
          fieldType: 'radio',
          optional: true,
          origin: 'tags',
          options: [{
            label: 'Retarded cat',
            id: 1,
          }, {
            label: 'Phteven',
            id: 2,
          }],
        }],
      };

      const otherSchema = {
        id: 1,
        fields: [{
          field: 'title',
          fieldType: 'text',
          label: 'Titre',
          origin: 'custom',
        }],
      };

      const merged = merge(schema, otherSchema);

      expect(merged.fields.map(f => f.origin)).toStrictEqual(['custom', 'tags']);
    });

    it('origin value is maintained', () => {
      const schema = {
        id: 1,
        fields: [{
          field: 'chooseyouravatar',
          fieldType: 'radio',
          optional: true,
          origin: 'tags',
          options: [{
            label: 'Retarded cat',
            id: 1,
          }, {
            label: 'Phteven',
            id: 2,
          }],
        }],
      };

      const otherSchema = {
        id: 1,
        fields: [{
          field: 'chooseyouravatar',
          fieldType: 'abstract',
          origin: null,
        }],
      };

      const merged = merge(schema, otherSchema);

      expect(merged.fields[0].origin).toBe('tags');
    });

    it('options can be limited to allowed set through a schema merge', () => {
      const schema = {
        id: 1,
        fields: [{
          field: 'chooseyouravatar',
          fieldType: 'radio',
          optional: true,
          options: [{
            label: 'Retarded cat',
            id: 1,
          }, {
            label: 'Phteven',
            id: 2,
          }],
        }],
      };

      const restrictiveSchema = {
        id: 2,
        fields: [{
          field: 'chooseyouravatar',
          fieldType: 'abstract',
          allowedOptions: [2],
        }],
      };

      expect(merge(schema, restrictiveSchema).fields).toStrictEqual(
        [{
          field: 'chooseyouravatar',
          fieldType: 'radio',
          optional: true,
          options: [{
            label: 'Phteven',
            id: 2,
          }],
          schemaId: 1,
          schemaType: null,
        }],
      );
    });
  });
});
