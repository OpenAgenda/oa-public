import { useIntl } from 'react-intl';
import React, { useMemo } from 'react';
import { Field } from 'react-final-form';
import { ReactSelectField } from '@openagenda/react-shared';
import { getLocaleValue } from '@openagenda/intl';
import titleMessages from '../messages/chartTitles';
import form from '../messages/form';
import MetricsField from './MetricsField';

export default function AddChartForm({
  handleSubmit,
  onCancel,
  agendaSchema,
  stats,
  values,
}) {
  const intl = useIntl();

  const chartOptions = useMemo(() => {
    const additionalFieldOpts = agendaSchema.fields
      .filter(fieldSchema => ['radio', 'checkbox', 'integer'].includes(fieldSchema.fieldType))
      .map(fieldSchema => {
        const isCheckbox = fieldSchema.fieldType === 'checkbox'
          && fieldSchema.options.length === 1;

        return {
          label: getLocaleValue(fieldSchema.label, intl.locale),
          value: {
            additionalField: true,
            fieldSchema,
            isCheckbox,
          },
        };
      });

    return [
      {
        label: intl.formatMessage(form.data),
        options: [
          {
            label: intl.formatMessage(titleMessages.regions),
            value: 'regions',
          },
          {
            label: intl.formatMessage(titleMessages.departments),
            value: 'departments',
          },
          { label: intl.formatMessage(titleMessages.cities), value: 'cities' },
          {
            label: intl.formatMessage(titleMessages.timings),
            value: 'timings',
          },
          {
            label: intl.formatMessage(titleMessages.createdAt),
            value: 'createdAt',
          },
          {
            label: intl.formatMessage(titleMessages.updatedAt),
            value: 'updatedAt',
          },
          {
            label: intl.formatMessage(titleMessages.members),
            value: 'members',
          },
          {
            label: intl.formatMessage(titleMessages.originAgendas),
            value: 'originAgendas',
          },
          {
            label: intl.formatMessage(titleMessages.keywords),
            value: 'keywords',
          },
          { label: intl.formatMessage(titleMessages.states), value: 'states' },
        ]
          .concat(additionalFieldOpts)
          .filter(
            v => !stats.find(stat => {
              if (!stat.aggregation) {
                return false;
              }

              if (
                v.value.additionalField
                  && stat.aggregation.type === 'additionalFields'
              ) {
                return stat.aggregation.field === v.value.fieldSchema.field;
              }

              return stat.aggregation.type === v.value;
            })
          ),
      },
      {
        label: intl.formatMessage(form.others),
        options: [
          { label: intl.formatMessage(form.separator), value: 'separator' },
        ],
      },
    ];
  }, [agendaSchema.fields, intl, stats]);

  const widthOptions = useMemo(
    () => [
      {
        label: intl.formatMessage(form.oneColumn),
        value: 1,
      },
      {
        label: intl.formatMessage(form.oneLine),
        value: 2,
      },
    ],
    [intl]
  );

  return (
    <form onSubmit={handleSubmit} className="margin-v-lg margin-h-md">
      <ReactSelectField
        name="type"
        Field={Field}
        placeholder={intl.formatMessage(form.typeSelectPlaceholder)}
        options={chartOptions}
      />

      {/* Metrics */}
      {values.type?.fieldSchema?.fieldType === 'integer' ? (
        <div className="margin-top-md">
          <p>
            <b>{intl.formatMessage(form.metric)}</b>
          </p>
          <MetricsField />
        </div>
      ) : null}

      {/* Width */}
      {values.type && values.type !== 'separator' ? (
        <div className="margin-top-md">
          <p>
            <b>{intl.formatMessage(form.componentWidth)}</b>
          </p>
          <ReactSelectField
            name="width"
            Field={Field}
            placeholder={intl.formatMessage(form.widthSelectPlaceholder)}
            initialValue={1}
            options={widthOptions}
          />
        </div>
      ) : null}

      <div className="margin-top-md">
        <button
          type="button"
          className="btn btn-link btn-link-inline text-danger pull-right margin-top-xs"
          onClick={onCancel}
        >
          {intl.formatMessage(form.cancel)}
        </button>
        <button type="submit" className="btn btn-primary btn-bordered">
          {intl.formatMessage(form.add)}
        </button>
      </div>
    </form>
  );
}
