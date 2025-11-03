import { useState, useEffect } from 'react';
import { useIntl } from 'react-intl';
import { Modal, SortableSelect } from '@openagenda/react-shared';
import geoMessages from '@openagenda/common-labels/geo';
import exportsMessages from '../messages/exports.js';

export default function PdfModal({ onClose, agendaUid, queryString = '' }) {
  const intl = useIntl();

  const [hasMultipleLocations, setHasMultipleLocations] = useState(true);
  const [locationInHeader, setLocationInHeader] = useState(false);
  const [useSections, setUseSections] = useState(false);
  const [sort, setSort] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        `/agendas/${agendaUid}/admin/settings/exports`,
      );
      const data = await response.json();
      setHasMultipleLocations(data?.hasMultipleLocations ?? true);
      setLocationInHeader(!(data?.hasMultipleLocations ?? true));
    }

    fetchData();
  }, [agendaUid]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const exportUrl = new URL(
      `/agendas/${agendaUid}/admin/events.v2.pdf${queryString}`,
      window.location.origin,
    );
    exportUrl.searchParams.append('lang', intl.locale);

    if (locationInHeader) {
      exportUrl.searchParams.append('locationInHeader', 'true');
    }
    if (sort?.length) {
      sort.forEach((s) => {
        exportUrl.searchParams.append('sort[]', s);
      });
    }

    window.open(exportUrl, '_self');
    return onClose();
  };

  return (
    <Modal
      onClose={onClose}
      classNames={{ overlay: 'popup-overlay big' }}
      disableBodyScroll
    >
      <form className="export export-form" onSubmit={handleSubmit}>
        {hasMultipleLocations ? (
          <>
            <label htmlFor="use-sections">
              <input
                name="use-sections"
                id="use-sections"
                type="checkbox"
                checked={useSections}
                onChange={() => setUseSections(!useSections)}
              />
              &nbsp;
              {intl.formatMessage(exportsMessages.PDFGeoSections)}
            </label>
            {useSections ? (
              <div className="margin-left-md margin-top-sm">
                <SortableSelect
                  options={[
                    {
                      value: 'location.region.asc',
                      label: intl.formatMessage(geoMessages.region),
                    },
                    {
                      value: 'location.department.asc',
                      label: intl.formatMessage(geoMessages.department),
                    },
                    {
                      value: 'location.adminLevel3.asc',
                      label: intl.formatMessage(geoMessages.adminLevel3),
                    },
                    {
                      value: 'location.city.asc',
                      label: intl.formatMessage(geoMessages.city),
                    },
                    {
                      value: 'location.name.asc',
                      label: intl.formatMessage(geoMessages.location),
                    },
                  ]}
                  value={sort}
                  placeholder={intl.formatMessage(
                    exportsMessages.PDFSelectPlaceholder,
                  )}
                  onChange={(update) => setSort(update)}
                  menuPosition="fixed"
                />
                <div className="margin-top-xs">
                  {intl.formatMessage(exportsMessages.PDFSelectSub)}
                </div>
              </div>
            ) : null}
          </>
        ) : (
          <label htmlFor="location-header">
            <input
              name="location-header"
              id="location-header"
              type="checkbox"
              checked={locationInHeader}
              onChange={() => setLocationInHeader(!locationInHeader)}
            />
            &nbsp;
            {intl.formatMessage(exportsMessages.PDFHighlightLocationName)}
          </label>
        )}

        <button
          className="close"
          type="button"
          onClick={onClose}
          aria-label={intl.formatMessage(exportsMessages.cancel)}
        >
          <i className="fa fa-times fa-lg" />
        </button>
        <div className="margin-top-md text-center">
          <button type="submit" className="btn btn-primary">
            {intl.formatMessage(exportsMessages.PDFDownload)}
          </button>
        </div>
      </form>
    </Modal>
  );
}
