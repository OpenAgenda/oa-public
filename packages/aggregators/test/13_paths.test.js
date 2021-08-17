'use strict';

const {
  updateIsRequired,
  getAmended,
  getFiltered,
  endsShortestPath,
} = require('../utils/paths');

describe('13 - paths', () => {
  describe('updateIsRequired', () => {
    test('if no sourcePaths are registered in reference, it needs to be updated', () => {
      expect(updateIsRequired(undefined, [[111, 222]], 333)).toBe(true);
    });

    test('sourcePaths are registered in reference, but provided sourcePath includes a path unknown by reference', () => {
      expect(
        updateIsRequired(
          [[111, 222, 333]],
          [
            [111, 222],
            [100, 6, 222],
          ],
          333
        )
      ).toBe(true);
    });

    test('if source does not have any paths, it is a root', () => {
      expect(updateIsRequired([[333]], [], 333)).toBe(false);
    });

    test('all paths of source are known to reference', () => {
      expect(
        updateIsRequired(
          [
            [111, 222, 333],
            [100, 6, 222, 333],
          ],
          [
            [111, 222],
            [100, 6, 222],
          ],
          333
        )
      ).toBe(false);
    });
  });

  describe('getAmended', () => {
    test('source paths are amended with source uid', () => {
      const amended = getAmended(
        undefined,
        [
          [111, 222],
          [100, 6, 222],
        ],
        333
      );

      expect(amended).toEqual([
        [111, 222, 333],
        [100, 6, 222, 333],
      ]);
    });

    test('source paths are appended to pre-existing paths unrelated to source', () => {
      const amended = getAmended(
        [
          [888, 1, 23],
          [111, 222, 333],
        ],
        [
          [111, 222],
          [100, 6, 222],
        ],
        333
      );

      expect(amended).toEqual([
        [888, 1, 23],
        [111, 222, 333],
        [100, 6, 222, 333],
      ]);
    });

    test('when paths are empty, source uid constitutes the only new path', () => {
      const amended = getAmended([], [], 17026855);

      expect(amended).toEqual([[17026855]]);
    });
  });

  describe('getFiltered', () => {
    test('paths originating from specified source are filtered out', () => {
      const filtered = getFiltered(
        [
          [888, 1, 23],
          [111, 222, 333],
        ],
        333
      );

      expect(filtered).toEqual([[888, 1, 23]]);
    });

    test('specified source can be deeper down in path for the path to be removed', () => {
      const filtered = getFiltered(
        [
          [1, 333, 888, 23],
          [888, 1, 23],
          [111, 222, 333],
        ],
        333
      );

      expect(filtered).toEqual([[888, 1, 23]]);
    });
  });

  describe('endsShortestPath', () => {
    test('one path, one identifier', () => {
      expect(endsShortestPath([[70042833]], 70042833)).toBe(true);
    });
  });
});
