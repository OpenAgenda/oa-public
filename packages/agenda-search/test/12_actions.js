'use strict';

const assert = require('assert');
const actions = require('../components/src/actions');

describe('12 - Components actions', () => {
  const currentState = {
    query: {
      search: 'blip'
    },
    pageRange: [2, 3],
    agendas: ['agenda2', 'agenda3']
  };

  const data = {
    agendas: ['agenda123', 'agenda345'],
    total: 12000
  };

  it('addPageItems next', () => {
    assert.deepEqual(
      actions.addPageItems(currentState, true, data),
      {
        query: {
          search: 'blip'
        },
        pageRange: [2, 4],
        agendas: ['agenda2', 'agenda3', 'agenda123', 'agenda345']
      }    
    );
  });

  it('addPageItems previous', () => {
    assert.deepEqual(
      actions.addPageItems(currentState, false, data),
      {
        query: {
          search: 'blip'
        },
        pageRange: [1, 3],
        agendas: ['agenda123', 'agenda345', 'agenda2', 'agenda3']
      }
    );
  });

  it('resetPageItems', () => {
    assert.deepEqual(
      actions.resetPageItems(currentState, {
        search: 'bloup'
      }, data),
      {
        query: {
          search: 'bloup'
        },
        pageRange: [1, 1],
        agendas: ['agenda123', 'agenda345'],
        total: 12000,
        loading: false
      }
    );
    
  });

});