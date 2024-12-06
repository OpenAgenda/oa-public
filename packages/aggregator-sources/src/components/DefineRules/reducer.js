import _ from 'lodash';

export default (state, action) => {
  switch (action.type) {
    case 'setMode': {
      return {
        ...state,
        mode: action.payload.mode,
        modeOptions: action.payload.options,
      };
    }
    case 'addRule': {
      if (state.modeOptions.isRequiredFilter) {
        return {
          ...state,
          rules: {
            requiredFilters: [
              ...state.rules.requiredFilters,
              { id: _.uniqueId(), ...action.payload.rule },
            ],
            actions: state.rules.actions,
          },
        };
      }
      return {
        ...state,
        rules: {
          requiredFilters: state.rules.requiredFilters,
          actions: [
            ...state.rules.actions,
            { id: _.uniqueId(), ...action.payload.rule },
          ],
        },
      };
    }
    case 'updateRule': {
      if (state.modeOptions.isRequiredFilter) {
        return {
          ...state,
          rules: {
            requiredFilters: state.rules.requiredFilters.map((rule) =>
              (rule.id === action.payload.id
                ? {
                  id: action.payload.id,
                  ...action.payload.rule,
                }
                : rule)),
            actions: state.rules.actions,
          },
        };
      }
      return {
        ...state,
        rules: {
          requiredFilters: state.rules.requiredFilters,
          actions: state.actions.rules.map((rule) =>
            (rule.id === action.payload.id
              ? {
                id: action.payload.id,
                ...action.payload.rule,
              }
              : rule)),
        },
      };
    }
    case 'removeRule': {
      if (action.payload.isRequiredFilter) {
        return {
          ...state,
          rules: {
            requiredFilters: state.rules.requiredFilters.filter(
              (rule) => rule.id !== action.payload.id,
            ),
            actions: state.rules.actions,
          },
        };
      }
      return {
        ...state,
        rules: {
          requiredFilters: state.rules.requiredFilters,
          actions: state.rules.actions.filter(
            (rule) => rule.id !== action.payload.id,
          ),
        },
      };
    }
    case 'reorderRules': {
      if (action.payload.isRequiredFilter) {
        const requiredFilters = Array.from(state.rules.requiredFilters);
        const [itemToMove] = requiredFilters.splice(
          action.payload.startIndex,
          1,
        );
        requiredFilters.splice(action.payload.endIndex, 0, itemToMove);
        return {
          ...state,
          rules: {
            requiredFilters,
            actions: state.rules.actions,
          },
        };
      }
      const actions = Array.from(state.rules.actions);
      const [itemToMove] = actions.splice(action.payload.startIndex, 1);
      actions.splice(action.payload.endIndex, 0, itemToMove);
      return {
        ...state,
        rules: {
          requiredFilters: state.rules.requiredFilters,
          actions,
        },
      };
    }
    default:
      return state;
  }
};
