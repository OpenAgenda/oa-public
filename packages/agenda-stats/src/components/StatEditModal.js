import { defineMessages, useIntl } from 'react-intl';
import React, { useMemo } from 'react';
import { Form } from 'react-final-form';
import { Modal } from '@openagenda/react-components';
import { ReactSelectField } from '@openagenda/react-shared';
import { css } from '@emotion/core';
import useChartTitle from '../hooks/useChartTitle';
import formMessages from './messages/form';

const messages = defineMessages({
  modalTitle: {
    id: 'AgendaStats.StatEditModal.modalTitle',
    defaultMessage: 'Edit the chart: {chartTitle}',
  },
});

function StatEditForm({ handleSubmit, onCancel }) {
  const intl = useIntl();
  const widthOptions = useMemo(
    () => [
      {
        label: intl.formatMessage(formMessages.oneColumn),
        value: 1,
      },
      {
        label: intl.formatMessage(formMessages.oneLine),
        value: 2,
      },
    ],
    [intl]
  );

  return (
    <form onSubmit={handleSubmit}>
      <div className="margin-top-sm">
        {intl.formatMessage(formMessages.componentWidth)}{' '}
        <span
          css={css`
            display: inline-block;
            width: 50%;
          `}
        >
          <ReactSelectField
            name="width"
            placeholder={intl.formatMessage(
              formMessages.widthSelectPlaceholder
            )}
            options={widthOptions}
            menuPosition="fixed"
          />
        </span>
      </div>

      <div className="margin-top-sm text-center">
        <button
          type="button"
          className="btn btn-link btn-link-inline text-danger"
          onClick={onCancel}
        >
          {intl.formatMessage(formMessages.cancel)}
        </button>
        <button type="submit" className="btn btn-primary margin-left-sm">
          {intl.formatMessage(formMessages.update)}
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
      width: stat.chart.width || 1,
    }),
    [stat.chart.width]
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
