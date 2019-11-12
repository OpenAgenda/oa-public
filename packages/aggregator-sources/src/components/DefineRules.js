import _ from 'lodash';
import React, { useCallback, useMemo, useReducer } from 'react';
import * as ReactIs from 'react-is';
import { defineMessages, useIntl } from 'react-intl';
import { Form } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import { ruleToValues, valuesToRule } from '../utils/rules';
import RuleForm from './RuleForm';

const messages = defineMessages({
  requiredType: {
    id: 'aggregator-sources.DefineRules.requiredType',
    defaultMessage: 'Required type'
  },
  badType: {
    id: 'aggregator-sources.DefineRules.badType',
    defaultMessage: 'Bad type'
  },
  requiredSubdivision: {
    id: 'aggregator-sources.DefineRules.requiredSubdivision',
    defaultMessage: 'Required subdivision'
  },
  requiredValues: {
    id: 'aggregator-sources.DefineRules.requiredValues',
    defaultMessage: 'Required values'
  },
  cancel: {
    id: 'aggregator-sources.DefineRules.cancel',
    defaultMessage: 'Cancel'
  },
  add: {
    id: 'aggregator-sources.DefineRules.add',
    defaultMessage: 'Add'
  },
  update: {
    id: 'aggregator-sources.DefineRules.update',
    defaultMessage: 'Update'
  },
  remove: {
    id: 'aggregator-sources.DefineRules.remove',
    defaultMessage: 'Remove'
  },
  locationFilter: {
    id: 'aggregator-sources.DefineRules.locationFilter',
    defaultMessage: 'Location filter'
  },
  tagFilter: {
    id: 'aggregator-sources.DefineRules.tagFilter',
    defaultMessage: 'Tag filter'
  },
  addARule: {
    id: 'aggregator-sources.DefineRules.addARule',
    defaultMessage: 'Add a rule'
  },
  newRule: {
    id: 'aggregator-sources.DefineRules.newRule',
    defaultMessage: 'New rule'
  },
  updateARule: {
    id: 'aggregator-sources.DefineRules.updateARule',
    defaultMessage: 'Update a rule'
  },
  noDefinedRule: {
    id: 'aggregator-sources.DefineRules.noDefinedRules',
    defaultMessage: 'No defined rule'
  }
});

function validate(intl, values) {
  if (!values.type) {
    return { [FORM_ERROR]: intl.formatMessage(messages.requiredType) };
  }
  if (!['location', 'tags'].includes(values.type)) {
    return { [FORM_ERROR]: intl.formatMessage(messages.badType) };
  }

  if (values.type === 'location') {
    if (!values.subdivision) {
      return { [FORM_ERROR]: intl.formatMessage(messages.requiredSubdivision) };
    }
  }

  if (!values.values || !values.values.length) {
    return { [FORM_ERROR]: intl.formatMessage(messages.requiredValues) };
  }
}

function getInitialState(initialRules) {
  const rules = initialRules
    ? initialRules.map(rule => ({
      id: _.uniqueId(), // for react key prop
      ...rule
    }))
    : [];

  return {
    rules,
    mode: 'list',
    modeOptions: {}
  };
}

function reducer(state, action) {
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
    default:
      return state;
  }
}

function AddRuleSubmitButton({ handleSubmit, onCancel }) {
  const intl = useIntl();

  return (
    <div>
      <div className="pull-left">
        <button
          type="button"
          className="btn btn-link text-danger cancel-button-left"
          onClick={onCancel}
        >
          {intl.formatMessage(messages.cancel)}
        </button>
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="btn btn-primary"
          onClick={handleSubmit}
        >
          {intl.formatMessage(messages.add)}
        </button>
      </div>
    </div>
  );
}

function UpdateRuleSubmitButton({ handleSubmit, onCancel }) {
  const intl = useIntl();

  return (
    <div>
      <div className="pull-left">
        <button
          type="button"
          className="btn btn-link text-danger cancel-button-left"
          onClick={onCancel}
        >
          {intl.formatMessage(messages.cancel)}
        </button>
      </div>

      <div className="text-right">
        <button
          type="submit"
          className="btn btn-primary"
          onClick={handleSubmit}
        >
          {intl.formatMessage(messages.update)}
        </button>
      </div>
    </div>
  );
}

function RuleItem({ rule, onUpdate, onRemove }) {
  const intl = useIntl();

  const handleUpdate = useCallback(() => onUpdate(rule.id), [
    onUpdate,
    rule.id
  ]);
  const handleRemove = useCallback(() => onRemove(rule.id), [
    onRemove,
    rule.id
  ]);

  return (
    <div className="row margin-v-sm">
      <div className="col-md-6">
        <div className="filter-value">
          {rule.query.location
            ? Object.values(rule.query.location)[0].join(', ')
            : null}

          {rule.query.tags ? rule.query.tags.join(', ') : null}
        </div>

        <span className="text-muted">
          {rule.query.location
            ? intl.formatMessage(messages.locationFilter)
            : null}

          {rule.query.tags ? intl.formatMessage(messages.tagFilter) : null}
        </span>
      </div>

      <div className="col-md-3 text-center">
        <button type="button" className="btn btn-link" onClick={handleUpdate}>
          {intl.formatMessage(messages.update)}
        </button>
      </div>

      <div className="col-md-3 text-center">
        <button
          type="button"
          className="btn btn-link text-danger"
          onClick={handleRemove}
        >
          {intl.formatMessage(messages.remove)}
        </button>
      </div>
    </div>
  );
}

export default function DefineRules({
  initialRules,
  SubmitButton,
  onSubmit,
  onCancel
}) {
  const intl = useIntl();

  const initialState = useMemo(() => getInitialState(initialRules), [
    initialRules
  ]);
  const [state, dispatch] = useReducer(reducer, initialState);

  const setMode = useCallback(
    (mode, options = {}) => dispatch({
      type: 'setMode',
      payload: {
        mode,
        options
      }
    }),
    [dispatch]
  );

  const setModeAdd = useCallback(() => setMode('add'), [setMode]);
  const setModeList = useCallback(() => setMode('list'), [setMode]);
  const setModeUpdate = useCallback(id => setMode('update', { id }), [setMode]);

  const addRule = useCallback(
    values => {
      const errors = validate(intl, values);

      if (errors) {
        return errors;
      }

      const rule = valuesToRule(values);

      dispatch({
        type: 'addRule',
        payload: {
          rule
        }
      });

      setMode('list');
    },
    [dispatch, setMode, intl]
  );
  const updateRule = useCallback(
    values => {
      const errors = validate(intl, values);

      if (errors) {
        return errors;
      }

      const rule = valuesToRule(values);

      dispatch({
        type: 'updateRule',
        payload: {
          id: state.modeOptions.id,
          rule
        }
      });

      setMode('list');
    },
    [dispatch, state.modeOptions.id, setMode, intl]
  );
  const removeRule = useCallback(
    id => dispatch({
      type: 'removeRule',
      payload: {
        id
      }
    }),
    [dispatch]
  );

  const initialValues = useMemo(() => {
    const ruleToUpdate = state.rules.find(
      rule => rule.id === state.modeOptions.id
    );

    return ruleToValues(ruleToUpdate);
  }, [state.rules, state.modeOptions.id]);

  const submitElement = useMemo(
    () => (state.mode === 'list' ? (
      <>
        {ReactIs.isValidElementType(SubmitButton) ? (
          <SubmitButton
            handleSubmit={() => onSubmit(state.rules.map(rule => _.omit(rule, 'id')))}
            rules={state.rules}
            onCancel={onCancel}
          />
        ) : null}
      </>
    ) : null),
    [SubmitButton, onSubmit, onCancel, state.rules, state.mode]
  );

  let content = null;

  if (state.mode === 'list') {
    content = (
      <div className="margin-v-md">
        {!state.rules || !state.rules.length ? (
          <div className="text-center">
            <button
              type="button"
              className="btn-link-inline"
              onClick={setModeAdd}
            >
              {intl.formatMessage(messages.addARule)}
            </button>
          </div>
        ) : null}

        {state.rules.map(rule => (
          <RuleItem
            key={rule.id}
            rule={rule}
            onUpdate={setModeUpdate}
            onRemove={removeRule}
          />
        ))}

        {state.rules && state.rules.length ? (
          <button
            type="button"
            className="btn-link-inline"
            onClick={setModeAdd}
          >
            {intl.formatMessage(messages.addARule)}
          </button>
        ) : null}
      </div>
    );
  } else if (state.mode === 'add') {
    content = (
      <div className="margin-v-md">
        <h4 className="text-center margin-bottom-sm">
          {intl.formatMessage(messages.newRule)}
        </h4>

        <Form
          onSubmit={addRule}
          onCancel={setModeList}
          component={RuleForm}
          SubmitButton={AddRuleSubmitButton}
        />
      </div>
    );
  } else if (state.mode === 'update') {
    content = (
      <div className="margin-v-md">
        <h4 className="text-center margin-bottom-sm">
          {intl.formatMessage(messages.updateARule)}
        </h4>

        <Form
          onSubmit={updateRule}
          onCancel={setModeList}
          component={RuleForm}
          initialValues={initialValues}
          SubmitButton={UpdateRuleSubmitButton}
        />
      </div>
    );
  }

  return (
    <>
      {content}

      {submitElement}
    </>
  );
}
