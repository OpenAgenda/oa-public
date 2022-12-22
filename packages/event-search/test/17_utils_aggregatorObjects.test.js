'use strict';

const { flatten, inflate } = require('../utils/aggregatorObjects');

describe('event-search - unit: utils - aggregatorObjects', () => {
  describe('flatten', () => {
    it('basic', () => {
      expect(
        flatten({
          uid: 123,
          title: 'L\'agenda',
          image: 'agenda123.jpg',
        }, ['uid', 'title', 'image']),
      ).toBe(
        'eyJ1aWQiOjEyMywidGl0bGUiOiJMJ2FnZW5kYSIsImltYWdlIjoiYWdlbmRhMTIzLmpwZyJ9',
      );
    });

    it('with special character', () => {
      expect(
        flatten({
          uid: 123,
          title: 'NDM 2020: L\'agenda',
          image: 'agenda123.jpg',
        }, ['uid', 'title', 'image']),
      ).toBe(
        'eyJ1aWQiOjEyMywidGl0bGUiOiJORE0gMjAyMDogTCdhZ2VuZGEiLCJpbWFnZSI6ImFnZW5kYTEyMy5qcGcifQ==',
      );
    });
  });

  describe('inflate', () => {
    it('basic', () => {
      expect(
        inflate('eyJ1aWQiOjEyMywidGl0bGUiOiJMJ2FnZW5kYSIsImltYWdlIjoiYWdlbmRhMTIzLmpwZyJ9'),
      ).toEqual(
        { uid: 123, title: "L'agenda", image: 'agenda123.jpg' },
      );
    });

    it('with special character', () => {
      expect(
        inflate('eyJ1aWQiOjEyMywidGl0bGUiOiJORE0gMjAyMDogTCdhZ2VuZGEiLCJpbWFnZSI6ImFnZW5kYTEyMy5qcGcifQ=='),
      ).toEqual(
        { uid: 123, title: 'NDM 2020: L\'agenda', image: 'agenda123.jpg' },
      );
    });
  });
});
