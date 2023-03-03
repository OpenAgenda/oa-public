import _ from 'lodash';
import { useCallback, useMemo, useReducer, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Form } from 'react-final-form';
import arrayMutators from 'final-form-arrays';
import { ruleToValues, valuesToRule } from '../../utils/rules';
import RuleForm from '../RuleForm';
import List from './List';
import RulesSubmitButton from './RulesSubmitButton';
import AddRuleSubmitButton from './AddRuleSubmitButton';
import UpdateRuleSubmitButton from './UpdateRuleSubmitButton';
import messages from './messages';
import reducer from './reducer';
import validate from './validate';

function getInitialState(initialRules) {
  const rules = initialRules
    ? initialRules.map(rule => ({
      id: _.uniqueId(), // for react key prop
      ...rule,
    }))
    : [];

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
    values => {
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
    values => {
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
    id =>
      dispatch({
        type: 'removeRule',
        payload: {
          id,
        },
      }),
    [dispatch],
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
    [addRule, aggregatorAgendaSchema],
  );
  const reorderRules = useCallback(
    (startIndex, endIndex) =>
      dispatch({
        type: 'reorderRules',
        payload: {
          startIndex,
          endIndex,
        },
      }),
    [dispatch],
  );

  useEffect(() => {
    const pasteHandler = event => {
      addRules((event.clipboardData || window.clipboardData).getData('text'));
    };

    document.addEventListener('paste', pasteHandler);

    return () => document.removeEventListener('paste', pasteHandler);
  }, [addRules]);

  const initialValues = useMemo(() => {
    const ruleToUpdate = state.rules.find(
      rule => rule.id === state.modeOptions.id,
    );

    return ruleToValues(ruleToUpdate, aggregatorAgendaSchema);
  }, [state.rules, state.modeOptions.id, aggregatorAgendaSchema]);

  const displayTagFilter = useMemo(() => {
    if (state.mode !== 'update') {
      return false;
    }
    const ruleToUpdate = state.rules.find(
      rule => rule.id === state.modeOptions.id,
    );
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
          {intl.formatMessage(messages.newRule)}
        </h4>

        <p>{intl.formatMessage(messages.ruleDescription)}</p>

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
          aggregatorAgendaSchema={aggregatorAgendaSchema}
        />
      </div>
    );
  }
  if (state.mode === 'update') {
    return (
      <div className="padding-v-sm">
        <h4 className="margin-bottom-sm">
          {intl.formatMessage(messages.updateARule)}
        </h4>

        <p>{intl.formatMessage(messages.ruleDescription)}</p>

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
          aggregatorAgendaSchema={aggregatorAgendaSchema}
        />
      </div>
    );
  }

  return null;
}
