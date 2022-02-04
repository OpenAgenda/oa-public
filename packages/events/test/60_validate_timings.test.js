'use strict';

const assert = require('assert');

const dateHoursMinutesTiming = require('../iso/src/validators/dateHoursMinutesTiming');
const validateTiming = require('../iso/src/validators/timing');
const validateTimings = require('../iso/src/validators/timings');
const convertDateMinuteHourTimings = require('../utils/convertDateHoursMinutesTimings');

describe('timings', () => {

  describe('timing', () => {
    it('validates a well formatted timing', () => {
      const clean = validateTiming({
        begin: '2020-10-21T10:00:00.000Z',
        end: '2020-10-21T12:00:00.000Z'
      });

      assert.equal(
        JSON.stringify(clean),
        '{"begin":"2020-10-21T10:00:00.000Z","end":"2020-10-21T12:00:00.000Z"}'
      );
    });
  });

  describe('dateHoursMinutesTiming', () => {

    it('validates a well formatted dateHoursMinutes timing', () => {
      const clean = dateHoursMinutesTiming({
        begin: {
          date: '2020-10-21',
          hours: 20,
          minutes: 10
        },
        end: {
          date: '2020-10-21',
          hours: 21,
          minutes: 5
        }
      });

      assert.deepEqual(clean, {
        begin: {
          date: '2020-10-21',
          hours: 20,
          minutes: 10
        },
        end: {
          date: '2020-10-21',
          hours: 21,
          minutes: 5
        }
      });
    });

    it('throws error on wrong hour', () => {
      try {
        dateHoursMinutesTiming({
          begin: {
            date: '2020-10-10',
            hours: 44,
            minutes: 10
          },
          end: {
            date: '2020-10-21',
            hours: 21,
            minutes: 5
          }
        })
      } catch (errors) {
        assert.deepEqual(errors, [{
          code: 'integer.toobig',
          message: 'the integer is too big',
          values: { max: 23 },
          origin: 44,
          field: 'begin.hours'
        }]);
        return;
      }
      throw new Error('Should have thrown error');
    });

    it('throws error on wrong date', () => {
      try {
        dateHoursMinutesTiming({
          begin: {
            date: '2020-10-33',
            hours: 20,
            minutes: 10
          },
          end: {
            date: '2020-10-21',
            hours: 21,
            minutes: 5
          }
        })
      } catch (errors) {
        assert.deepEqual(errors, [{
          code: 'date.invalid',
          message: 'Invalid Date',
          origin: '2020-10-33',
          field: 'begin.date'
        }]);
        return;
      }
      throw new Error('Should have thrown error');
    });

    it('throws error if begin is after end', () => {
      try {
        dateHoursMinutesTiming({
          begin: {
            date: '2020-10-21',
            hours: 20,
            minutes: 10
          },
          end: {
            date: '2020-10-21',
            hours: 19,
            minutes: 5
          }
        })
      } catch (errors) {
        assert.deepEqual(errors, [{
          code: 'endLessThanBegin',
          message: 'end cannot be before begin',
          origin: {
            begin: {
              date: '2020-10-21',
              hours: 20,
              minutes: 10
            },
            end: {
              date: '2020-10-21',
              hours: 19,
              minutes: 5
            }
          }
        }]);
        return;
      }
      throw new Error('Should have thrown error');
    });

    it('throws error if end is more than 24 hours after begin', () => {
      try {
        dateHoursMinutesTiming({
          begin: {
            date: '2020-10-21',
            hours: 20,
            minutes: 10
          },
          end: {
            date: '2020-10-22',
            hours: 20,
            minutes: 11
          }
        })
      } catch (errors) {
        assert.deepEqual(errors, [{
          code: 'diffExceeded',
          message: 'end cannot happen more than 24h after begin',
          origin: {
            begin: {
              date: '2020-10-21',
              hours: 20,
              minutes: 10
            },
            end: {
              date: '2020-10-22',
              hours: 20,
              minutes: 11
            }
          }
        }]);
        return;
      }
      throw new Error('Should have thrown error');
    });

    it(
      'fix: timezone must be accounted for to avoid offset between begin and end on DST days',
      () => {
        let error;
        try {
          dateHoursMinutesTiming({
            begin: {
              date: '2021-03-28',
              hours: '00',
              minutes: '00'
            },
            end: {
              date: '2021-03-29',
              hours: '00',
              minutes: '59'
            },
            timezone: 'GMT'
          });
        } catch (e) {
          error = e.pop();
        }
        assert.deepEqual(error.code, 'diffExceeded');
      }
    );
  });

  describe('timings', () => {

    it('validates a list of timings', () => {
      const timings = validateTimings()([{
        begin: '2020-11-27T10:00:00+0200',
        end: '2020-11-27T20:00:00+0200'
      }]);

      assert.equal(timings.length, 1);
      assert(timings[0].begin instanceof Date);
      assert(timings[0].end instanceof Date);
    });

    it('validates a list of dhm timings', () => {
      const timings = validateTimings()([{
        begin: {
          date: '2020-11-27',
          hours: 20,
          minutes: 5
        },
        end: {
          date: '2020-11-27',
          hours: 20,
          minutes: 35
        }
      }]);

      assert.deepEqual(timings, [{
        begin: { date: '2020-11-27', hours: 20, minutes: 5 },
        end: { date: '2020-11-27', hours: 20, minutes: 35 }
      }]);
    });

    it('timings are sorted', () => {
      const timings = validateTimings()([{
        begin: '2020-11-27T10:00:00+0200',
        end: '2020-11-27T20:00:00+0200'
      }, {
        begin: '2020-11-27T09:00:00+0200',
        end: '2020-11-27T20:00:00+0200'
      }]);

      assert.equal(timings[0].begin.toISOString(), '2020-11-27T07:00:00.000Z');
    });

    it('dhm timings are sorted', () => {
      const timings = validateTimings()([{
        begin: {
          date: '2020-11-27',
          hours: 20,
          minutes: 5
        },
        end: {
          date: '2020-11-27',
          hours: 20,
          minutes: 35
        }
      }, {
        begin: {
          date: '2020-11-27',
          hours: 20,
          minutes: 2
        },
        end: {
          date: '2020-11-27',
          hours: 20,
          minutes: 40
        }
      }]);

      assert.equal(timings[0].begin.minutes, 2);
    });

    it('fix: dhm timings sort', () => {

      const timings = validateTimings()([
        {
          "begin": {
            "date": "2021-04-30",
            "hours": "10",
            "minutes": "00"
          },
          "end": {
            "date": "2021-04-30",
            "hours": "12",
            "minutes": "00"
          }
        },
        {
          "begin": {
            "date": "2021-05-03",
            "hours": "10",
            "minutes": "00"
          },
          "end": {
            "date": "2021-05-03",
            "hours": "12",
            "minutes": "00"
          }
        }
      ]);

      assert.equal(timings[1].begin.date, '2021-05-03');
      
    });

    it('if default is provided, default is used if no value is given', () => {
      const defaultValue = [{
        begin: { date: '2019-10-12', hours: 10, minutes: 11 },
        end: { date: '2019-10-12', hours: 12, minutes: 20 }
      }];
  
      const validate = validateTimings({
        default: defaultValue
      });

      assert.deepEqual(validate(), defaultValue);
    });

    /**
     * when nothing is stored in the db for timings it is defined as null in the entry.
     * An event draft is saved without timings, then reloaded, the value read is null rather than undefined
     * and if a default value exists, it should replace null.
     */
    it('if default is provided, default is used if null value is given', () => {
      const defaultValue = [{
        begin: { date: '2019-10-12', hours: 10, minutes: 11 },
        end: { date: '2019-10-12', hours: 12, minutes: 20 }
      }];

      const validate = validateTimings({
        default: defaultValue
      });

      expect(validate(null)).toEqual(defaultValue);
    });

    it('throws error if provided items count exceeds specified max', () => {
      const values = [];
      const cursor = new Date();
      for (let i = 0; i<=800; i++) {
        cursor.setHours(8);
        const begin = new Date(cursor);
        cursor.setHours(18);
        const end = new Date(cursor);
        values.push({ begin, end });
        cursor.setDate(cursor.getDate()+1);
      }

      try {
        validateTimings({ max: 800 })(values);
      } catch (errors) {
        assert.equal(errors[0].code, 'timings.max.800');
        return;
      }

      throw new Error('test should have excited in catch');
    });


  });

  describe('convertDateHoursMinutes', () => {

    it('convers from', () => {
      const timings = [{
        begin: { date: '2021-01-13', hours: '10', minutes: '24' },
        end: { date: '2021-01-13', hours: '11', minutes: '00' }
      }];

      convertDateMinuteHourTimings(timings, 'Europe/Paris');

      assert.deepEqual(timings, [
        {
          begin: '2021-01-13T10:24:00.000+01:00',
          end: '2021-01-13T11:00:00.000+01:00'
        }
      ]);
    })

    it('converts to', () => {
      const timings = [{
        begin: new Date('2021-01-13T09:24:00.000Z'),
        end: new Date('2021-01-13T10:00:00.000Z')
      }];

      convertDateMinuteHourTimings.to(timings, 'Europe/Paris');

      assert.deepEqual(timings, [{
        begin: { date: '2021-01-13', hours: '10', minutes: '24' },
        end: { date: '2021-01-13', hours: '11', minutes: '00' }
      }]);
    });

  })

});
