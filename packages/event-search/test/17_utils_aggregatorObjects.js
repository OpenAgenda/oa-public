'use strict';

const assert = require('assert');
const { flatten, inflate } = require('../utils/aggregatorObjects');

describe('event-search - unit: utils - aggregatorObjects', function() {

  describe('flatten', () => {

    it('basic', () => {
      assert.equal(
        flatten({
          uid: 123,
          title: 'L\'agenda',
          image: 'agenda123.jpg'
        }, ['uid', 'title', 'image']),
        'eyJ1aWQiOjEyMywidGl0bGUiOiJMJ2FnZW5kYSIsImltYWdlIjoiYWdlbmRhMTIzLmpwZyJ9'
      );
    });

    it('with special character', () => {
      assert.equal(
        flatten({
          uid: 123,
          title: 'NDM 2020: L\'agenda',
          image: 'agenda123.jpg'
        }, ['uid', 'title', 'image']),
        'eyJ1aWQiOjEyMywidGl0bGUiOiJORE0gMjAyMDogTCdhZ2VuZGEiLCJpbWFnZSI6ImFnZW5kYTEyMy5qcGcifQ=='
      );
    });

  });


  describe('inflate', () => {
    it('basic', () => {
      assert.deepEqual(
        inflate(`eyJ1aWQiOjEyMywidGl0bGUiOiJMJ2FnZW5kYSIsImltYWdlIjoiYWdlbmRhMTIzLmpwZyJ9`),
        { uid: 123, title: "L'agenda", image: 'agenda123.jpg' }
      );
    });

    it('with special character', () => {
      assert.deepEqual(
        inflate(`eyJ1aWQiOjEyMywidGl0bGUiOiJORE0gMjAyMDogTCdhZ2VuZGEiLCJpbWFnZSI6ImFnZW5kYTEyMy5qcGcifQ==`),
        { uid: 123, title: 'NDM 2020: L\'agenda', image: 'agenda123.jpg' }
      );
    });
  });
});
