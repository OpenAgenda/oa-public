import mapper from '../src/utils/mapper';

const fieldsMap = [
  {
    db: 'id',
    obj: 'id',
    protected: true, // field is protected to modifications
    internal: true, // field is visible only with this option set to true
    // json: true // format/parse this field as json
  },
  {
    db: 'type',
    obj: 'type',
  },
  {
    db: 'identifier',
    obj: 'identifier',
  },
  {
    db: 'deleted_at',
    obj: 'deletedAt',
    protected: true,
  },
  {
    db: 'store',
    obj: 'store',
    json: true,
  },
  {
    db: 'unused',
    obj: 'unused',
  },
  {
    db: 'detailed_field',
    obj: 'detailedField',
    detailed: true,
  },
];

describe('database mapper util', () => {
  describe('insert', () => {
    test('toDb insert with default options', () => {
      expect(
        mapper.toDb(fieldsMap, 'insert', {
          id: 12,
          type: 'agenda',
          identifier: 48,
          deletedAt: true,
          store: { settings: 42 },
          notAllowedProperty: 'Scheiße',
          detailedField: 'test',
        })
      ).toEqual({
        type: 'agenda',
        identifier: 48,
        store: '{"settings":42}',
        detailed_field: 'test',
      });
    });

    test('toDb insert with { protected: false } options', () => {
      expect(
        mapper.toDb(
          fieldsMap,
          'insert',
          {
            id: 12,
            type: 'agenda',
            identifier: 48,
            deletedAt: true,
            store: { settings: 42 },
            detailedField: 'test',
          },
          {
            protected: false,
          }
        )
      ).toEqual({
        id: 12,
        type: 'agenda',
        identifier: 48,
        deleted_at: true,
        store: '{"settings":42}',
        detailed_field: 'test',
      });
    });

    test('toObj with default options', () => {
      expect(
        mapper.toObj(fieldsMap, {
          id: 12,
          type: 'agenda',
          identifier: 48,
          deleted_at: true,
          store: '{"settings":42}',
          not_allowed_property: 'Scheiße',
          detailedField: 'test',
        })
      ).toEqual({
        type: 'agenda',
        identifier: 48,
        deletedAt: true,
        store: { settings: 42 },
      });
    });

    test('toObj with { internal: true } options', () => {
      expect(
        mapper.toObj(
          fieldsMap,
          {
            id: 12,
            type: 'agenda',
            identifier: 48,
            deleted_at: true,
            store: '{"settings":42}',
            detailed_field: 'test',
          },
          {
            internal: true,
          }
        )
      ).toEqual({
        id: 12,
        type: 'agenda',
        identifier: 48,
        deletedAt: true,
        store: { settings: 42 },
      });
    });
  });

  describe('update', () => {
    test('toDb update with default options', () => {
      expect(
        mapper.toDb(fieldsMap, 'update', {
          id: 12,
          type: 'agenda',
          identifier: 48,
          deletedAt: true,
          store: { settings: 42 },
          detailedField: 'test',
        })
      ).toEqual({
        type: 'agenda',
        identifier: 48,
        store: '{"settings":42}',
        detailed_field: 'test',
      });
    });

    test('toDb update with { protected: false } options', () => {
      expect(
        mapper.toDb(
          fieldsMap,
          'update',
          {
            id: 12,
            type: 'agenda',
            identifier: 48,
            deletedAt: true,
            store: { settings: 42 },
            detailedField: 'test',
          },
          {
            protected: false,
          }
        )
      ).toEqual({
        id: 12,
        type: 'agenda',
        identifier: 48,
        deleted_at: true,
        store: '{"settings":42}',
        detailed_field: 'test',
      });
    });
  });

  describe('select', () => {
    test('toDb select with default options', () => {
      expect(
        mapper.toDb(fieldsMap, 'select', {
          id: 12,
          type: 'agenda',
          identifier: 48,
          deletedAt: true,
          store: { settings: 42 },
          detailedField: 'test',
        })
      ).toEqual({
        type: 'agenda',
        identifier: 48,
        deleted_at: true,
        store: '{"settings":42}',
      });
    });

    test('toDb select with { internal: true } options', () => {
      expect(
        mapper.toDb(
          fieldsMap,
          'select',
          {
            id: 12,
            type: 'agenda',
            identifier: 48,
            deletedAt: true,
            store: { settings: 42 },
            detailedField: 'test',
          },
          {
            internal: true,
          }
        )
      ).toEqual({
        id: 12,
        type: 'agenda',
        identifier: 48,
        deleted_at: true,
        store: '{"settings":42}',
      });
    });

    test('toDb select with { detailed: true } options', () => {
      expect(
        mapper.toDb(
          fieldsMap,
          'select',
          {
            id: 12,
            type: 'agenda',
            identifier: 48,
            deletedAt: true,
            store: { settings: 42 },
            detailedField: 'test',
          },
          {
            detailed: true,
          }
        )
      ).toEqual({
        type: 'agenda',
        identifier: 48,
        deleted_at: true,
        store: '{"settings":42}',
        detailed_field: 'test',
      });
    });

    test('listFields select for db with default options', () => {
      expect(mapper.listFields(fieldsMap, 'select', 'db')).toEqual([
        'type',
        'identifier',
        'deleted_at',
        'store',
        'unused',
      ]);
    });

    test('listFields select for db with { internal: true } options', () => {
      expect(
        mapper.listFields(fieldsMap, 'select', 'db', { internal: true })
      ).toEqual(['id', 'type', 'identifier', 'deleted_at', 'store', 'unused']);
    });

    test('listFields select for obj with default options', () => {
      expect(mapper.listFields(fieldsMap, 'select', 'obj')).toEqual([
        'type',
        'identifier',
        'deletedAt',
        'store',
        'unused',
      ]);
    });

    test('listFields select for obj with { internal: true } options', () => {
      expect(
        mapper.listFields(fieldsMap, 'select', 'obj', { internal: true })
      ).toEqual(['id', 'type', 'identifier', 'deletedAt', 'store', 'unused']);
    });
  });
});
