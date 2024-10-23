import { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { fromMarkdownToHTML } from '@openagenda/md';
import { useModal, Modal, Spinner } from '@openagenda/react-shared';

export default function ActivityDetail({ activity, config }) {
  const intl = useIntl();
  const modal = useModal();
  const { id: activityId } = activity;
  const { detailLabelIds } = config[activity.verb];
  const [isLoading, setIsLoading] = useState(false);
  const [activityDetail, setActivityDetail] = useState(null);
  useEffect(() => {
    if (modal.isOpen) {
      fetch(`/activities/${activityId}`).then(async (response, err) => {
        if (err) {
          setIsLoading(false);
          console.error(err);
          return;
        }
        const responseJson = await response.json();
        setActivityDetail(JSON.parse(responseJson.detail));
        setIsLoading(false);
      });
    }
  }, [activityId, modal]);

  return (
    <>
      {modal.isOpen ? (
        <Modal
          title={intl.formatMessage({ id: detailLabelIds.modalTitle })}
          isOpen={modal.isOpen}
          onClose={modal.close}
          classNames={{
            overlay: 'popup-overlay',
            title: 'popup-title padding-bottom-z',
          }}
        >
          {isLoading ? (
            <div className="padding-v-md" style={{ position: 'relative' }}>
              <Spinner />
            </div>
          ) : null}
          {activityDetail?.text ? (
            <div className="padding-v-md">
              <div
                dangerouslySetInnerHTML={{
                  __html: fromMarkdownToHTML(activityDetail?.text),
                }}
              />
            </div>
          ) : (
            <div>{intl.formatMessage({ id: detailLabelIds.noDetail })}</div>
          )}
        </Modal>
      ) : null}
      <button
        type="button"
        className="btn btn-link"
        onClick={() => {
          setIsLoading(true);
          modal.open();
        }}
      >
        {intl.formatMessage({ id: detailLabelIds.button })}
      </button>
    </>
  );
}
