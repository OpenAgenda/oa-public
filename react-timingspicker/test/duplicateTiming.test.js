import duplicateTiming from '../src/utils/duplicateTiming';

/* {
  weekStartsOn: 0,
  frequence: 'weekly',
  weekday: [0],
  interval: 1,
  endType: 'until',
  until: '2019-10-08T21:59:59.999Z',
  count: 2,
  monthlyIntervalType: 'date'
} */

describe('unit - duplicateTiming', () => {
  it('weekly - default', () => {
    expect(
      duplicateTiming(
        {
          begin: new Date('2019-09-15T09:30:00.000Z'),
          end: new Date('2019-09-15T11:30:00.000Z'),
        },
        {
          frequence: 'weekly',
        }
      )
    ).toEqual([
      {
        begin: new Date('2019-09-15T09:30:00.000Z'),
        end: new Date('2019-09-15T11:30:00.000Z'),
      },
    ]);
  });

  it('weekly - until 2019-10-08T21:59:59.999Z', () => {
    expect(
      duplicateTiming(
        {
          begin: new Date('2019-09-15T09:30:00.000Z'),
          end: new Date('2019-09-15T11:30:00.000Z'),
        },
        {
          frequence: 'weekly',
          endType: 'until',
          until: '2019-10-08T21:59:59.999Z',
        }
      )
    ).toEqual([
      {
        begin: new Date('2019-09-15T09:30:00.000Z'),
        end: new Date('2019-09-15T11:30:00.000Z'),
      },
      {
        begin: new Date('2019-09-22T09:30:00.000Z'),
        end: new Date('2019-09-22T11:30:00.000Z'),
      },
      {
        begin: new Date('2019-09-29T09:30:00.000Z'),
        end: new Date('2019-09-29T11:30:00.000Z'),
      },
      {
        begin: new Date('2019-10-06T09:30:00.000Z'),
        end: new Date('2019-10-06T11:30:00.000Z'),
      },
    ]);
  });

  it('weekly - count 2', () => {
    expect(
      duplicateTiming(
        {
          begin: new Date('2019-09-15T09:30:00.000Z'),
          end: new Date('2019-09-15T11:30:00.000Z'),
        },
        {
          frequence: 'weekly',
          endType: 'count',
          count: 3,
        }
      )
    ).toEqual([
      {
        begin: new Date('2019-09-15T09:30:00.000Z'),
        end: new Date('2019-09-15T11:30:00.000Z'),
      },
      {
        begin: new Date('2019-09-22T09:30:00.000Z'),
        end: new Date('2019-09-22T11:30:00.000Z'),
      },
      {
        begin: new Date('2019-09-29T09:30:00.000Z'),
        end: new Date('2019-09-29T11:30:00.000Z'),
      },
    ]);
  });
});
