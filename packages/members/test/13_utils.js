'use strict';

const should = require('should');
const { getRoleSlug, getRoleCode } = require('../').utils;

describe('members - functional - utils', () => {
  describe('getRoleSlug', () => {
    it('provides slug corresponding to given code', () => {
      getRoleSlug(2).should.equal('administrator');
    });

    it('throws error if code is not known', () => {
      let error;

      try {
        getRoleSlug(42);
      } catch (e) {
        error = e;
      }

      error.message.should.equal('Unknown role');
    });
  });

  describe('getRoleCode', () => {
    it('provides code corresponding to given slug', () => {
      getRoleCode('administrator').should.equal(2);
    });

    it('throws error if slug is not known', () => {
      let error;

      try {
        getRoleCode('spoon');
      } catch (e) {
        error = e;
      }

      error.message.should.equal('Unknown role');
    });
  });
});
