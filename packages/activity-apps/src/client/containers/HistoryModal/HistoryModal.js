import { useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import useSWRInfinite from 'swr/infinite';
import { useInView } from 'react-intersection-observer';
import qs from 'qs';
import { useModal, Modal, Spinner } from '@openagenda/react-shared';
import { ActivityItem } from '../../components';

const messages = defineMessages({
  noActivity: {
    id: 'ActivityApps.HistoryModal.noActivity',
    defaultMessage: 'No activity',
  },
});

const PAGE_SIZE = 20;

function ModalContent({ res }) {
  const intl = useIntl();
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
      if (pageIndex === 0) return ['ActivityApps/HistoryModal', res];

      // add the cursor to the API endpoint
      return ['ActivityApps/HistoryModal', res, previousPageData[previousPageData.length - 1].id];
    },
    ([_comp, _res, fromId]) => {
      return fetch(`${res}?${qs.stringify({
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

  if (isEmpty) {
    return (
      <div className="padding-v-md text-center" style={{ position: 'relative' }}>
        {intl.formatMessage(messages.noActivity)}
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

export default function HistoryModal({ trigger: Trigger, res, modalTitle }) {
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
      <Trigger openModal={openModal} />

      {activitiesModal.isOpen ? (
        <Modal
          title={modalTitle}
          classNames={{ overlay: 'popup-overlay big activity-modal' }}
          onClose={closeModal}
        >
          <ModalContent res={res} />
        </Modal>
      ) : null}
    </>
  );
}
