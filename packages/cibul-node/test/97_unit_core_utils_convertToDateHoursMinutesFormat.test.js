'use strict';

const { utils } = require('@openagenda/events');
const convertToDateHoursMinutesFormat = require('../core/agendas/events/lib/convertToDateHoursMinutesFormat');

describe('98 - core unit - convertToDateHoursMinutesFormat', () => {
  it('converts timings to date/hours/minutes format', () => {
    const { timings } = convertToDateHoursMinutesFormat({ utils })({
      timings: [{
        begin: '2021-11-08T13:53+0200',
        end: '2021-11-08T15:30+0200'
      }],
      timezone: 'Europe/Paris'
    });

    expect(
      Object.keys(timings[0].begin)
    ).toEqual(['date', 'hours', 'minutes']);
  });
});
