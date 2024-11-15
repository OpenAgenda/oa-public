import cleanOptionedFields from '../utils/cleanOptionedFields.js';
import event from './fixtures/filterByAccess/event.json' with { type: 'json' };
import formSchema from './fixtures/filterByAccess/formSchema.json' with { type: 'json' };

describe('cleanOptionFields', () => {
  it('already cleaned', () => {
    const cleanedEvent = cleanOptionedFields(event, formSchema);
    expect(cleanedEvent).toStrictEqual({ ...event });
  });
  it('should clean optioned fields', () => {
    const cleanedEvent = cleanOptionedFields(
      { ...event, 'type-de-structure': 637 },
      formSchema,
    );
    expect(cleanedEvent?.['type-de-structure']).toBeUndefined();
  });
  it('should clean optioned fields in array', () => {
    const cleanedEvent = cleanOptionedFields(
      { ...event, particularites: [637, 776] },
      formSchema,
    );
    expect(cleanedEvent).toStrictEqual({ ...event, particularites: [776] });
  });
});
