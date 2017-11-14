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
    obj: 'type'
  },
  {
    db: 'identifier',
    obj: 'identifier'
  },
  {
    db: 'deleted_at',
    obj: 'deletedAt',
    protected: true
  },
  {
    db: 'store',
    obj: 'store',
    json: true
  },
  {
    db: 'unused',
    obj: 'unused'
  }
];

describe( 'database mapper util', () => {

  describe( 'insert', () => {

    test( 'toDb insert with default options', () => {

      mapper.toDb( fieldsMap, 'insert', {
        id: 12,
        type: 'agenda',
        identifier: 48,
        deletedAt: true,
        store: { settings: 42 },
        notAllowedProperty: 'Scheiße'
      } ).should.eql( {
        type: 'agenda',
        identifier: 48,
        store: '{"settings":42}'
      } );

    } );

    test( 'toDb insert with { protected: false } options', () => {

      mapper.toDb( fieldsMap, 'insert', {
        id: 12,
        type: 'agenda',
        identifier: 48,
        deletedAt: true,
        store: { settings: 42 }
      }, {
        protected: false
      } ).should.eql( {
        id: 12,
        type: 'agenda',
        identifier: 48,
        deleted_at: true,
        store: '{"settings":42}'
      } );

    } );

    test( 'toObj with default options', () => {

      mapper.toObj( fieldsMap, {
        id: 12,
        type: 'agenda',
        identifier: 48,
        deleted_at: true,
        store: '{"settings":42}',
        notAllowedProperty: 'Scheiße'
      } ).should.eql( {
        type: 'agenda',
        identifier: 48,
        deletedAt: true,
        store: { settings: 42 }
      } );

    } );

    test( 'toObj with { internal: true } options', () => {

      mapper.toObj( fieldsMap, {
        id: 12,
        type: 'agenda',
        identifier: 48,
        deleted_at: true,
        store: '{"settings":42}'
      }, {
        internal: true
      } ).should.eql( {
        id: 12,
        type: 'agenda',
        identifier: 48,
        deletedAt: true,
        store: { settings: 42 }
      } );

    } );

  } );

  describe( 'update', () => {

    test( 'toDb update with default options', () => {

      mapper.toDb( fieldsMap, 'update', {
        id: 12,
        type: 'agenda',
        identifier: 48,
        deletedAt: true,
        store: { settings: 42 }
      } ).should.eql( {
        type: 'agenda',
        identifier: 48,
        store: '{"settings":42}'
      } );

    } );

    test( 'toDb update with { protected: false } options', () => {

      mapper.toDb( fieldsMap, 'update', {
        id: 12,
        type: 'agenda',
        identifier: 48,
        deletedAt: true,
        store: { settings: 42 }
      }, {
        protected: false
      } ).should.eql( {
        id: 12,
        type: 'agenda',
        identifier: 48,
        deleted_at: true,
        store: '{"settings":42}'
      } );

    } );

  } );

  describe( 'select', () => {

    test( 'toDb select with default options', () => {

      mapper.toDb( fieldsMap, 'select', {
        id: 12,
        type: 'agenda',
        identifier: 48,
        deletedAt: true,
        store: { settings: 42 }
      } ).should.eql( {
        type: 'agenda',
        identifier: 48,
        deleted_at: true,
        store: '{"settings":42}'
      } );

    } );

    test( 'toDb select with { internal: true } options', () => {

      mapper.toDb( fieldsMap, 'select', {
        id: 12,
        type: 'agenda',
        identifier: 48,
        deletedAt: true,
        store: { settings: 42 }
      }, {
        internal: true
      } ).should.eql( {
        id: 12,
        type: 'agenda',
        identifier: 48,
        deleted_at: true,
        store: '{"settings":42}'
      } );

    } );

    test( 'listFields select for db with default options', () => {

      mapper.listFields( fieldsMap, 'select', 'db' )
        .should.eql( [ 'type', 'identifier', 'deleted_at', 'store', 'unused' ] );

    } );

    test( 'listFields select for db with { internal: true } options', () => {

      mapper.listFields( fieldsMap, 'select', 'db', { internal: true } )
        .should.eql( [ 'id', 'type', 'identifier', 'deleted_at', 'store', 'unused' ] );

    } );

    test( 'listFields select for obj with default options', () => {

      mapper.listFields( fieldsMap, 'select', 'obj' )
        .should.eql( [ 'type', 'identifier', 'deletedAt', 'store', 'unused' ] );

    } );

    test( 'listFields select for obj with { internal: true } options', () => {

      mapper.listFields( fieldsMap, 'select', 'obj', { internal: true } )
        .should.eql( [ 'id', 'type', 'identifier', 'deletedAt', 'store', 'unused' ] );

    } );

  } );

} );
