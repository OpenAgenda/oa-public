import valueToStepPosition from '../src/utils/valueToStepPosition';

describe('unit - valueToStepPosition', () => {
  const props = {
    activeWeek: new Date('2019-10-27T00:00:00.000Z'),
    weekStartsOn: 0,
    selectableStep: 1800,
  };

  it('DST early morning of next day', () => {
    const result = valueToStepPosition(props, {
      begin: new Date('2019-10-28T01:00:00.000Z'),
      end: new Date('2019-10-28T02:00:00.000Z'),
    });

    expect(result.begin.top).toBe(4);
  });
});
