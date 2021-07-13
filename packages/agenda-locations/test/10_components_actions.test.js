'use strict';

const actions = require('../components/src/actions');

describe('actions', () => {
  it('addLocation - adds a new location on top of the list', () => {
    expect(actions.tests.addLocation(
      { locations: [{ name: 'second' }, { name: 'third' }] },
      { name: 'first' }
    )).toEqual({
      form: false,
      locations: [{ name: 'first' }, { name: 'second' }, { name: 'third' }],
    });
  });

  it('updateEditedLocation - updates one location and closes form', () => {
    expect(actions.tests.updateEditedLocation(
      {
        form: {
          locationIndex: 1,
        },
        locations: [{}, { name: 'grut' }, {}],
      }, { name: 'bruuu' }, true
    )).toEqual({
      form: false,
      locations: [{}, { name: 'bruuu' }, {}],
    });
  });

  it('updateEditedLocation - updates one location in list', () => {
    expect(actions.tests.updateEditedLocation(
      {
        form: {
          locationIndex: 1,
        },
        locations: [{}, { name: 'grut' }, {}],
      }, { name: 'bruuu' }
    )).toEqual({
      form: {
        locationIndex: 1,
      },
      locations: [{}, { name: 'bruuu' }, {}],
    });
  });

  it('closeMerge reinitialises query and locations to force list get', () => {
    expect(actions.tests.closeMerge({
      query: { a: 1, b: 2 },
      locations: [1, 2, 3],
    })).toEqual({
      modal: false,
      merge: false,
      query: {},
      locations: [],
    });
  });

  it('assign function sticks state as first arg of stateless function', async () => {
    const newState = await new Promise(rs => {
      const a = actions({
        setState: rs,
        getState: () => ({
          query: { a: 1, b: 2 },
          locations: [1, 2, 3],
        }),
      });
      a.closeMerge();
    });

    expect(newState).toStrictEqual({
      modal: false,
      merge: false,
      query: {},
      locations: [],
    });
  });

  it('updateSearchQuery - empty string counts as a removal from query', () => {
    expect(actions.updateSearchQuery({ random: 'field' }, 'random', '')).toEqual({});
  });

  it('updateSearchQuery - undefined value is removed from query', () => {
    expect(actions.updateSearchQuery({ random: 'field' }, 'random', undefined)).toEqual({});
  });

  it('updateSearchQuery - value set to 0 is set to 0', () => {
    expect(actions.updateSearchQuery({}, 'random', 0)).toEqual({ random: 0 });
  });
});
