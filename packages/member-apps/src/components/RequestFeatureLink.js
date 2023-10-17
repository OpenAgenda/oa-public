import Modal from '@openagenda/react-shared/lib/components/Modal';
import { MoreInfo } from '@openagenda/react-shared';
import { defineMessages, useIntl } from 'react-intl';
import { useState } from 'react';

const messages = defineMessages({
  title: {
    id: 'AgendaMember.RequestFeatureLink.title',
    defaultMessage: 'Feature activation',
  },
  link: {
    id: 'AgendaMember.RequestFeatureLink.link',
    defaultMessage: 'Ask for feature activation',
  },
});

const RequestFeatureLink = ({
  subject,
  linkLabel,
  btnClassName,
  message,
  helpLink,
}) => {
  const intl = useIntl();
  const [showModal, setShowModal] = useState(false);
  return (
    <>
      {showModal ? (
        <Modal
          title={(
            <>
              <i className="golden-icon margin-right-xs" />
              {intl.formatMessage(messages.title)}
            </>
          )}
          onClose={() => setShowModal(false)}
        >
          <div>
            <div>
              {message}{' '}
              {helpLink ? (
                <MoreInfo
                  className="margin-left-xs"
                  id="helpLink"
                  link={helpLink}
                />
              ) : null}
            </div>
            <div className="text-center">
              <a
                className="btn btn-default btn-medium text-center margin-top-md margin-bottom-sm"
                target="_blank"
                rel="noopener noreferrer"
                href={`/support?origin=${encodeURIComponent(
                  window.location.pathname,
                )}&subject=${subject}`}
                onClick={() => setShowModal(false)}
              >
                {`${intl.formatMessage(messages.link)} "${linkLabel}"`}
              </a>
            </div>
          </div>
        </Modal>
      ) : null}
      <button
        type="button"
        className={btnClassName}
        onClick={() => {
          setShowModal(true);
        }}
      >
        <i className="golden-icon" /> {linkLabel}
      </button>
    </>
  );
};

export default RequestFeatureLink;
