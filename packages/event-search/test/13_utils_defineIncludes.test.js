'use strict';

const defineIncludes = require('../utils/defineIncludes');

const fxDefaultIncludes = require('./fixtures/defineIncludes/default.json');
const fxWithFormSchemaDetailed = require('./fixtures/defineIncludes/withFormSchemaDetailed.json');
const formSchemaWithRestrictedFields = require('./fixtures/defineIncludes/formSchemaWithRestrictedFields.json');

describe('event-search - unit: utils - defineIncludes', () => {
  const {
    baseSearchIncludes,
    detailedSearchIncludes,
  } = fxDefaultIncludes;

  const {
    formSchema,
  } = fxWithFormSchemaDetailed;

  it('non detailed only returns base fields', () => {
    const included = defineIncludes({
      baseSearchIncludes,
      detailedSearchIncludes,
    }, { detailed: false });

    expect(included).toEqual(baseSearchIncludes);
  });

  it('detailed returns fields specified in detailedSearchIncludes', () => {
    const included = defineIncludes({
      baseSearchIncludes,
      detailedSearchIncludes,
    }, { detailed: true });

    expect(detailedSearchIncludes.filter(f => included.includes(f)).length).toEqual(detailedSearchIncludes.length);
  });

  it('more general includes replace specific includes', () => {
    const included = defineIncludes({
      baseSearchIncludes: ['location.uid'],
      detailedSearchIncludes: ['location'],
    }, { detailed: true });

    expect(included).toEqual(['location']);
  });

  it(
    'if formSchema is given, formSchema additional fields are included',
    () => {
      const included = defineIncludes({
        baseSearchIncludes,
        detailedSearchIncludes,
      }, { detailed: false, formSchema });

      const formSchemaFields = formSchema.fields
        .filter(f => f.schemaId !== null)
        .map(f => f.field);

      expect(included).toEqual(baseSearchIncludes.concat(formSchemaFields));
    },
  );

  it(
    'if formSchema is given and detailed is true, additionalFields and detailed fields are provided',
    () => {
      const included = defineIncludes({
        baseSearchIncludes,
        detailedSearchIncludes,
      }, { detailed: true, formSchema });

      const formSchemaFields = formSchema.fields
        .filter(f => f.schemaId !== null)
        .map(f => f.field);

      expect(detailedSearchIncludes.filter(f => included.includes(f)).length).toEqual(detailedSearchIncludes.length);
      expect(formSchemaFields.filter(f => included.includes(f)).length).toEqual(formSchemaFields.length);
    },
  );

  it(
    'if access restrictions are present but no access is specified, includes ignore restrictions',
    () => {
      const included = defineIncludes({
        baseSearchIncludes,
        detailedSearchIncludes,
      }, {
        formSchema: formSchemaWithRestrictedFields,
      });

      const formSchemaFields = formSchema.fields
        .filter(f => f.schemaId !== null)
        .map(f => f.field);

      expect(included).toEqual(baseSearchIncludes.concat(formSchemaFields));
    },
  );

  it(
    'if access restrictions are present and access is public, only public fields are included',
    () => {
      const included = defineIncludes({
        baseSearchIncludes,
        detailedSearchIncludes,
      }, {
        formSchema: formSchemaWithRestrictedFields,
        access: 'public',
      });

      ['custom_description', 'intermunicipal_interest', 'recurring'].forEach(restrictedField => {
        expect(included.includes(restrictedField)).toEqual(false);
      });
    },
  );

  it(
    'if access restrictions are present and access is specified, restricted fields with provided access are included',
    () => {
      const included = defineIncludes({
        baseSearchIncludes,
        detailedSearchIncludes,
      }, {
        formSchema: formSchemaWithRestrictedFields,
        access: 'moderator',
      });

      expect(included.includes('recurring')).toEqual(true);
    },
  );

  it(
    'when fields are listed in requested option, they are used to define base include list',
    () => {
      const included = defineIncludes({
        baseSearchIncludes,
        detailedSearchIncludes,
      }, {
        requested: ['uid'],
      });

      expect(included).toEqual(['uid']);
    },
  );

  it('fields provided in options when unknown are ignored', () => {
    const included = defineIncludes({
      baseSearchIncludes,
      detailedSearchIncludes,
    }, {
      requested: ['uid', 'truc'],
    });

    expect(included).toEqual(['uid']);
  });

  it(
    'if requested includes list sub-fields of location while detailed include is requested, result should include location key',
    () => {
      const included = defineIncludes({
        baseSearchIncludes: ['location.name'],
        detailedSearchIncludes: ['location'],
      }, {
        detailed: true,
        requested: ['location.uid', 'location.name'],
      });

      expect(included).toEqual(['location']);
    },
  );

  it('formSchema fields can be included', () => {
    const included = defineIncludes({
      baseSearchIncludes,
      detailedSearchIncludes,
    }, {
      formSchema,
      requested: ['uid', 'thematiques-bordeaux-metropole'],
    });

    expect(included).toEqual(['uid', 'thematiques-bordeaux-metropole']);
  });

  it('access restriction also applies to explicit fields', () => {
    const included = defineIncludes({
      baseSearchIncludes,
      detailedSearchIncludes,
    }, {
      requested: ['uid', 'recurring'],
      access: 'public',
    });

    expect(included).toEqual(['uid']);
  });
});
