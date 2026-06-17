import { produce } from 'immer';

export default function reduxMiddleware(layoutStore, queryClient) {
  return (/* store */) => (next) => async (action) => {
    try {
      switch (action.type) {
        case 'agenda-settings/agenda/EDIT_SUCCESS': {
          const queryKeyPrefix = ['react-layouts', 'agendaAdminData'];

          // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
          await queryClient.cancelQueries(queryKeyPrefix);

          const queryCache = queryClient.getQueryCache();
          const query = queryCache.findAll(queryKeyPrefix)[0];

          queryClient.setQueryData(
            query.queryKey,
            produce((draft) => {
              draft.agenda = action.result.agenda;
            }),
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
}
