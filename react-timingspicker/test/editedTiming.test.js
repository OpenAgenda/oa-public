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
  const span = (h, more = {}) => ({
    begin: new Date(`2026-11-10T${`${h}`.padStart(2, '0')}:00:00.000Z`),
    end: new Date(`2026-11-10T${`${h + 2}`.padStart(2, '0')}:00:00.000Z`),
    ...more,
  });

  // The value is rebuilt on every render: a reference held from before a
  // render still finds its timing.
  it('finds a timing without an id by its span, not by reference', () => {
    expect(isSameTiming(span(9), span(9))).toBe(true);
    expect(isSameTiming(span(9), span(10))).toBe(false);
  });

  it('finds a timing with an id by its id, whatever its span', () => {
    expect(isSameTiming(span(14, { id: 'A' }), span(9, { id: 'A' }))).toBe(
      true,
    );
    expect(isSameTiming(span(9, { id: 'B' }), span(9, { id: 'A' }))).toBe(
      false,
    );
  });

  it('takes a null id for none, and never finds a timing with an id by span', () => {
    expect(isSameTiming(span(9), span(9, { id: null }))).toBe(true);
    expect(isSameTiming(span(9, { id: 'A' }), span(9, { id: null }))).toBe(
      false,
    );
    expect(isSameTiming(span(9, { id: 'A' }), span(9))).toBe(false);
  });

  it('takes an id of any type for one', () => {
    expect(isSameTiming(span(9, { id: 2 }), span(9, { id: 1 }))).toBe(false);
    expect(isSameTiming(span(14, { id: 1 }), span(9, { id: 1 }))).toBe(true);
  });

  // Two timings handed in on one span: an edit of one leaves the other.
  it('leaves the twin of the timing edited', () => {
    const value = [span(9, { id: 'A' }), span(9, { id: 'B' }), span(12)];

    expect(value.filter((v) => !isSameTiming(v, value[0]))).toEqual([
      value[1],
      value[2],
    ]);
  });

  it('leaves the twin with an id of an id-less timing edited', () => {
    const value = [span(9), span(9, { id: 'A' })];

    expect(value.filter((v) => !isSameTiming(v, value[0]))).toEqual([value[1]]);
  });
});
