'use strict';

const { produce } = require('immer');

module.exports = function reduxMiddleware(layoutStore, queryClient) {
  return (/* store */) => next => async action => {
    try {
      switch (action.type) {
        case 'user-apps/userSettings/UPDATE_USER_SUCCESS': {
          layoutStore.dispatch({
            type: 'react-layouts/main/UPDATE_USER',
            payload: {
              user: {
                thumbnail: action.result.image
                  ? `${action.result.image}?d=${new Date().getTime()}`
                  : null,
                ...action.result,
              },
            },
          });
          break;
        }
        case 'agenda-settings/agenda/EDIT_SUCCESS': {
          const queryKeyPrefix = ['react-layouts', 'agendaAdminData'];

          // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
          await queryClient.cancelQueries(queryKeyPrefix);

          const queryCache = queryClient.getQueryCache();
          const query = queryCache.findAll(queryKeyPrefix)[0];

          queryClient.setQueryData(
            query.queryKey,
            produce(draft => {
              draft.agenda = action.result.data.agenda;
            })
          );
          break;
        }
        default:
          break;
      }
    } catch (e) {
      console.log('Error in reduxMiddleware:', e);
    }

    return next(action);
  };
};
