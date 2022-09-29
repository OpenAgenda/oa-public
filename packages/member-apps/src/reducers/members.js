import _ from 'lodash';
import getRoleSlug from '@openagenda/members/build/getRoleSlug';

const LOAD = 'member-apps/members/LOAD';
const LOAD_SUCCESS = 'member-apps/members/LOAD_SUCCESS';
const LOAD_FAIL = 'member-apps/members/LOAD_FAIL';
const GET_STATS = 'member-apps/members/GET_STATS';
const GET_STATS_SUCCESS = 'member-apps/members/GET_STATS_SUCCESS';
const GET_STATS_FAIL = 'member-apps/members/GET_STATS_FAIL';
const LIST = 'member-apps/members/LIST';
const LIST_SUCCESS = 'member-apps/members/LIST_SUCCESS';
const LIST_FAIL = 'member-apps/members/LIST_FAIL';
const NEXT_PAGE = 'member-apps/members/NEXT_PAGE';
const NEXT_PAGE_SUCCESS = 'member-apps/members/NEXT_PAGE_SUCCESS';
const NEXT_PAGE_FAIL = 'member-apps/members/NEXT_PAGE_FAIL';
const PATCH = 'member-apps/members/PATCH';
const PATCH_SUCCESS = 'member-apps/members/PATCH_SUCCESS';
const PATCH_SUCCESS_CONFIRM = 'member-apps/members/PATCH_SUCCESS_CONFIRM';
const PATCH_FAIL = 'member-apps/members/PATCH_FAIL';
const UPDATE_LIST_ITEM = 'member-apps/members/UPDATE_LIST_ITEM';
const INVITE = 'member-apps/members/INVITE';
const INVITE_SUCCESS = 'member-apps/members/INVITE_SUCCESS';
const INVITE_FAIL = 'member-apps/members/INVITE_FAIL';
const RESEND_INVITATION = 'member-apps/members/RESEND_INVITATION';
const RESEND_INVITATION_SUCCESS = 'member-apps/members/RESEND_INVITATION_SUCCESS';
const RESEND_INVITATION_FAIL = 'member-apps/members/RESEND_INVITATION_FAIL';
const REMOVE = 'member-apps/members/REMOVE';
const REMOVE_SUCCESS = 'member-apps/members/REMOVE_SUCCESS';
const REMOVE_FAIL = 'member-apps/members/REMOVE_FAIL';
const CLEAN_INVITE_RESULT = 'member-apps/members/CLEAN_INVITE_RESULT';
const ADD_CRED_FILTER = 'member-apps/members/ADD_CRED_FILTER';
const REMOVE_CRED_FILTER = 'member-apps/members/REMOVE_CRED_FILTER';
const CLEAN_CRED_FILTERS = 'member-apps/members/CLEAN_CRED_FILTERS';
const SEND_MESSAGE = 'member-apps/members/SEND_MESSAGE';
const SEND_MESSAGE_SUCCESS = 'member-apps/members/SEND_MESSAGE_SUCCESS';
const SEND_MESSAGE_FAIL = 'member-apps/members/SEND_MESSAGE_FAIL';
const GET_SCHEMA = 'member-apps/members/GET_SCHEMAS';
const GET_SCHEMA_SUCCESS = 'member-apps/members/GET_SCHEMAS_SUCCESS';
const GET_SCHEMA_FAIL = 'member-apps/members/GET_SCHEMAS_FAIL';

const initialState = {
  loaded: false,
  credFilters: [],
};

export default function reducer(state = initialState, action) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loadLoading: true,
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loaded: true,
        data: action.result.members,
        total: action.result.total,
        credFilters: [].concat(action.query.credentials || []),
        page: 1,
        error: null,
        loadLoading: false,
      };
    case LOAD_FAIL:
      return {
        ...state,
        data: null,
        total: null,
        page: 1,
        error: action.error,
        loadLoading: false,
      };
    case GET_STATS_SUCCESS:
      return {
        ...state,
        stats: action.result,
      };
    case GET_SCHEMA_SUCCESS:
      return {
        ...state,
        schema: action.result.merged,
      };
    case LIST:
      return {
        ...state,
        listLoading: true,
      };
    case LIST_SUCCESS:
      return {
        ...state,
        data: action.result.members,
        total: action.result.total,
        page: 1,
        error: null,
        listLoading: false,
      };
    case LIST_FAIL:
      return {
        ...state,
        data: null,
        total: null,
        page: 1,
        error: action.error,
        listLoading: false,
      };
    case NEXT_PAGE:
      return {
        ...state,
        nextLoading: true,
      };
    case NEXT_PAGE_SUCCESS:
      return {
        ...state,
        data: [...state.data, ...action.result.members],
        total: action.result.total,
        page: action.page,
        error: null,
        nextLoading: false,
      };
    case NEXT_PAGE_FAIL:
      return {
        ...state,
        error: action.error,
        nextLoading: false,
      };
    case PATCH:
      return {
        ...state,
        patching: true,
      };
    case PATCH_SUCCESS: {
      const data = state.data.map(m => (m.id === action.memberId
        ? {
          ...m,
          role: action.result.role || m.role,
        }
        : m));
      return {
        ...state,
        data,
        patchError: null,
        patchSuccessModal: true,
        patching: false,
      };
    }
    case PATCH_SUCCESS_CONFIRM: {
      return {
        ...state,
        patchSuccessModal: false,
      };
    }
    case PATCH_FAIL:
      return {
        ...state,
        patchError: action.error,
        patching: false,
      };
    case UPDATE_LIST_ITEM: {
      const index = _.findIndex(state.data, m => m.id === action.memberId);

      if (index === -1) return state;

      Object.assign(state.data[index], {
        custom: action.custom,
      });

      return state;
    }
    case INVITE:
      return {
        ...state,
        inviteLoading: true,
      };
    case INVITE_SUCCESS:
      return {
        ...state,
        inviteError: null,
        inviteLoading: false,
        showInviteResult: true,
      };
    case INVITE_FAIL:
      return {
        ...state,
        inviteError: action.error,
        inviteLoading: false,
        showInviteResult: true,
      };
    case REMOVE_SUCCESS: {
      const index = _.findIndex(state.data, m => m.id === action.memberId);

      if (index === -1) return state;

      const member = state.data[index];
      const role = getRoleSlug(member.role);
      return {
        ...state,
        data: [...state.data.slice(0, index), ...state.data.slice(index + 1)],
        total: state.total - 1,
        stats: {
          ...state.stats,
          total: state.stats.total - 1,
          totalPerRole: {
            ...state.stats.totalPerRole,
            [role]: state.stats.totalPerRole[role] - 1,
          },
        },
      };
    }
    case CLEAN_INVITE_RESULT:
      return {
        ...state,
        inviteError: false,
        showInviteResult: false,
      };
    case ADD_CRED_FILTER:
      return {
        ...state,
        credFilters: [...state.credFilters, action.role],
      };
    case REMOVE_CRED_FILTER:
      return {
        ...state,
        credFilters: state.credFilters.filter(role => role !== action.role),
      };
    case CLEAN_CRED_FILTERS:
      return {
        ...state,
        credFilters: [],
      };
    default:
      return state;
  }
}

export function isLoaded(globalState) {
  return globalState.members && globalState.members.loaded;
}

export function load(agenda, query = {}) {
  return {
    types: [LOAD, LOAD_SUCCESS, LOAD_FAIL],
    query,
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.get(res.list.replace(':slug', agenda.slug), {
        params: query,
      });
    },
  };
}

export function getStats(agenda) {
  return {
    types: [GET_STATS, GET_STATS_SUCCESS, GET_STATS_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.get(res.stats.replace(':slug', agenda.slug));
    },
  };
}

export function getSchema(agenda) {
  return {
    types: [GET_SCHEMA, GET_SCHEMA_SUCCESS, GET_SCHEMA_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();
      return client.get(res.getSchema.replace(':agendaUid', agenda.uid));
    },
  };
}

export function list(agenda, query = {}) {
  return {
    types: [LIST, LIST_SUCCESS, LIST_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.get(res.list.replace(':slug', agenda.slug), {
        params: query,
      });
    },
  };
}

export function nextPage(agenda, query, page) {
  return {
    types: [NEXT_PAGE, NEXT_PAGE_SUCCESS, NEXT_PAGE_FAIL],
    page,
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.get(res.list.replace(':slug', agenda.slug), {
        params: {
          ...query,
          page,
        },
      });
    },
  };
}

export function patch(agenda, memberId, { role }) {
  return {
    types: [PATCH, PATCH_SUCCESS, PATCH_FAIL],
    memberId,
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.patch(
        res.update
          .replace(':agendaUid', agenda.uid)
          .replace(':memberId', memberId),
        {
          role,
        }
      );
    },
  };
}

export function updateListItem(data) {
  const map = {
    name: 'contactName',
    phone: 'contactNumber',
    position: 'contactPosition',
    organization: 'organization',
    email: 'email',
  };

  return {
    type: UPDATE_LIST_ITEM,
    custom: Object.keys(map).reduce(
      (carry, key) => ({
        ...carry,
        [map[key]]: data[key],
      }),
      {}
    ),
    role: data.role,
    memberId: data.id,
  };
}

export function patchSuccessConfirm() {
  return {
    type: PATCH_SUCCESS_CONFIRM,
  };
}

export function invite(agenda, data) {
  return {
    types: [INVITE, INVITE_SUCCESS, INVITE_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();
      const emails = _.get(data, 'emails', [])
        .split(/[\s\n,]+/)
        .map(email => email.trim())
        .filter(email => !!email);

      return client.post(res.invite.replace(':slug', agenda.slug), {
        emails,
        role: data.role,
        context: {
          message: data.message,
        },
      });
    },
  };
}

export function resendInvitation(agenda, id) {
  return {
    types: [
      RESEND_INVITATION,
      RESEND_INVITATION_SUCCESS,
      RESEND_INVITATION_FAIL,
    ],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.put(
        res.resend.replace(':slug', agenda.slug).replace(':id', id),
        {}
      );
    },
  };
}

export function cleanInviteResult() {
  return {
    type: CLEAN_INVITE_RESULT,
  };
}

export function remove(agenda, memberId) {
  return {
    types: [REMOVE, REMOVE_SUCCESS, REMOVE_FAIL],
    memberId,
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.delete(
        res.remove
          .replace(':agendaUid', agenda.uid)
          .replace(':memberId', memberId)
      );
    },
  };
}

export function sendMessage(agenda, data, query) {
  return {
    types: [SEND_MESSAGE, SEND_MESSAGE_SUCCESS, SEND_MESSAGE_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.post(res.sendMessage.replace(':slug', agenda.slug), data, {
        params: query,
      });
    },
  };
}

export function addCredFilter(role) {
  return {
    type: ADD_CRED_FILTER,
    role,
  };
}

export function removeCredFilter(role) {
  return {
    type: REMOVE_CRED_FILTER,
    role,
  };
}

export function cleanCredFilters() {
  return {
    type: CLEAN_CRED_FILTERS,
  };
}
