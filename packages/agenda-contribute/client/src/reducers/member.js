const actionTypes = {
  UPDATE: 'agenda-contribute/member/UPDATE'
};

module.exports = Object.assign(reducer, {
  updated,
  actionTypes
});


function reducer(state = {}, action = {}) {
  switch (action.type) {
    case actionTypes.UPDATE:
      return action.member;
  }

  return state;
}


/**
 * member data update was confirmed by server
 */

function updated(member) {
  return (dispatch, getState, history) => {
    const state = getState();
    const { base } = state.config;

    dispatch({ type: actionTypes.UPDATE, member });
    return history.push(base + '/event');
  }
}
