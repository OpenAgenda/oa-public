import editedTiming, { isSameTiming } from '../src/utils/editedTiming.js';

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

describe('unit - isSameTiming', () => {
  const span = (h) => ({
    begin: new Date(`2026-11-10T${`${h}`.padStart(2, '0')}:00:00.000Z`),
    end: new Date(`2026-11-10T${`${h + 2}`.padStart(2, '0')}:00:00.000Z`),
  });

  // Two timings on one span, one edited: the other keeps its place and id.
  it('tells timings with an id apart by it, whatever their span', () => {
    expect(isSameTiming({ id: 'B', ...span(9) }, { id: 'A', ...span(9) })).toBe(
      false,
    );
    expect(
      isSameTiming({ id: 'A', ...span(10) }, { id: 'A', ...span(9) }),
    ).toBe(true);
  });

  // The value is rebuilt on every render: a reference held from before a
  // render still finds its timing.
  it('finds a timing without an id by its span, not by reference', () => {
    expect(isSameTiming(span(9), span(9))).toBe(true);
    expect(isSameTiming(span(9), span(10))).toBe(false);
  });
});
