import editedTiming from '../src/utils/editedTiming.js';

describe('unit - editedTiming', () => {
  it('keeps the id of the timing edited, at its new span', () => {
    const begin = new Date('2026-11-10T10:00:00.000Z');
    const end = new Date('2026-11-10T12:00:00.000Z');

    expect(
      editedTiming(
        {
          id: 'AB12CD',
          begin: new Date('2026-11-10T09:00:00.000Z'),
          end: new Date('2026-11-10T11:00:00.000Z'),
        },
        { begin, end },
      ),
    ).toEqual({ id: 'AB12CD', begin, end });
  });

  it('gives a timing without an id none', () => {
    const begin = new Date('2026-11-10T10:00:00.000Z');
    const end = new Date('2026-11-10T12:00:00.000Z');

    expect(
      editedTiming(
        {
          begin: new Date('2026-11-10T09:00:00.000Z'),
          end: new Date('2026-11-10T11:00:00.000Z'),
        },
        { begin, end },
      ),
    ).toEqual({ begin, end });
  });
});
