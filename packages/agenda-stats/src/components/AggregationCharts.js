import React, { useCallback, useState, useMemo } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { useDispatch } from 'react-redux';
import { Form } from 'react-final-form';
import { ReactSelectField } from '@openagenda/react-shared';
import * as statsActions from '../reducers/stats';
import defaultStatConfigs from '../common/defaultStatConfigs';
import getLocaleValue from '../utils/getLocaleValue';
import titleMessages from '../titleMessages';
import ComposedChart from './ComposedChart';
import ChartWrapper from './ChartWrapper';
import BorderBox from './BorderBox';
// import OriginAgendasPieChart from './OriginAgendasPieChart';

const messages = defineMessages({
  noValue: {
    id: 'AgendaStats.AggregationCharts.noValue',
    defaultMessage: 'No value.'
  },
  addChart: {
    id: 'AgendaStats.AggregationCharts.addChart',
    defaultMessage: 'Add a chart'
  },
  selectElementToAdd: {
    id: 'AgendaStats.AggregationCharts.selectElementToAdd',
    defaultMessage: 'Select an element to add'
  },
  update: {
    id: 'AgendaStats.AggregationCharts.update',
    defaultMessage: 'Update'
  },
  remove: {
    id: 'AgendaStats.AggregationCharts.remove',
    defaultMessage: 'Remove'
  }
});

function AddChartForm({ handleSubmit, onCancel, agendaSchema }) {
  const intl = useIntl();

  const chartOptions = useMemo(() => {
    const additionalFieldOpts = agendaSchema.fields
      .filter(
        fieldSchema => fieldSchema.options && fieldSchema.options.length > 0
      )
      .map(fieldSchema => {
        const isCheckbox = fieldSchema.fieldType === 'checkbox'
          && fieldSchema.options.length === 1;

        return {
          label: getLocaleValue(fieldSchema.label, intl.locale),
          value: {
            additionalField: true,
            fieldSchema,
            isCheckbox
          }
        };
      });

    return [
      {
        label: 'Graphiques',
        options: [
          {
            label: intl.formatMessage(titleMessages.regions),
            value: 'regions'
          },
          {
            label: intl.formatMessage(titleMessages.departments),
            value: 'departments'
          },
          { label: intl.formatMessage(titleMessages.cities), value: 'cities' },
          {
            label: intl.formatMessage(titleMessages.timings),
            value: 'timings'
          },
          {
            label: intl.formatMessage(titleMessages.createdAt),
            value: 'createdAt'
          },
          {
            label: intl.formatMessage(titleMessages.updatedAt),
            value: 'updatedAt'
          },
          {
            label: intl.formatMessage(titleMessages.members),
            value: 'members'
          },
          {
            label: intl.formatMessage(titleMessages.originAgendas),
            value: 'originAgendas'
          },
          {
            label: intl.formatMessage(titleMessages.keywords),
            value: 'keywords'
          },
          { label: intl.formatMessage(titleMessages.states), value: 'states' }
        ].concat(additionalFieldOpts)
      },
      {
        label: 'Autres',
        options: [{ label: 'Séparateur', value: 'separator' }]
      }
    ];
  }, [agendaSchema.fields, intl]);

  return (
    <form onSubmit={handleSubmit} className="margin-v-lg margin-h-md">
      <ReactSelectField
        name="type"
        placeholder={intl.formatMessage(messages.selectElementToAdd)}
        options={chartOptions}
      />
      <div className="margin-top-sm">
        <button
          type="button"
          className="btn btn-link btn-link-inline text-danger pull-right margin-top-xs"
          onClick={onCancel}
        >
          Annuler
        </button>
        <button type="submit" className="btn btn-primary btn-bordered">
          Ajouter
        </button>
      </div>
    </form>
  );
}

function Separator({ stat, editMode }) {
  const intl = useIntl();
  const dispatch = useDispatch();

  const removeSeparator = useCallback(
    () => dispatch(statsActions.removeStat(stat.id)),
    [dispatch, stat]
  );

  if (!stat || !editMode) {
    return <div className="clearfix" />;
  }

  return (
    <div className="col-md-12 margin-top-md">
      <BorderBox>
        <div className="margin-all-sm">
          <div className="text-right margin-top-xs">
            {/* <button
              type="button"
              className="btn btn-link btn-link-inline"
              onClick={updateSeparator}
            >
              {intl.formatMessage(messages.update)}
            </button> */}
            <button
              type="button"
              className="btn btn-link btn-link-inline text-danger margin-left-xs"
              onClick={removeSeparator}
            >
              {intl.formatMessage(messages.remove)}
            </button>
          </div>
          <div className="text-center">
            <em>Séparateur</em>
          </div>
        </div>
      </BorderBox>
    </div>
  );
}

function ChartAdder({ agenda, agendaSchema }) {
  const intl = useIntl();
  const dispatch = useDispatch();

  const [addChartMode, setAddChartMode] = useState(false);

  const enableAddChartMode = useCallback(() => setAddChartMode(true), []);
  const onCancel = useCallback(() => setAddChartMode(false), []);
  const addChart = useCallback(
    (values, form) => {
      let statConfig;

      if (values.type.additionalField) {
        const { fieldSchema, isCheckbox } = values.type;

        statConfig = {
          aggregation: {
            type: 'additionalFields',
            field: values.type.fieldSchema.field
          },
          chart: {
            type: isCheckbox ? 'pie' : 'vertical',
            dataKey: 'eventCount',
            labelKey: 'label',
            restItem: isCheckbox,
            dataColors: isCheckbox ? ['#41acdd', '#c6c6c6'] : null
          },
          fieldSchema
        };
      } else {
        statConfig = defaultStatConfigs[values.type];
      }

      const { stat } = dispatch(statsActions.addStat(statConfig));

      if (stat.aggregation) {
        dispatch(statsActions.loadStat(agenda, stat.id));
      }

      // Ensure that's executed in the next tick
      setTimeout(form.reset, 0);
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

export default function AggregationCharts({
  agenda,
  stats,
  totalEvents,
  range,
  editMode,
  agendaSchema
}) {
  const intl = useIntl();
  const dispatch = useDispatch();

  const loadStat = useCallback(
    (statId, getOptions) => dispatch(statsActions.loadStat(agenda, statId, getOptions)),
    [agenda, dispatch]
  );

  const result = [];

  let sepCount = 0;
  let chartsFromLastSep = 0;
  const pushSeparator = stat => {
    result.push(
      <Separator key={`sep-${sepCount}`} stat={stat} editMode={editMode} />
    );
    sepCount += 1;
    chartsFromLastSep = 0;
  };
  const pushSeparatorIfEven = () => {
    if (chartsFromLastSep > 0 && chartsFromLastSep % 2 === 0) {
      pushSeparator();
    }
  };
  const pushChart = chart => {
    pushSeparatorIfEven();
    result.push(chart);
    chartsFromLastSep += 1;
  };

  stats.forEach(stat => {
    if (stat.separator) {
      pushSeparator(stat);
    }

    if (!stat.chart) {
      return null;
    }

    const multiData = Array.isArray(stat.aggregation);
    const hasData = multiData
      ? stat.data?.some(v => v.length)
      : stat.data?.length;

    if (hasData) {
      pushChart(
        <ComposedChart
          key={stat.id}
          wrapperComponent={(
            <ChartWrapper
              key={stat.id}
              editMode={editMode}
              className="col-md-12 col-lg-6 margin-top-md"
            />
          )}
          stat={stat}
          totalEvents={totalEvents}
          range={range}
          loadStat={loadStat}
        />
      );
    } else {
      pushChart(
        <ChartWrapper
          key={stat.id}
          stat={stat}
          totalEvents={totalEvents}
          range={range}
          loadStat={loadStat}
          editMode={editMode}
          className="col-md-12 col-lg-6 margin-top-md"
        >
          <div className="margin-v-sm text-center text-muted">
            {intl.formatMessage(messages.noValue)}
          </div>
        </ChartWrapper>
      );
    }
  });

  if (editMode) {
    pushChart(
      <ChartAdder
        key="chart-adder"
        agenda={agenda}
        agendaSchema={agendaSchema}
      />
    );
  }

  return <div className="row">{result}</div>;
}
