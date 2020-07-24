import { useIntl } from 'react-intl';
import React, { useMemo } from 'react';
import { css } from '@emotion/core';
import { ReactSelectField } from '@openagenda/react-shared';
import getLocaleValue from '../utils/getLocaleValue';
import titleMessages from '../titleMessages';
import form from './messages/form';

export default function AddChartForm({
  handleSubmit,
  onCancel,
  agendaSchema,
  stats,
  values
}) {
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
        label: intl.formatMessage(form.charts),
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
          )
      },
      {
        label: intl.formatMessage(form.others),
        options: [
          { label: intl.formatMessage(form.separator), value: 'separator' }
        ]
      }
    ];
  }, [agendaSchema.fields, intl, stats]);

  const widthOptions = useMemo(
    () => [
      {
        label: intl.formatMessage(form.oneColumn),
        value: 1
      },
      {
        label: intl.formatMessage(form.oneLine),
        value: 2
      }
    ],
    [intl]
  );

  return (
    <form onSubmit={handleSubmit} className="margin-v-lg margin-h-md">
      <ReactSelectField
        name="type"
        placeholder={intl.formatMessage(form.typeSelectPlaceholder)}
        options={chartOptions}
      />
      {values.type && values.type !== 'separator' ? (
        <div className="margin-top-sm">
          {intl.formatMessage(form.componentWidth)}{' '}
          <span
            css={css`
              display: inline-block;
              width: 50%;
            `}
          >
            <ReactSelectField
              name="width"
              placeholder={intl.formatMessage(form.widthSelectPlaceholder)}
              initialValue={1}
              options={widthOptions}
            />
          </span>
        </div>
      ) : null}
      <div className="margin-top-sm">
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
