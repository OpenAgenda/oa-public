import { actionTypes as formActionTypes, SubmissionError } from 'redux-form';
import slug from 'speakingurl';

const LOAD = 'agenda-settings/agenda/LOAD';
const LOAD_SUCCESS = 'agenda-settings/agenda/LOAD_SUCCESS';
const LOAD_FAIL = 'agenda-settings/agenda/LOAD_FAIL';
const CREATE = 'agenda-settings/agenda/CREATE';
const CREATE_SUCCESS = 'agenda-settings/agenda/CREATE_SUCCESS';
const CREATE_FAIL = 'agenda-settings/agenda/CREATE_FAIL';
const EDIT = 'agenda-settings/agenda/EDIT';
const EDIT_SUCCESS = 'agenda-settings/agenda/EDIT_SUCCESS';
const EDIT_FAIL = 'agenda-settings/agenda/EDIT_FAIL';
const CHECK_SLUG = 'agenda-settings/agenda/CHECK_SLUG';
const CHECK_SLUG_SUCCESS = 'agenda-settings/agenda/CHECK_SLUG_SUCCESS';
const CHECK_SLUG_FAIL = 'agenda-settings/agenda/CHECK_SLUG_FAIL';
const REMOVE = 'agenda-settings/agenda/REMOVE';
const REMOVE_SUCCESS = 'agenda-settings/agenda/REMOVE_SUCCESS';
const REMOVE_FAIL = 'agenda-settings/agenda/REMOVE_FAIL';

const initialState = {
  loaded: false
};

function replacerWithPath(replacer) {
  const m = new Map();

  return function (field, value) {
    const pathname = m.get(this);
    let path;

    if (pathname) {
      const suffix = Array.isArray(this) ? `[${field}]` : `.${field}`;

      path = pathname + suffix;
    } else {
      path = field;
    }

    if (value === Object(value)) {
      m.set(value, path);
    }

    return replacer.call(this, field, value, path);
  }
}

function walkWith(obj, fn, preserveUndefined) {
  const walk = objPart => {
    if (objPart === undefined) {
      return;
    }

    let result;

    // TODO other types than object
    for (const key in objPart) {
      const val = objPart[key];
      let modified;

      if (val === Object(val)) {
        modified = walk(fn.call(objPart, key, val));
      } else {
        modified = fn.call(objPart, key, val);
      }

      if (preserveUndefined || modified !== undefined) {
        if (result === undefined) {
          result = {};
        }

        result[key] = modified;
      }
    }

    return result;
  };

  return walk(fn.call({ '': obj }, '', obj));
}

function toMixedMultipart(data, bodyKey = 'data', form = new FormData()) {
  const replacer = (name, value, path) => {
    // Simple Blob
    if (value instanceof Blob) {
      form.append(path, value);

      return undefined;
    }

    // Array of Blobs
    if (Array.isArray(value) && value.every(v => (v instanceof Blob))) {
      value.forEach((v, i) => {
        form.append(`${path}[${i}]`, v);
      });

      return undefined;
    }

    return value;
  };

  const dataStr = JSON.stringify(data, replacerWithPath(replacer));

  form.append(bodyKey, dataStr);

  return form;
}

const catchValidation = res => {
  if (res.errors) {
    throw new SubmissionError(Object.assign(...res.errors.map(v => ({ [v.field]: v.message }))));
  }
  if (res.response && res.response.error && res.response.error.message) {
    throw new SubmissionError({ _error: res.response.error.message });
  }
  return Promise.reject(res);
};

export default function reducer(state = initialState, action = {}) {
  switch (action.type) {
    case LOAD:
      return {
        ...state,
        loading: true
      };
    case LOAD_SUCCESS:
      return {
        ...state,
        loading: false,
        loaded: true,
        data: action.result,
        error: null
      };
    case LOAD_FAIL:
      return {
        ...state,
        loading: false,
        loaded: false,
        data: null,
        error: typeof action.error === 'string' ? action.error : 'Error'
      };
    case EDIT_SUCCESS:
      return {
        ...state,
        data: action.result.agenda
      };
    default:
      return state;
  }
};

export function formPlugin(state = {}, action) {
  switch (action.type) {
    case formActionTypes.CHANGE:
      if (!state.values) {
        return {
          ...state,
          slugModified: false
        };
      }
      if (action.meta.field === 'slug') {
        return {
          ...state,
          slugModified: action.payload !== ''
        }
      }
      if (action.meta.field !== 'title' || state.slugModified) {
        return state;
      }
      return {
        ...state,
        values: {
          ...state.values,
          slug: slug(action.payload, { lower: true })
        }
      };
    default:
      return state;
  }
}

export function create(data) {
  return {
    types: [CREATE, CREATE_SUCCESS, CREATE_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.post(res.create, data).catch(catchValidation);
    }
  };
}

export function edit(data) {
  return {
    types: [EDIT, EDIT_SUCCESS, EDIT_FAIL],
    promise: ({ client, params }, { getState }) => {
      const { res } = getState();

      return client.post(res.set.replace(':slug', params.slug), toMixedMultipart(data))
        .catch(catchValidation);
    }
  };
}

export function checkSlug(data) {
  return {
    types: [CHECK_SLUG, CHECK_SLUG_SUCCESS, CHECK_SLUG_FAIL],
    promise: ({ client }, { getState }) => {
      const { res } = getState();

      return client.post(res.slugAvailable, data);
    }
  };
}

export function remove() {
  return {
    types: [REMOVE, REMOVE_SUCCESS, REMOVE_FAIL],
    promise: ({ client, params }, { getState }) => {
      const { res } = getState();

      return client.post(res.remove.replace(':slug', params.slug));
    }
  };
}
