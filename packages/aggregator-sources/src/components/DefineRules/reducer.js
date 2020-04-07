import _ from 'lodash';

export default (state, action) => {
  switch (action.type) {
    case 'setMode': {
      return {
        ...state,
        mode: action.payload.mode,
        modeOptions: action.payload.options
      };
    }
    case 'addRule': {
      return {
        ...state,
        rules: [
          ...state.rules,
          {
            id: _.uniqueId(), // for react key prop
            ...action.payload.rule
          }
        ]
      };
    }
    case 'updateRule': {
      return {
        ...state,
        rules: state.rules.map(rule => (rule.id === action.payload.id
          ? {
            id: action.payload.id,
            ...action.payload.rule
          }
          : rule))
      };
    }
    case 'removeRule': {
      return {
        ...state,
        rules: state.rules.filter(rule => rule.id !== action.payload.id)
      };
    }
    case 'reorderRules': {
      const rules = Array.from(state.rules);
      const [itemToMove] = rules.splice(action.payload.startIndex, 1);
      rules.splice(action.payload.endIndex, 0, itemToMove);
      return {
        ...state,
        rules
      };
    }
    default:
      return state;
  }
};
