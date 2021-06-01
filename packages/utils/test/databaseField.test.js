'use strict';

const databaseField = require('../fields/databaseField');

describe('databaseField', () => {
  describe('getName', () => {
    it('gets the name of the column where the field value is stored', () => {
      const name = databaseField.getName({
        field: 'state',
        optional: true,
        db: {
          type: 'json',
          field: 'store.state',
          assign: true
        },
        fieldType: 'choice',
        unique: true,
        read: ['internal', 'public', 'list' ],
        write: ['internal', 'administrator', 'moderator', 'contributor' ],
        default: 0,
        options: [0, 1]
      });

      expect(name).toBe('store');
    });
  });
});