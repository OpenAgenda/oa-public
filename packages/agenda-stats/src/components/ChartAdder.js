import { defineMessages, useIntl } from 'react-intl';
import { useDispatch } from 'react-redux';
import React, { useCallback, useState } from 'react';
import { Form } from 'react-final-form';
import getDefaultStatConfig from '../common/defaultStatConfigs';
import * as statsActions from '../reducers/stats';
import BorderBox from './BorderBox';
import AddChartForm from './AddChartForm';

const messages = defineMessages({
  addChart: {
    id: 'AgendaStats.ChartAdder.addChart',
    defaultMessage: 'Add a chart'
  }
});

export default function ChartAdder({ agenda, agendaSchema, stats }) {
  const intl = useIntl();
  const dispatch = useDispatch();

  const [addChartMode, setAddChartMode] = useState(false);

  const enableAddChartMode = useCallback(() => setAddChartMode(true), []);
  const onCancel = useCallback(() => setAddChartMode(false), []);
  const addChart = useCallback(
    values => {
      if (!values.type) {
        return;
      }

      const aggType = values.type.additionalField
        ? 'additionalFields'
        : values.type;
      const statConfig = getDefaultStatConfig(aggType, values.type.fieldSchema);

      if (!statConfig.separator) {
        statConfig.chart = {
          width: values.width
        };
      }

      const { stat } = dispatch(statsActions.addStat(statConfig));

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
