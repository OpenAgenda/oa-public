'use strict';

const assert = require('assert');

const validate = require('../lib/validate');

describe('validate', () => {

  it('title can be specified in one language', async () => {
    try {
      await validate({
        title: 'A title'
      });
      throw new Error('should not be here');
    } catch (error) {
      const titleErrors = error.detail.filter(e => e.field === 'title');
      assert.equal(titleErrors.length, 0);
    }
  });

  it('location needs to be specified if eventAttendanceMode is offline', async () => {
    try {
      await validate({
        eventAttendanceMode: 1
      });
      
      throw new Error('should not reach here');
    } catch (error) {
      //console.log(error);
      assert.equal(
        error.detail.filter(e => e.field === 'locationUid').pop().code,
        'required'
      );
    }
  });

  it('draft event does not need to be complete to be valid', async () => {
    const clean = await validate({
      eventAttendanceMode: 1,
    }, { isDraft: 1 });

    assert.equal(clean.eventAttendanceMode, 1);
  });

  it('location needs to be specified if eventAttendanceMode is mixed', async () => {
    try {
      await validate({
        eventAttendanceMode: 3
      });

      throw new Error('should not reach here');
    } catch (error) {
      assert.equal(
        error.detail.filter(e => e.field === 'locationUid').pop().code,
        'required'
      );
    }
  });

  it('location does not need to be specified iff eventAttendanceMode is online', async () => {
    try  {
      await validate({
        eventAttendanceMode: 2
      });
      throw new Error('should not reach here');
    } catch (error) {
      assert.equal(
        error.detail.filter(e => e.field === 'locationUid').length,
        0
      );
    }
  });

  it('age should be an object with min and max values', async () => {
    const clean = await validate({
      age: { min: 12, max: 100 }
    }, { isDraft: true });

    assert.deepEqual(clean.age, {
      min: 12,
      max: 100
    });
  });

  it('legacy: if image is provided as an object that includes null filename, it is considered as null image', async () => {
    const clean = await validate({
      image: {
        extension: null,
        originalName: null,
        filename: null,
        credits: null,
        variants: undefined,
        size: undefined
      }
    }, { isDraft: true });

    assert.equal(clean.image, null);
  });

  it('complete online event needs at least a title, description, eventAttendanceMode, timings and a onlineAccessLink', async () => {
    await validate({
      title: 'Un événement',
      description: 'Une description',
      eventAttendanceMode: 2,
      onlineAccessLink: 'https://wheretheeventtakesplace.com',
      timings: [{
        begin: '2020-11-30T08:00:00.000Z',
        end: '2020-11-30T10:00:00.000Z'
      }],
    });
  });

  it('unspecified age is a null min and null max', async () => {
    const clean = await validate({
      title: 'Un événement',
      description: 'Une description',
      eventAttendanceMode: 2,
      onlineAccessLink: 'https://wheretheeventtakesplace.com',
      timings: [{
        begin: '2020-11-30T08:00:00.000Z',
        end: '2020-11-30T10:00:00.000Z'
      }],
    });

    assert.deepEqual(clean.age, {
      min: null,
      max: null
    });
  });

  it('complete mixed event needs a location and a onlineAccessLink', async () => {
    try {
      await validate({
        title: 'Un événement',
        description: 'Une description',
        eventAttendanceMode: 3,
        timings: [{
          begin: '2020-11-30T08:00:00.000Z',
          end: '2020-11-30T10:00:00.000Z'
        }]
      });

      throw new Error('should not reach here')
    } catch (error) {
      assert.deepEqual(
        error.detail.map(e => e.field),
        ['onlineAccessLink', 'locationUid']
      );
    }
  });

});
