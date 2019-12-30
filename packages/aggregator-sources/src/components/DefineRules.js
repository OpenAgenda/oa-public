import _ from 'lodash';
import React, {
  useCallback, useMemo, useReducer, useEffect
} from 'react';
import * as ReactIs from 'react-is';
import { defineMessages, useIntl } from 'react-intl';
import { Form } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import arrayMutators from 'final-form-arrays';
import classNames from 'classnames';
import { useMemoOne } from '../hooks/useMemoOne';
import { ruleToValues, valuesToRule } from '../utils/rules';
import readClipboard from '../utils/readClipboard';
import getMultiLanguageLabel from '../utils/getMultiLanguageLabel';
import RuleForm from './RuleForm';

const messages = defineMessages({
  requiredType: {
    id: 'aggregator-sources.DefineRules.requiredType',
    defaultMessage: 'Required type'
  },
  allEvents: {
    id: 'aggregator-sources.DefineRules.allEvents',
    defaultMessage: 'All events'
  },
  noFilter: {
    id: 'aggregator-sources.DefineRules.noFilter',
    defaultMessage: 'No filter'
  },
  requiredSubdivision: {
    id: 'aggregator-sources.DefineRules.requiredSubdivision',
    defaultMessage: 'Required subdivision'
  },
  requiredValues: {
    id: 'aggregator-sources.DefineRules.requiredValues',
    defaultMessage: 'Required values'
  },
  uselessRule: {
    id: 'aggregator-sources.DefineRules.uselessRule',
    defaultMessage: 'Please define at least a required filter or one action'
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
  extendedFilter: {
    id: 'aggregator-sources.DefineRules.extendedFilter',
    defaultMessage: 'Additionnal field filter'
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
  },
  pasteRules: {
    id: 'aggregator-sources.DefineRules.pasteRules',
    defaultMessage: 'Apply rules from another source'
  },
  manualPasteRules: {
    id: 'aggregator-sources.DefineRules.manualPasteRules',
    defaultMessage: 'Paste rules from another source (CTRL + V)'
  },
  description: {
    id: 'aggregator-sources.DefineRules.description',
    defaultMessage:
      'Règles are applied to the events in their aggregation.{br} They are used to condition the aggregation, or to assign values to extended fields in your agenda.'
  },
  requiredFieldsWarning: {
    id: 'aggregator-sources.DefineRules.requiredFieldsWarning',
    defaultMessage:
      '{fieldsCount, plural, =1 {The field {fields} is required} other {The fields {fields} are required}}.'
  },
  missingRequiredFields: {
    id: 'aggregator-sources.DefineRules.missingRequiredFields',
    defaultMessage:
      '{fieldsCount, plural, =1 {The field {fields} is required} other {The fields {fields} are required}}.'
  },
  withActions: {
    id: 'aggregator-sources.DefineRules.withActions',
    defaultMessage:
      '{actionCount, plural, =1 {with 1 action} other {with # actions}}'
  }
});

function validate(intl, values, aggregatorSchema /* , sourceSchema */) {
  const errors = {};

  if (!values.type) {
    errors.type = intl.formatMessage(messages.requiredType);
  }

  if (values.type === 'location' && !values.subdivision) {
    errors.subdivision = intl.formatMessage(messages.requiredSubdivision);
  }

  if (values.type !== 'all' && !values.values) {
    errors.values = intl.formatMessage(messages.requiredValues);
  }

  if ((values.type === 'all' || !values.required) && !values.actions?.length) {
    errors[FORM_ERROR] = intl.formatMessage(messages.uselessRule);
  }

  aggregatorSchema.fields
    .filter(v => v.fieldType !== 'abstract')
    .concat({
      field: 'state',
      optional: false
    })
    .forEach(fieldSchema => {
      const aggActionIndex = values.actions?.findIndex(
        v => v?.field?.value && v.field.value === fieldSchema.field
      );
      const aggAction = values.actions?.[aggActionIndex];

      const hasValue = Array.isArray(aggAction?.values)
        ? aggAction.values.length
        : ![undefined, null, ''].includes(aggAction?.values?.value);

      if (fieldSchema.optional === false && aggAction && !hasValue) {
        _.set(
          errors,
          ['actions', aggActionIndex, 'values'],
          intl.formatMessage(messages.requiredValues)
        );
      }
    });

  if (Object.keys(errors).length) {
    return errors;
  }
}

function validateActions(intl, rules, aggregatorSchema, sourceSchema) {
  const missingFields = [];

  const actions = rules.flatMap(v => v.actions?.filter(Boolean));

  aggregatorSchema.fields
    .filter(v => v.fieldType !== 'abstract')
    .forEach(fieldSchema => {
      const aggAction = actions.find(v => v?.[fieldSchema.field]);
      const hasValue = Array.isArray(aggAction?.[fieldSchema.field])
        ? aggAction[fieldSchema.field].length
        : aggAction?.[fieldSchema.field];
      const inSourceSchema = sourceSchema.fields.find(
        v => v.schemaId
          && v.field === fieldSchema.field
          && v.schemaId === fieldSchema.schemaId
      );

      if (!inSourceSchema && fieldSchema.optional === false && !hasValue) {
        missingFields.push(fieldSchema);
      }
    });

  if (missingFields.length) {
    return intl.formatMessage(messages.missingRequiredFields, {
      fields: intl.formatList(
        missingFields.map(v => (
          <em key={v.field}>{getMultiLanguageLabel(v.label, intl.locale)}</em>
        ))
      ),
      fieldsCount: missingFields.length
    });
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

function RuleItem({
  rule, onUpdate, onRemove, sourceSchema
}) {
  const intl = useIntl();

  const handleUpdate = useCallback(() => onUpdate(rule.id), [
    onUpdate,
    rule.id
  ]);
  const handleRemove = useCallback(() => onRemove(rule.id), [
    onRemove,
    rule.id
  ]);

  const queryKey = useMemo(() => {
    const keys = Object.keys(rule.query || {});

    if (!keys.length) {
      return null;
    }

    return keys[0];
  }, [rule.query]);

  const queryType = useMemo(() => {
    if (!queryKey) {
      return 'all';
    }

    return ['location', 'tags'].includes(queryKey) ? queryKey : 'extended';
  }, [queryKey]);

  const ruleValue = useMemoOne(() => {
    switch (queryType) {
      case 'all':
        return intl.formatMessage(messages.noFilter);
      case 'location':
        return Object.values(rule.query.location)[0].join(', ');
      case 'tags':
        return [].concat(rule.query.tags).join(', ');
      case 'extended': {
        const key = Object.keys(rule.query)[0];
        const fieldSchema = sourceSchema.fields.find(
          _fieldSchema => _fieldSchema.field === key
        );
        const labels = []
          .concat(rule.query[key])
          .map(
            id => fieldSchema?.options?.find(option => option.id === id) || id
          )
          .map(v => getMultiLanguageLabel(v?.label));

        return intl.formatList(labels);
      }
      default:
        return null;
    }
  }, [intl, queryType, rule, sourceSchema]);

  const typeMessage = useMemoOne(() => {
    switch (queryType) {
      case 'all':
        return intl.formatMessage(messages.allEvents);
      case 'location':
        return intl.formatMessage(messages.locationFilter);
      case 'tags':
        return intl.formatMessage(messages.tagFilter);
      case 'extended':
        return intl.formatMessage(messages.extendedFilter);
      default:
        return null;
    }
  }, [intl, queryType, rule]);

  return (
    <div className="row margin-v-sm">
      <div className="col-md-6">
        <div className="rule-value">{ruleValue}</div>

        <span className="text-muted">
          {typeMessage}

          {(rule.transform || rule.actions)?.length ? (
            <>
              {' '}
              {intl.formatMessage(messages.withActions, {
                actionCount: (rule.transform || rule.actions).length
              })}
            </>
          ) : null}
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
  aggregatorSchema,
  sourceSchema,
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

  const requiredFields = useMemoOne(
    () => aggregatorSchema.fields.filter(field => {
      const sourceField = sourceSchema.fields.find(
        v => v.schemaId
            && v.field === field.field
            && v.schemaId === field.schemaId
      );

      if (sourceField) {
        return false;
      }

      if (field.fieldType !== 'abstract' && field.optional === false) {
        return true;
      }

      return false;
    }),
    [aggregatorSchema.fields]
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
      const errors = validate(intl, values, aggregatorSchema, sourceSchema);

      if (errors) {
        return errors;
      }

      const rule = valuesToRule(values, aggregatorSchema);

      dispatch({
        type: 'addRule',
        payload: {
          rule
        }
      });

      setMode('list');
    },
    [intl, aggregatorSchema, sourceSchema, setMode]
  );
  const updateRule = useCallback(
    values => {
      const errors = validate(intl, values, aggregatorSchema, sourceSchema);

      if (errors) {
        return errors;
      }

      const rule = valuesToRule(values, aggregatorSchema);

      dispatch({
        type: 'updateRule',
        payload: {
          id: state.modeOptions.id,
          rule
        }
      });

      setMode('list');
    },
    [intl, aggregatorSchema, sourceSchema, state.modeOptions.id, setMode]
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

      let json = null;

      try {
        json = JSON.parse(data);

        if (!Array.isArray(json)) {
          throw new Error('Invalid data: not an array');
        }
      } catch (e) {
        // Unable to parse
        json = [];
      }

      for (const item of json) {
        try {
          const rule = ruleToValues(item, aggregatorSchema, sourceSchema, intl);

          addRule(rule);
        } catch (itemException) {
          // Impossible to add rule
        }
      }
    },
    [addRule, aggregatorSchema, sourceSchema, intl]
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

    return ruleToValues(ruleToUpdate, aggregatorSchema, sourceSchema, intl);
  }, [state.rules, state.modeOptions.id, aggregatorSchema, sourceSchema, intl]);

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
                aggregatorSchema,
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
      aggregatorSchema,
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

        {requiredFieldList.length ? (
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

        <div
          className={classNames({
            'text-center': !state.rules || !state.rules.length
          })}
        >
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
        </div>
      </div>
    );
  } else if (state.mode === 'add') {
    content = (
      <div className="margin-top-md">
        <h4 className="text-center margin-bottom-sm">
          {intl.formatMessage(messages.newRule)}
        </h4>

        <Form
          onSubmit={addRule}
          mutators={{
            // potentially other mutators could be merged here
            ...arrayMutators
          }}
          onCancel={setModeList}
          component={RuleForm}
          SubmitButton={AddRuleSubmitButton}
          disabledExtended={!sourceSchema.fields.length}
          sourceSchema={sourceSchema}
          aggregatorSchema={aggregatorSchema}
        />
      </div>
    );
  } else if (state.mode === 'update') {
    content = (
      <div className="margin-top-md">
        <h4 className="text-center margin-bottom-sm">
          {intl.formatMessage(messages.updateARule)}
        </h4>

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
          disabledExtended={!sourceSchema.fields.length}
          sourceSchema={sourceSchema}
          aggregatorSchema={aggregatorSchema}
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
