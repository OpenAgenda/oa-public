import DST from '../src/utils/DST';

describe('unit - DST', () => {
  describe('hasSwitched', () => {
    it('hasSwitched gives true when DST has occurred between dates', () => {
      expect(
        DST.hasSwitched(
          new Date('2019-10-27T00:00:00Z'),
          new Date('2019-10-27T10:00:00Z')
        )
      ).toBe(true);
    });

    it('hasSwitched gives false when DST has occurred between dates', () => {
      expect(
        DST.hasSwitched(
          new Date('2019-10-27T00:00:00Z'),
          new Date('2019-10-25T10:00:00Z')
        )
      ).toBe(false);
    });
  });

  describe('dayOffset', () => {
    it('0 if no switch', () => {
      expect(DST.dayOffset(new Date('2019-01-01'))).toBe(0);
    });

    it('1 if switch is plus one hour', () => {
      expect(DST.dayOffset(new Date('2019-10-27T10:00:00+0200'))).toBe(1);
    });

    it('-1 if switch is minus one hour', () => {
      expect(DST.dayOffset(new Date('2019-03-31T06:00:00+0200'))).toBe(-1);
    });

    it('Next day offset is 0', () => {
      expect(DST.dayOffset(new Date('2019-10-28T02:00:00+0200'))).toBe(0);
    });

    it('Early next day offset is 0', () => {
      expect(DST.dayOffset(new Date('2019-10-28T01:00:00+0200'))).toBe(0);
    });
  });

  describe('applyOffset', () => {
    it('apply offset should work for dates going over to next day before offset but not after', () => {
      const d = new Date('2019-03-31T23:00:00.000Z');

      const timeBefore = d.getTime();

      DST.applyOffset(new Date('2019-10-31T00:00:00.000Z'), d);

      expect((timeBefore - d.getTime()) / 1000 / 60 / 60).toBe(1);
    });
  });
});
