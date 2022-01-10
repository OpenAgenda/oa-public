import React, { useMemo, useState, useCallback } from 'react';
import { useLatest } from 'react-use';
import { useIntl, defineMessages } from 'react-intl';
import { DateRangePicker } from 'react-date-range';
import * as rdrLocales from 'react-date-range/dist/locale';
import { Modal, Spinner } from '@openagenda/react-shared';
import dateRanges from '../dateRanges';

const messages = defineMessages({
  rangeModalTitle: {
    id: 'AgendaStats.RangeModal.modalTitle',
    defaultMessage: 'Choose period',
  },
  submit: {
    id: 'AgendaStats.RangeModal.submit',
    defaultMessage: 'Submit',
  },
  cancel: {
    id: 'AgendaStats.RangeModal.cancel',
    defaultMessage: 'Cancel',
  },
});

export default function RangeModal({ initialValues, onSubmit, onClose }) {
  const intl = useIntl();

  const { staticRanges, inputRanges } = useMemo(() => dateRanges(intl), [intl]);
  const [ranges, setRanges] = useState(() => (Array.isArray(initialValues.range)
    ? initialValues.range
    : [initialValues.range]));
  const latestRange = useLatest(ranges);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = useCallback(() => {
    setSubmitting(true);

    onSubmit({ range: latestRange.current })
      .finally(() => {
        setSubmitting(false);
      })
      .then(() => {
        onClose();
      });
  }, [latestRange, onClose, onSubmit]);

  const onChange = useCallback(
    item => setRanges([item?.selection ? item.selection : item.range1]),
    []
  );

  return (
    <Modal
      title={intl.formatMessage(messages.rangeModalTitle)}
      onClose={onClose}
      classNames={{
        overlay: 'popup-overlay big',
      }}
      disableBodyScroll
    >
      <DateRangePicker
        onChange={onChange}
        showSelectionPreview
        showMonthName={false}
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
          className="btn btn-danger btn-bordered"
          onClick={onClose}
        >
          {intl.formatMessage(messages.cancel)}
        </button>
        <button
          type="button"
          className="btn btn-primary margin-left-sm"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {intl.formatMessage(messages.submit)}

          {submitting ? (
            <span className="margin-left-xs">
              <Spinner mode="inline" />
            </span>
          ) : null}
        </button>
      </div>
    </Modal>
  );
}
