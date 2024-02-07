import lifespanToBeginAndEnd from '../utils/lifespanToBeginAndEnd';

describe('utils - lifespanToBeginAndEnd', () => {
  it('basic 1h lifespan', () => {
    const res = lifespanToBeginAndEnd(1000 * 60 * 60, {
      now: new Date('2023-12-14T12:30:00.000Z'),
    });
    expect(res).toStrictEqual({
      begin: new Date('2023-12-14T12:00:00.000Z'),
      end: new Date('2023-12-14T13:00:00.000Z'),
    });
  });

  it('basic 0h30 lifespan', () => {
    const res = lifespanToBeginAndEnd(1000 * 60 * 30, {
      now: new Date('2023-12-14T12:24:00.000Z'),
    });
    expect(res).toStrictEqual({
      begin: new Date('2023-12-14T12:00:00.000Z'),
      end: new Date('2023-12-14T12:30:00.000Z'),
    });
  });
});
