import dateHoursMinutesTiming from '../iso/validators/dateHoursMinutesTiming.js';
import validateTiming from '../iso/validators/timing.js';
import validateTimings from '../iso/validators/timings.js';
import convertDateMinuteHourTimings from '../utils/convertDateHoursMinutesTimings.js';

describe('timings', () => {
  describe('timing', () => {
    it('validates a well formatted timing', () => {
      const clean = validateTiming({
        begin: '2020-10-21T10:00:00.000Z',
        end: '2020-10-21T12:00:00.000Z',
      });

      expect(clean).toEqual({
        begin: new Date('2020-10-21T10:00:00.000Z'),
        end: new Date('2020-10-21T12:00:00.000Z'),
      });
    });
  });

  describe('dateHoursMinutesTiming', () => {
    it('validates a well formatted dateHoursMinutes timing', () => {
      const clean = dateHoursMinutesTiming({
        begin: {
          date: '2020-10-21',
          hours: 20,
          minutes: 10,
        },
        end: {
          date: '2020-10-21',
          hours: 21,
          minutes: 5,
        },
      });

      expect(clean).toEqual({
        begin: {
          date: '2020-10-21',
          hours: 20,
          minutes: 10,
        },
        end: {
          date: '2020-10-21',
          hours: 21,
          minutes: 5,
        },
      });
    });

    it('throws error on wrong hour', () => {
      let errors;

      try {
        dateHoursMinutesTiming({
          begin: {
            date: '2020-10-10',
            hours: 44,
            minutes: 10,
          },
          end: {
            date: '2020-10-21',
            hours: 21,
            minutes: 5,
          },
        });
      } catch (e) {
        errors = e;
      }

      expect(errors).toEqual([
        {
          code: 'integer.toobig',
          message: 'the integer is too big',
          values: { max: 23 },
          origin: 44,
          field: 'begin.hours',
        },
      ]);
    });

    it('throws error on wrong date', () => {
      let errors;

      try {
        dateHoursMinutesTiming({
          begin: {
            date: '2020-10-33',
            hours: 20,
            minutes: 10,
          },
          end: {
            date: '2020-10-21',
            hours: 21,
            minutes: 5,
          },
        });
      } catch (e) {
        errors = e;
      }

      expect(errors).toEqual([
        {
          code: 'date.invalid',
          message: 'Invalid Date',
          origin: '2020-10-33',
          field: 'begin.date',
        },
      ]);
    });

    it('throws error if begin is after end', () => {
      let errors;

      try {
        dateHoursMinutesTiming({
          begin: {
            date: '2020-10-21',
            hours: 20,
            minutes: 10,
          },
          end: {
            date: '2020-10-21',
            hours: 19,
            minutes: 5,
          },
        });
      } catch (e) {
        errors = e;
      }

      expect(errors).toEqual([
        {
          code: 'endLessThanBegin',
          message: 'end cannot be before begin',
          origin: {
            begin: {
              date: '2020-10-21',
              hours: 20,
              minutes: 10,
            },
            end: {
              date: '2020-10-21',
              hours: 19,
              minutes: 5,
            },
          },
        },
      ]);
    });

    it('throws error if end is more than 24 hours after begin', () => {
      let errors;

      try {
        dateHoursMinutesTiming({
          begin: {
            date: '2020-10-21',
            hours: 20,
            minutes: 10,
          },
          end: {
            date: '2020-10-22',
            hours: 20,
            minutes: 11,
          },
        });
      } catch (e) {
        errors = e;
      }

      expect(errors).toEqual([
        {
          code: 'diffExceeded',
          message: 'end cannot happen more than 24h after begin',
          origin: {
            begin: {
              date: '2020-10-21',
              hours: 20,
              minutes: 10,
            },
            end: {
              date: '2020-10-22',
              hours: 20,
              minutes: 11,
            },
          },
        },
      ]);
    });

    it('fix: timezone must be accounted for to avoid offset between begin and end on DST days', () => {
      let error;
      try {
        dateHoursMinutesTiming({
          begin: {
            date: '2021-03-28',
            hours: '00',
            minutes: '00',
          },
          end: {
            date: '2021-03-29',
            hours: '00',
            minutes: '59',
          },
          timezone: 'GMT',
        });
      } catch (e) {
        error = e.pop();
      }
      expect(error.code).toBe('diffExceeded');
    });
  });

  describe('timings', () => {
    it('throws error when timings overlap', () => {
      let errors;

      try {
        validateTimings()([
          {
            begin: '2020-11-27T10:00:00+0200',
            end: '2020-11-27T12:00:00+0200',
          },
          {
            begin: '2020-11-27T11:00:00+0200',
            end: '2020-11-27T13:00:00+0200',
          },
        ]);
      } catch (e) {
        errors = e;
      }

      expect(errors[0]).toEqual(
        expect.objectContaining({
          code: 'overlap',
          message: 'timings cannot overlap',
        }),
      );
    });

    it('throws error when dhm timings overlap', () => {
      let errors;

      try {
        validateTimings()([
          {
            begin: {
              date: '2020-11-27',
              hours: 10,
              minutes: 0,
            },
            end: {
              date: '2020-11-27',
              hours: 12,
              minutes: 0,
            },
          },
          {
            begin: {
              date: '2020-11-27',
              hours: 11,
              minutes: 0,
            },
            end: {
              date: '2020-11-27',
              hours: 13,
              minutes: 0,
            },
          },
        ]);
      } catch (e) {
        errors = e;
      }

      expect(errors[0]).toEqual(
        expect.objectContaining({
          code: 'overlap',
          message: 'timings cannot overlap',
        }),
      );
    });

    it('validates a list of timings', () => {
      const timings = validateTimings()([
        {
          begin: '2020-11-27T10:00:00+0200',
          end: '2020-11-27T20:00:00+0200',
        },
      ]);

      expect(timings.length).toBe(1);
      expect(timings[0].begin).toBeInstanceOf(Date);
      expect(timings[0].end).toBeInstanceOf(Date);
    });

    it('validates a list of dhm timings', () => {
      const timings = validateTimings()([
        {
          begin: {
            date: '2020-11-27',
            hours: 20,
            minutes: 5,
          },
          end: {
            date: '2020-11-27',
            hours: 20,
            minutes: 35,
          },
        },
      ]);

      expect(timings).toEqual([
        {
          begin: { date: '2020-11-27', hours: 20, minutes: 5 },
          end: { date: '2020-11-27', hours: 20, minutes: 35 },
        },
      ]);
    });

    it('timings are sorted', () => {
      const timings = validateTimings()([
        {
          begin: '2020-11-27T10:00:00+0200',
          end: '2020-11-27T12:00:00+0200',
        },
        {
          begin: '2020-11-27T13:00:00+0200',
          end: '2020-11-27T15:00:00+0200',
        },
      ]);

      expect(timings[0].begin.toISOString()).toBe('2020-11-27T08:00:00.000Z');
    });

    it('dhm timings are sorted', () => {
      const timings = validateTimings()([
        {
          begin: {
            date: '2020-11-27',
            hours: 20,
            minutes: 5,
          },
          end: {
            date: '2020-11-27',
            hours: 20,
            minutes: 35,
          },
        },
        {
          begin: {
            date: '2020-11-27',
            hours: 21,
            minutes: 2,
          },
          end: {
            date: '2020-11-27',
            hours: 21,
            minutes: 40,
          },
        },
      ]);

      expect(timings[0].begin.hours).toBe(20);
    });

    it('fix: dhm timings sort', () => {
      const timings = validateTimings()([
        {
          begin: {
            date: '2021-04-30',
            hours: '10',
            minutes: '00',
          },
          end: {
            date: '2021-04-30',
            hours: '12',
            minutes: '00',
          },
        },
        {
          begin: {
            date: '2021-05-03',
            hours: '10',
            minutes: '00',
          },
          end: {
            date: '2021-05-03',
            hours: '12',
            minutes: '00',
          },
        },
      ]);

      expect(timings[1].begin.date).toBe('2021-05-03');
    });

    it('if default is provided, default is used if no value is given', () => {
      const defaultValue = [
        {
          begin: { date: '2019-10-12', hours: 10, minutes: 11 },
          end: { date: '2019-10-12', hours: 12, minutes: 20 },
        },
      ];

      const validate = validateTimings({
        default: defaultValue,
      });

      expect(validate()).toEqual(defaultValue);
    });

    /**
     * when nothing is stored in the db for timings it is defined as null in the entry.
     * An event draft is saved without timings, then reloaded, the value read is null rather than undefined
     * and if a default value exists, it should replace null.
     */
    it('if default is provided, default is used if null value is given', () => {
      const defaultValue = [
        {
          begin: { date: '2019-10-12', hours: 10, minutes: 11 },
          end: { date: '2019-10-12', hours: 12, minutes: 20 },
        },
      ];

      const validate = validateTimings({
        default: defaultValue,
      });

      expect(validate(null)).toEqual(defaultValue);
    });

    it('throws error if provided items count exceeds specified max', () => {
      const values = [];
      const cursor = new Date();
      for (let i = 0; i <= 800; i++) {
        cursor.setHours(8);
        const begin = new Date(cursor);
        cursor.setHours(18);
        const end = new Date(cursor);
        values.push({ begin, end });
        cursor.setDate(cursor.getDate() + 1);
      }

      let errors;
      try {
        validateTimings({ max: 800 })(values);
      } catch (e) {
        errors = e;
      }

      expect(errors[0].code).toBe('timings.max.800');
    });
  });

  describe('convertDateHoursMinutes', () => {
    it('convers from', () => {
      const timings = [
        {
          begin: { date: '2021-01-13', hours: '10', minutes: '24' },
          end: { date: '2021-01-13', hours: '11', minutes: '00' },
        },
      ];

      convertDateMinuteHourTimings(timings, 'Europe/Paris');

      expect(timings).toEqual([
        {
          begin: '2021-01-13T10:24:00.000+01:00',
          end: '2021-01-13T11:00:00.000+01:00',
        },
      ]);
    });

    it('converts to', () => {
      const timings = [
        {
          begin: new Date('2021-01-13T09:24:00.000Z'),
          end: new Date('2021-01-13T10:00:00.000Z'),
        },
      ];

      convertDateMinuteHourTimings.to(timings, 'Europe/Paris');

      expect(timings).toEqual([
        {
          begin: { date: '2021-01-13', hours: '10', minutes: '24' },
          end: { date: '2021-01-13', hours: '11', minutes: '00' },
        },
      ]);
    });
  });
});
