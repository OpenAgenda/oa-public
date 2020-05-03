import React, { useMemo, useState, useCallback } from 'react';
import { useIntl, defineMessages } from 'react-intl';
import { DateRangePicker } from 'react-date-range';
import * as rdrLocales from 'react-date-range/dist/locale';
import { Modal, Spinner } from '@openagenda/react-components';
import dateRanges from '../dateRanges';

const messages = defineMessages({
  dateRangeModalTitle: {
    id: 'AgendaStats.PeriodModal.dateRangeModalTitle',
    defaultMessage: 'Choose period'
  },
  submit: {
    id: 'AgendaStats.PeriodModal.submit',
    defaultMessage: 'Submit'
  }
});

export default function PeriodModal({
  initialValues,
  onSubmit,
  onClose
}) {
  const intl = useIntl();

  const { staticRanges, inputRanges } = useMemo(() => dateRanges(intl), [intl]);
  const [ranges, setRanges] = useState(initialValues);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(() => {
    setSubmitting(true);
    onSubmit(ranges)
      .then(() => {
        setSubmitting(false);
        onClose();
      });
  });

  return (
    <Modal
      title={intl.formatMessage(messages.dateRangeModalTitle)}
      onClose={onClose}
      classNames={{
        overlay: 'popup-overlay big'
      }}
      disableBodyScroll
    >
      <DateRangePicker
        onChange={item => setRanges([item?.selection ? item.selection : item.range1])}
        showSelectionPreview
        moveRangeOnFirstSelection={false}
        months={1}
        ranges={ranges}
        direction="horizontal"
        locale={rdrLocales[intl.locale]}
        staticRanges={staticRanges}
        inputRanges={inputRanges}
      />

      <div className="text-center margin-top-md">
        <button
          type="button"
          className="btn btn-primary"
          onClick={handleSubmit}
        >
          {intl.formatMessage(messages.submit)}
        </button>

        {submitting ? (
          <span className="margin-left-sm">
            <Spinner mode="inline" />
          </span>
        ) : null}
      </div>
    </Modal>
  );
}
