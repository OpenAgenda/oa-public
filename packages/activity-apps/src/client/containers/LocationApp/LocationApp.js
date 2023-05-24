import { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWRInfinite from 'swr/infinite';
import { useInView } from 'react-intersection-observer';
import qs from 'qs';
import { useModal, Modal, Spinner } from '@openagenda/react-shared';
import { ActivityItem } from '../../components';

const messages = defineMessages({
  openHistory: {
    id: 'ActivityApps.LocationApp.openHistory',
    defaultMessage: 'Open history',
  },
  history: {
    id: 'ActivityApps.LocationApp.history',
    defaultMessage: 'History',
  },
  locationHistory: {
    id: 'ActivityApps.LocationApp.locationHistory',
    defaultMessage: 'Location history',
  }
});

const PAGE_SIZE = 20;

function ModalContent({ agendaUid, locationUid }) {
  const {
    data: pages,
    error,
    size,
    setSize,
    // isValidating,
  } = useSWRInfinite(
    (pageIndex, previousPageData) => {
      // reached the end
      if (previousPageData && !previousPageData.activities?.length) return null;

      // first page, we don't have `previousPageData`
      if (pageIndex === 0) return ['ActivityApps/location', 'activities', locationUid];

      // add the cursor to the API endpoint
      return ['ActivityApps/location', 'activities', locationUid, previousPageData[previousPageData.length - 1].id];
    },
    ([_comp, _requestId, _locationUid, fromId]) => {
      return fetch(`/api/agendas/${agendaUid}/locations/${locationUid}/activities?${qs.stringify({
        fromId,
        withConfig: fromId ? undefined : true
      })}`)
        .then(r => {
          if (r.ok) return r.json();
          throw new Error('Can\'t list activities');
        })
    },
    {
      keepPreviousData: true,
      revalidateFirstPage: false,
      // revalidateOnMount: false,
      // revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      // use: [swrLaggyMiddleware],
    },
  );

  const isLoadingInitialData = !pages && !error;
  const isLoadingMore = isLoadingInitialData || (size > 0 && pages && pages[size - 1] === undefined);
  const isEmpty = pages?.[0]?.activities?.length === 0;
  const isReachingEnd = isEmpty || (pages && pages[pages.length - 1]?.activities?.length < PAGE_SIZE);

  const { ref } = useInView({
    onChange: inView => {
      if (inView && !isReachingEnd && !isLoadingMore) {
        setSize(size + 1).catch(() => null);
      }
    },
  });

  if (isLoadingInitialData) {
    return (
      <div className="padding-v-md" style={{ position: 'relative' }}>
        <Spinner />
      </div>
    );
  }

  return (
    <>
      <ul className="list-unstyled activity-list" style={{ padding: '0' }}>
        {pages.map(
          page => page.activities.map(activity => (
            <ActivityItem
              key={activity.id}
              activity={activity}
              config={pages[0].config}
            />
          )),
        )}
      </ul>

      <div ref={ref} />
    </>
  );
}

export default function LocationApp({ agendaUid, locationUid, link = false }) {
  const intl = useIntl();
  const activitiesModal = useModal();

  const openModal = useCallback(e => {
    e?.stopPropagation?.(); // needed in admin locations
    activitiesModal.open();
  }, [activitiesModal]);

  const closeModal = useCallback(e => {
    e?.stopPropagation?.(); // needed in admin locations
    activitiesModal.close();
  }, [activitiesModal]);

  return (
    <>
      {link ? (
        <button className="btn btn-link action" onClick={openModal}>
          {intl.formatMessage(messages.history)}
        </button>
      ) : (
        <button className="btn btn-default" onClick={openModal}>
          {intl.formatMessage(messages.openHistory)}
        </button>
      )}

      {activitiesModal.isOpen ? (
        <Modal
          title={intl.formatMessage(messages.locationHistory)}
          classNames={{ overlay: 'popup-overlay big' }}
          onClose={closeModal}
        >
          <ModalContent agendaUid={agendaUid} locationUid={locationUid} />
        </Modal>
      ) : null}
    </>
  );
}
