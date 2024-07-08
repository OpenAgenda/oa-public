'use strict';

const cleanOptionedFields = require('../utils/cleanOptionedFields');
const event = require('./fixtures/filterByAccess/event.json');
const formSchema = require('./fixtures/filterByAccess/formSchema.json');

describe('cleanOptionFields', () => {
  it('already cleaned', () => {
    const cleanedEvent = cleanOptionedFields(event, formSchema);
    expect(cleanedEvent).toStrictEqual(event);
  });
  it('should clean optioned fields', () => {
    const cleanedEvent = cleanOptionedFields({ ...event, 'type-de-structure': 637 }, formSchema);
    expect(cleanedEvent?.['type-de-structure']).toBeUndefined();
  });
  it('should clean optioned fields in array', () => {
    const cleanedEvent = cleanOptionedFields({ ...event, particularites: [637, 776] }, formSchema);
    expect(cleanedEvent).toStrictEqual({ ...event, particularites: [776] });
  });
});
