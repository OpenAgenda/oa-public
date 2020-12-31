'use strict';

const assert = require('assert');

const dateHourMinutesTiming = require('../lib/validators/dateHourMinutesTiming');
const validateTiming = require('../lib/validators/timing');
const validateTimings = require('../lib/validators/timings');

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

  describe('dateHourMinutesTiming', () => {

    it('validates a well formatted dateHourMinutes timing', () => {
      const clean = dateHourMinutesTiming({
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
        dateHourMinutesTiming({
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
        dateHourMinutesTiming({
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
        dateHourMinutesTiming({
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
        dateHourMinutesTiming({
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

  });

});
