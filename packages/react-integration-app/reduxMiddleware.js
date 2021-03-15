'use strict';

module.exports = function reduxMiddleware(layoutStore) {
  return (/* store */) => next => action => {
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
        layoutStore.dispatch({
          type: 'react-layouts/agendaAdmin/UPDATE_AGENDA',
          payload: {
            agenda: action.result.agenda,
          },
        });
        break;
      }
      default:
        break;
    }

    return next(action);
  };
};
