import { defineMessages, useIntl } from 'react-intl';
import React, { useMemo } from 'react';
import { Form, Field } from 'react-final-form';
import { ReactSelectField, Modal } from '@openagenda/react-shared';
import useChartTitle from '../hooks/useChartTitle';
import form from '../messages/form';
import MetricsField from './MetricsField';

const messages = defineMessages({
  modalTitle: {
    id: 'AgendaStats.StatEditModal.modalTitle',
    defaultMessage: 'Edit the chart: {chartTitle}',
  },
});

function StatEditForm({ handleSubmit, onCancel, stat }) {
  const intl = useIntl();
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
    <form onSubmit={handleSubmit} className="margin-all-md">
      {/* Metrics */}
      {stat.state?.fieldSchema?.fieldType === 'integer' ? (
        <>
          <p>
            <b>{intl.formatMessage(form.metric)}</b>
          </p>
          <MetricsField name="aggregation.metrics" />
        </>
      ) : null}

      {/* Width */}
      {stat.chart.type && stat.chart.type !== 'separator' ? (
        <div className="margin-top-md">
          <p>
            <b>{intl.formatMessage(form.componentWidth)}</b>
          </p>
          <ReactSelectField
            name="chart.width"
            Field={Field}
            placeholder={intl.formatMessage(form.widthSelectPlaceholder)}
            initialValue={1}
            options={widthOptions}
            menuPosition="fixed"
          />
        </div>
      ) : null}

      <div className="margin-top-sm text-center">
        <button
          type="button"
          className="btn btn-link btn-link-inline text-danger"
          onClick={onCancel}
        >
          {intl.formatMessage(form.cancel)}
        </button>
        <button type="submit" className="btn btn-primary margin-left-sm">
          {intl.formatMessage(form.update)}
        </button>
      </div>
    </form>
  );
}

export default function StatEditModal({ stat, onSubmit, onClose }) {
  const intl = useIntl();
  const chartTitle = useChartTitle(stat);
  const initialValues = useMemo(
    () => ({
      aggregation: {
        metrics: stat.aggregation.metrics,
      },
      chart: {
        width: stat.chart.width || 1,
      },
    }),
    [stat.aggregation.metrics, stat.chart.width]
  );

  return (
    <Modal
      title={intl.formatMessage(messages.modalTitle, { chartTitle })}
      onClose={onClose}
      disableBodyScroll
    >
      <Form
        component={StatEditForm}
        initialValues={initialValues}
        onSubmit={onSubmit}
        onCancel={onClose}
        stat={stat}
      />
    </Modal>
  );
}
