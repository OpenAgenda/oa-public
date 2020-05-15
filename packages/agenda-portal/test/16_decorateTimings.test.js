'use strict';

const moment = require('moment-timezone');
const decorateTimings = require('../utils/decorateTimings');

describe('16 - utils - decorateTimings', () => {
  beforeAll(() => {
    moment.locale('fr');
  });

  it('Extract begin year', () => {
    const decorated = decorateTimings(
      {
        begin: '2020-05-08T18:00:00+0200',
        end: '2020-05-08T20:00:00+02000'
      },
      'Europe/Paris',
      [
        {
          src: 'begin',
          dst: 'year',
          format: 'YYYY'
        }
      ]
    );

    expect(decorated).toEqual({
      begin: '2020-05-08T18:00:00+0200',
      end: '2020-05-08T20:00:00+02000',
      year: '2020'
    });
  });

  it('format using moment synthax', () => {
    const decorated = decorateTimings(
      {
        begin: '2020-05-08T18:00:00+0200',
        end: '2020-05-08T20:00:00+02000'
      },
      'Europe/Paris',
      [
        {
          src: 'begin',
          dst: 'formatted',
          format: 'dd. D.M - HH[h]mm'
        }
      ]
    );

    expect(decorated.formatted).toEqual('ve. 8.5 - 18h00');
  });
});
