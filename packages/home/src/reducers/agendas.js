import _ from 'lodash';

const LOAD = 'home/agendas/LOAD';
const LOAD_SUCCESS = 'home/agendas/LOAD_SUCCESS';
const LOAD_FAIL = 'home/agendas/LOAD_FAIL';
const MEMBER_UPDATE_SUCCESS = 'home/agendas/MEMBER_UPDATE_SUCCESS';
const LIST = 'home/agendas/LIST';
const LIST_SUCCESS = 'home/agendas/LIST_SUCCESS';
const LIST_FAIL = 'home/agendas/LIST_FAIL';
const NEXT_PAGE = 'home/agendas/NEXT_PAGE';
const NEXT_PAGE_SUCCESS = 'home/agendas/NEXT_PAGE_SUCCESS';
const NEXT_PAGE_FAIL = 'home/agendas/NEXT_PAGE_FAIL';

const memberLegacyFields = {
  name: 'contactName',
  position: 'contactPosition',
  email: 'email',
  organization: 'organization',
  number: 'contactNumber',
};

const initialState = {};

function patchAgendas(agendas, member, update) {
  const index = _.findIndex(agendas, a => a.uid === member.agendaUid);

  if (index === -1) {
    return agendas;
  }

  Object.keys(update).forEach(field => {
    if (memberLegacyFields[field]) {
      agendas[index].member.custom[memberLegacyFields[field]] = update[field];
    }
  });

  return agendas;
}

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          loading: true,
        },
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          loaded: true,
          data: action.result.agendas,
          total: action.result.total,
          page: 1,
          error: null,
          loading: false,
        },
      };
    case MEMBER_UPDATE_SUCCESS:
      return {
        ...state,
        agendas: patchAgendas(action.agendas, action.member, action.update),
      };
    case LOAD_FAIL:
      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          data: null,
          total: null,
          page: 1,
          error: action.error,
          loading: false,
        },
      };
    case LIST:
      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          listLoading: true,
        },
      };
    case LIST_SUCCESS:
      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          data: action.result.agendas,
          total: action.result.total,
          page: 1,
          error: null,
          listLoading: false,
        },
      };
    case LIST_FAIL:
      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          data: null,
          total: null,
          page: 1,
          error: action.error,
          listLoading: false,
        },
      };
    case NEXT_PAGE:
      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          nextLoading: true,
        },
      };
    case NEXT_PAGE_SUCCESS:
      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          data: [...state[action.key].data, ...action.result.agendas],
          total: action.result.total,
          page: action.page,
          error: null,
          nextLoading: false,
        },
      };
    case NEXT_PAGE_FAIL:
      return {
        ...state,
        [action.key]: {
          ...state[action.key],
          error: action.error,
          nextLoading: false,
        },
      };
    default:
      return state;
  }
}

export function updatedMember(agendas, member, update) {
  return {
    type: MEMBER_UPDATE_SUCCESS,
    agendas,
    member,
    update,
  };
}

export function isLoaded(key, globalState) {
  return (
    globalState.agendas
    && globalState.agendas[key]
    && globalState.agendas[key].loaded
  );
}

export function load(key, query) {
  return {
    key,
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.get(res.agendas.list, { params: query });
    },
  };
}

export function list(key, query) {
  return {
    key,
    types: [LIST, LIST_SUCCESS, LIST_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.get(res.agendas.list, { params: query });
    },
  };
}

export function nextPage(key, query, page) {
  return {
    key,
    page,
    types: [NEXT_PAGE, NEXT_PAGE_SUCCESS, NEXT_PAGE_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.get(res.agendas.list, { params: { ...query, page } });
    },
  };
}
