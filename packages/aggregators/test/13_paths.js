'use strict';

const should = require('should');

const {
  updateIsRequired,
  getAmended,
  getFiltered
} = require('../utils/paths');

describe('13 - paths', () => {

  describe('updateIsRequired', () => {

    it('if no sourcePaths are registered in reference, it needs to be updated', () => {
      updateIsRequired(undefined, [[111, 222]], 333).should.equal(true);
    });

    it('sourcePaths are registered in reference, but provided sourcePath includes a path unknown by reference', () => {
      updateIsRequired([[111, 222, 333]], [[111, 222], [100, 6, 222]], 333).should.equal(true);
    });

    it('all paths of source are known to reference', () => {
      updateIsRequired([[111, 222, 333], [100, 6, 222, 333]], [[111, 222], [100, 6, 222]], 333).should.equal(false);
    });

  });

  describe('getAmended', () => {

    it('source paths are amended with source uid', () => {
      const amended = getAmended(undefined, [[111, 222], [100, 6, 222]], 333);

      amended.should.eql([
        [111, 222, 333],
        [100, 6, 222, 333]
      ]);
    });

    it('source paths are appended to pre-existing paths unrelated to source', () => {
      const amended = getAmended([[888, 1, 23], [111, 222, 333]], [[111, 222], [100, 6, 222]], 333);

      amended.should.eql([
        [888, 1, 23],
        [111, 222, 333],
        [100, 6, 222, 333]
      ])
    });

    it('when paths are empty, source uid constitutes the only new path', () => {
      const amended = getAmended([], [], 17026855);

      amended.should.eql([
        [17026855]
      ]);
    });

  });

  describe('getFiltered', () => {

    it('paths originating from specified source are filtered out', () => {
      const filtered = getFiltered([[888, 1, 23], [111, 222, 333]], 333);

      filtered.should.eql([
        [888, 1, 23]
      ]);
    });

    it('specified source can be deeper down in path for the path to be removed', () => {
      const filtered = getFiltered([[1, 333, 888, 23], [888, 1, 23], [111, 222, 333]], 333);

      filtered.should.eql([
        [888, 1, 23]
      ]);
    })

  });
});
