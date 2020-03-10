import _ from 'lodash';
import React, {
  useCallback, useMemo, useReducer, useEffect
} from 'react';
import * as ReactIs from 'react-is';
import { useIntl } from 'react-intl';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { useMemoOne } from '@openagenda/react-shared/dist/hooks/useMemoOne';
import { ruleToValues, valuesToRule } from '../../utils/rules';
import readClipboard from '../../utils/readClipboard';
import getMultiLanguageLabel from '../../utils/getMultiLanguageLabel';
import RuleForm from '../RuleForm';
import RuleItem from './RuleItem';
import AddRuleSubmitButton from './AddRuleSubmitButton';
import UpdateRuleSubmitButton from './UpdateRuleSubmitButton';
import messages from './messages';
import validate from './validate';
import validateActions from './validateActions';

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
    modeOptions: {},
    error: null
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
    case 'setError': {
      return {
        ...state,
        error: action.payload.error
      };
    }
    case 'addRule': {
      return {
        ...state,
        error: null,
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
        error: null,
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
        error: null,
        rules: state.rules.filter(rule => rule.id !== action.payload.id)
      };
    }
    default:
      return state;
  }
}

export default function DefineRules({
  aggregatorAgendaSchema,
  sourceSchema,
  initialRules,
  isAggregator,
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

  const requiredFields = useMemoOne(
    () => aggregatorAgendaSchema.fields.filter(field => {
      if (isAggregator) {
        return false;
      }

      const sourceField = sourceSchema?.fields?.find(
          v => v.schemaId
            && v.field === field.field
            && v.schemaId === field.schemaId
        );

      if (sourceField) {
        return false;
      }

      return field.fieldType !== 'abstract' && field.optional === false;
    }),
    [aggregatorAgendaSchema.fields, isAggregator, sourceSchema]
  );

  const requiredFieldList = useMemo(
    () => requiredFields.map(field => (
      <em key={field.field}>
        {getMultiLanguageLabel(field.label, intl.locale)}
      </em>
    )),
    [intl.locale, requiredFields]
  );

  const addRule = useCallback(
    values => {
      const errors = validate(
        intl,
        values,
        aggregatorAgendaSchema,
        sourceSchema
      );

      if (errors) {
        return errors;
      }

      const rule = valuesToRule(values, aggregatorAgendaSchema);

      dispatch({
        type: 'addRule',
        payload: {
          rule
        }
      });

      setMode('list');
    },
    [intl, aggregatorAgendaSchema, sourceSchema, setMode]
  );
  const updateRule = useCallback(
    values => {
      const errors = validate(
        intl,
        values,
        aggregatorAgendaSchema,
        sourceSchema
      );

      if (errors) {
        return errors;
      }

      const rule = valuesToRule(values, aggregatorAgendaSchema);

      dispatch({
        type: 'updateRule',
        payload: {
          id: state.modeOptions.id,
          rule
        }
      });

      setMode('list');
    },
    [intl, aggregatorAgendaSchema, sourceSchema, state.modeOptions.id, setMode]
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

  const addRules = useCallback(
    async data => {
      if (!data) {
        return;
      }

      let json;

      try {
        json = JSON.parse(data);
      } catch (e) {
        // Unable to parse
        json = [];
      }

      if (!Array.isArray(json)) {
        return;
      }

      for (const item of json) {
        try {
          const rule = ruleToValues(item, aggregatorAgendaSchema);

          addRule(rule);
        } catch (itemException) {
          // Impossible to add rule
        }
      }
    },
    [addRule, aggregatorAgendaSchema]
  );

  useEffect(() => {
    const pasteHandler = event => {
      addRules((event.clipboardData || window.clipboardData).getData('text'));
    };

    document.addEventListener('paste', pasteHandler);

    return () => document.removeEventListener('paste', pasteHandler);
  }, [addRules]);

  const pasteRules = useCallback(async () => {
    addRules(await readClipboard().catch(() => null));
  }, [addRules]);

  const initialValues = useMemo(() => {
    const ruleToUpdate = state.rules.find(
      rule => rule.id === state.modeOptions.id
    );

    return ruleToValues(ruleToUpdate, aggregatorAgendaSchema);
  }, [state.rules, state.modeOptions.id, aggregatorAgendaSchema]);

  const submitElement = useMemo(
    () => (state.mode === 'list' ? (
      <>
        {ReactIs.isValidElementType(SubmitButton) ? (
          <SubmitButton
            handleSubmit={() => {
              const rules = state.rules.map(rule => _.omit(rule, 'id'));
              const error = validateActions(
                intl,
                rules,
                aggregatorAgendaSchema,
                sourceSchema
              );

              if (error) {
                return dispatch({
                  type: 'setError',
                  payload: {
                    error
                  }
                });
              }

              return onSubmit(rules);
            }}
            rules={state.rules}
            onCancel={onCancel}
          />
        ) : null}
      </>
    ) : null),
    [
      state.mode,
      state.rules,
      SubmitButton,
      onCancel,
      intl,
      aggregatorAgendaSchema,
      sourceSchema,
      onSubmit
    ]
  );

  let content = null;

  if (state.mode === 'list') {
    content = (
      <div className="margin-top-md">
        <p className="margin-top-sm">
          {intl.formatMessage(messages.description, { br: <br key="br" /> })}
        </p>

        {sourceSchema && requiredFieldList.length ? (
          <p>
            {intl.formatMessage(messages.requiredFieldsWarning, {
              fields: intl.formatList(requiredFieldList),
              fieldsCount: requiredFields.length
            })}
          </p>
        ) : null}

        {state.rules.map(rule => (
          <RuleItem
            key={rule.id}
            rule={rule}
            onUpdate={setModeUpdate}
            onRemove={removeRule}
            sourceSchema={sourceSchema}
          />
        ))}

        <div>
          <p>
            <button
              type="button"
              className="btn-link-inline"
              onClick={setModeAdd}
            >
              <i className="fa fa-sm fa-plus" aria-hidden="true" />{' '}
              {intl.formatMessage(messages.addARule)}
            </button>
          </p>

          {sourceSchema ? (
            <p>
              {navigator?.clipboard?.readText ? (
                <button
                  type="button"
                  className="btn-link-inline"
                  onClick={pasteRules}
                >
                  <i className="fa fa-sm fa-paste" aria-hidden="true" />{' '}
                  {intl.formatMessage(messages.pasteRules)}
                </button>
              ) : (
                <em className="text-muted">
                  <i className="fa fa-sm fa-paste" aria-hidden="true" />{' '}
                  {intl.formatMessage(messages.manualPasteRules)}
                </em>
              )}
            </p>
          ) : null}
        </div>
      </div>
    );
  } else if (state.mode === 'add') {
    content = (
      <div className="margin-top-md">
        <h4 className="margin-bottom-sm">
          {intl.formatMessage(messages.newRule)}
        </h4>

        <p>{intl.formatMessage(messages.ruleDescription)}</p>

        <Form
          onSubmit={addRule}
          mutators={{
            // potentially other mutators could be merged here
            ...arrayMutators
          }}
          onCancel={setModeList}
          component={RuleForm}
          SubmitButton={AddRuleSubmitButton}
          disabledExtended={!sourceSchema?.fields?.length}
          isAggregator={isAggregator}
          sourceSchema={sourceSchema}
          aggregatorAgendaSchema={aggregatorAgendaSchema}
        />
      </div>
    );
  } else if (state.mode === 'update') {
    content = (
      <div className="margin-top-md">
        <h4 className="margin-bottom-sm">
          {intl.formatMessage(messages.updateARule)}
        </h4>

        <p>{intl.formatMessage(messages.ruleDescription)}</p>

        <Form
          onSubmit={updateRule}
          mutators={{
            // potentially other mutators could be merged here
            ...arrayMutators
          }}
          onCancel={setModeList}
          component={RuleForm}
          initialValues={initialValues}
          SubmitButton={UpdateRuleSubmitButton}
          disabledExtended={!sourceSchema?.fields?.length}
          sourceSchema={sourceSchema}
          aggregatorAgendaSchema={aggregatorAgendaSchema}
        />
      </div>
    );
  }

  return (
    <>
      {content}

      {state.mode === 'list' && state.error ? (
        <div className="text-danger">{state.error}</div>
      ) : null}

      {submitElement}
    </>
  );
}
