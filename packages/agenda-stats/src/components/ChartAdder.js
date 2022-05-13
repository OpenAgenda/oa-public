import { defineMessages, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import React, { useCallback, useState } from 'react';
import { Form } from 'react-final-form';
import * as statsActions from '../reducers/stats';
import getDefaultStatConfig from '../common/defaultStatConfigs';
import BorderBox from './BorderBox';
import AddChartForm from './AddChartForm';

const messages = defineMessages({
  addChart: {
    id: 'AgendaStats.ChartAdder.addChart',
    defaultMessage: 'Add a chart',
  },
});

export default function ChartAdder({ agenda, agendaSchema, stats }) {
  const intl = useIntl();
  const dispatch = useDispatch();

  const [addChartMode, setAddChartMode] = useState(false);

  const enableAddChartMode = useCallback(() => setAddChartMode(true), []);
  const onCancel = useCallback(() => setAddChartMode(false), []);
  const addChart = useCallback(
    async values => {
      if (!values.type) {
        return;
      }

      let statConfig;

      if (values.type === 'separator') {
        statConfig = { separator: true };
      } else {
        const isAdditionalField = values.type.additionalField;
        let aggType = values.type;

        if (isAdditionalField) {
          if (values.type.fieldSchema.fieldType === 'integer') {
            aggType = 'additionalFieldMetrics';
          } else {
            aggType = 'additionalFields';
          }
        }

        const defaults = getDefaultStatConfig(aggType, values.type.fieldSchema);

        statConfig = {
          aggregation: {
            ...defaults.aggregation,
            type: aggType,
          },
          chart: {
            width: values.width,
          },
          state: {
            fieldSchema: values.type.fieldSchema,
          },
        };
      }

      // Une promesse ? 🤔
      const result = await dispatch(statsActions.addStat(statConfig));
      const { stat } = result;

      if (stat.aggregation) {
        dispatch(statsActions.loadStat(agenda, stat.id));
      }

      setAddChartMode(false);
    },
    [agenda, dispatch]
  );

  return (
    <div className="col-md-12 col-lg-6 margin-top-md">
      {addChartMode ? (
        <BorderBox>
          <Form
            component={AddChartForm}
            onSubmit={addChart}
            onCancel={onCancel}
            agendaSchema={agendaSchema}
            stats={stats}
          />
        </BorderBox>
      ) : (
        <BorderBox className="text-center padding-v-xl">
          <button
            type="button"
            className="btn btn-primary btn-bordered"
            onClick={enableAddChartMode}
          >
            {intl.formatMessage(messages.addChart)}
          </button>
        </BorderBox>
      )}
    </div>
  );
}
