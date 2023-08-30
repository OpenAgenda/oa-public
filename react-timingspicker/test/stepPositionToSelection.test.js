import stepPositionToSelection from '../src/utils/stepPositionToSelection';

describe('unit - stepPositionToSelection', () => {
  describe('basic', () => {
    const props = {
      activeWeek: new Date('2019-11-02T09:45:49+0100'),
      weekStartsOn: 0,
      selectableStep: 1800,
    };

    const topAt10 = 20;

    it('provides begin and end datetimes matching cursor position from given start point', () => {
      const { begin, end } = stepPositionToSelection(
        props,
        {
          top: topAt10,
          left: 1,
        },
        new Date('2019-10-28T09:00:00+0100')
      );

      expect(begin.toISOString()).toBe('2019-10-28T08:00:00.000Z');
      expect(end.toISOString()).toBe('2019-10-28T09:00:00.000Z');
    });

    it('if reference date is not provided, does not provide begin', () => {
      const { begin, end } = stepPositionToSelection(props, {
        top: topAt10,
        left: 1,
      });

      expect(begin).toBe(0);
      expect(end.toISOString()).toBe('2019-10-28T09:00:00.000Z');
    });
  });

  describe('DST days', () => {
    it('fix: before is evaluated correctly', () => {
      const props = {
        activeWeek: new Date('2019-10-27T02:00:00+0200'),
        weekStartsOn: 0,
        selectableStep: 1800,
      };

      const { begin: begin1 } = stepPositionToSelection(
        props,
        {
          top: 20.95,
          left: 0,
        },
        new Date('2019-10-27T10:00:00+0100')
      );

      const { begin: begin2 } = stepPositionToSelection(
        props,
        {
          top: 21,
          left: 0,
        },
        new Date('2019-10-27T10:00:00+0100')
      );

      expect(begin1).toEqual(begin2);
    });

    it('fix: time increment cannot exceed step value', () => {
      const selectableStep = 1800;

      const props = {
        activeWeek: new Date('2019-03-31T00:00:00.000Z'),
        weekStartsOn: 0,
        selectableStep: 1800,
      };

      const { end } = stepPositionToSelection(
        props,
        {
          top: 45.95,
          left: 0,
        },
        new Date('2019-03-31T19:00:00.000Z')
      );

      const { end: end2 } = stepPositionToSelection(
        props,
        {
          top: 46.05,
          left: 0,
        },
        new Date('2019-03-31T19:00:00.000Z')
      );

      expect((end2.getTime() - end.getTime()) / 1000).toBe(selectableStep);
    });
  });
});
