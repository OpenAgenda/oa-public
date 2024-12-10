import _ from 'lodash';
import { useCallback, useMemo, useReducer, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { ruleToValues, valuesToRule } from '../../utils/rules.js';
import RuleForm from '../RuleForm/index.js';
import List from './List.js';
import RulesSubmitButton from './RulesSubmitButton.js';
import AddRuleSubmitButton from './AddRuleSubmitButton.js';
import UpdateRuleSubmitButton from './UpdateRuleSubmitButton.js';
import messages from './messages.js';
import reducer from './reducer.js';
import validate from './validate.js';

function getInitialState(initialRules) {
  const rules = initialRules
    ? initialRules.reduce(
      (acc, rule) => {
        if (rule.required && rule.actions.length) {
          acc.requiredFilters.push({
            id: _.uniqueId(),
            query: rule.query,
            required: true,
            actions: [],
          });
          acc.actions.push({
            id: _.uniqueId(),
            query: {},
            required: false,
            actions: rule.actions,
          });
        } else if (rule.required) {
          acc.requiredFilters.push({ id: _.uniqueId(), ...rule });
        } else {
          acc.actions.push({ id: _.uniqueId(), ...rule });
        }
        return acc;
      },
      { requiredFilters: [], actions: [] },
    )
    : { requiredFilters: [], actions: [] };

  return {
    rules,
    mode: 'list',
    modeOptions: {},
  };
}

export default function DefineRules({
  aggregator,
  aggregatorAgenda,
  aggregatorAgendaSchema,
  displayInfo,
  initialRules,
  isAggregator,
  sourceSchema,
  sourceAgenda,
  primaryAction,
  onSubmit,
  onCancel,
}) {
  const intl = useIntl();

  const initialState = useMemo(
    () => getInitialState(initialRules),
    [initialRules],
  );
  const [state, dispatch] = useReducer(reducer, initialState);

  const setMode = useCallback(
    (mode, options = {}) =>
      dispatch({
        type: 'setMode',
        payload: {
          mode,
          options,
        },
      }),
    [dispatch],
  );

  const setModeList = useCallback(() => setMode('list'), [setMode]);

  const addRule = useCallback(
    (values) => {
      const errors = validate(
        intl,
        values,
        aggregatorAgendaSchema,
        sourceSchema,
      );

      if (errors) {
        return errors;
      }

      const rule = valuesToRule(values, aggregatorAgendaSchema);

      dispatch({
        type: 'addRule',
        payload: {
          rule,
        },
      });

      setMode('list');
    },
    [intl, aggregatorAgendaSchema, sourceSchema, setMode],
  );
  const updateRule = useCallback(
    (values) => {
      const errors = validate(
        intl,
        values,
        aggregatorAgendaSchema,
        sourceSchema,
      );

      if (errors) {
        return errors;
      }

      const rule = valuesToRule(values, aggregatorAgendaSchema);

      dispatch({
        type: 'updateRule',
        payload: {
          id: state.modeOptions.id,
          rule,
        },
      });

      setMode('list');
    },
    [intl, aggregatorAgendaSchema, sourceSchema, state.modeOptions.id, setMode],
  );

  const removeRule = useCallback(
    (id, isRequiredFilter) =>
      dispatch({
        type: 'removeRule',
        payload: {
          id,
          isRequiredFilter,
        },
      }),
    [dispatch],
  );

  const addRules = useCallback(
    async (data) => {
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
    [addRule, aggregatorAgendaSchema],
  );
  const reorderRules = useCallback(
    (startIndex, endIndex, isRequiredFilter) =>
      dispatch({
        type: 'reorderRules',
        payload: {
          startIndex,
          endIndex,
          isRequiredFilter,
        },
      }),
    [dispatch],
  );

  useEffect(() => {
    const pasteHandler = (event) => {
      addRules((event.clipboardData || window.clipboardData).getData('text'));
    };

    document.addEventListener('paste', pasteHandler);

    return () => document.removeEventListener('paste', pasteHandler);
  }, [addRules]);

  const initialValues = useMemo(() => {
    const ruleToUpdate = []
      .concat(state.rules.requiredFilters, state.rules.actions)
      .find((rule) => rule.id === state.modeOptions.id);

    return ruleToValues(ruleToUpdate, aggregatorAgendaSchema);
  }, [state.rules, state.modeOptions.id, aggregatorAgendaSchema]);

  const displayTagFilter = useMemo(() => {
    if (state.mode !== 'update') {
      return false;
    }
    const ruleToUpdate = []
      .concat(state.rules.requiredFilters, state.rules.actions)
      .find((rule) => rule.id === state.modeOptions.id);
    return ruleToValues(ruleToUpdate, aggregatorAgendaSchema).type === 'tags';
  }, [state.rules, state.mode, state.modeOptions.id, aggregatorAgendaSchema]);

  if (state.mode === 'list') {
    return (
      <List
        aggregator={aggregator}
        aggregatorAgenda={aggregatorAgenda}
        aggregatorAgendaSchema={aggregatorAgendaSchema}
        sourceAgenda={sourceAgenda}
        sourceSchema={sourceSchema}
        isAggregator={isAggregator}
        displayInfo={displayInfo}
        rules={state.rules}
        addRules={addRules}
        reorderRules={reorderRules}
        removeRule={removeRule}
        setMode={setMode}
        SubmitButton={RulesSubmitButton({ primaryAction })}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    );
  }
  if (state.mode === 'add') {
    return (
      <div className="padding-v-sm">
        <h4 className="margin-bottom-sm">
          {state.modeOptions.isRequiredFilter
            ? intl.formatMessage(messages.newFilter)
            : intl.formatMessage(messages.newAction)}
        </h4>

        <p>
          {state.modeOptions.isRequiredFilter
            ? intl.formatMessage(messages.filtersDesc)
            : intl.formatMessage(messages.actionsDesc)}
        </p>

        <Form
          onSubmit={addRule}
          mutators={{
            // potentially other mutators could be merged here
            ...arrayMutators,
          }}
          onCancel={setModeList}
          component={RuleForm}
          SubmitButton={AddRuleSubmitButton}
          disabledChoice={!sourceSchema?.fields?.length}
          isAggregator={isAggregator}
          sourceSchema={sourceSchema}
          sourceAgenda={sourceAgenda}
          aggregatorAgendaSchema={aggregatorAgendaSchema}
          isRequiredFilter={state.modeOptions.isRequiredFilter}
        />
      </div>
    );
  }
  if (state.mode === 'update') {
    return (
      <div className="padding-v-sm">
        <h4 className="margin-bottom-sm">
          {state.modeOptions.isRequiredFilter
            ? intl.formatMessage(messages.updateFilter)
            : intl.formatMessage(messages.updateAction)}
        </h4>

        <p>
          {state.modeOptions.isRequiredFilter
            ? intl.formatMessage(messages.filtersDesc)
            : intl.formatMessage(messages.actionsDesc)}
        </p>

        <Form
          onSubmit={updateRule}
          mutators={{
            // potentially other mutators could be merged here
            ...arrayMutators,
          }}
          onCancel={setModeList}
          component={RuleForm}
          displayTagFilter={displayTagFilter}
          initialValues={initialValues}
          SubmitButton={UpdateRuleSubmitButton}
          disabledChoice={!sourceSchema?.fields?.length}
          sourceSchema={sourceSchema}
          sourceAgenda={sourceAgenda}
          aggregatorAgendaSchema={aggregatorAgendaSchema}
          isRequiredFilter={state.modeOptions.isRequiredFilter}
        />
      </div>
    );
  }

  return null;
}
