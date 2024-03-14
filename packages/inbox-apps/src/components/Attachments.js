import { useContext, useState, useEffect } from 'react';
import Uppy from '@uppy/core';
import Dashboard from '@uppy/react/lib/Dashboard';
import StatusBar from '@uppy/react/lib/StatusBar';
import AwsS3 from '@uppy/aws-s3';
import { Modal } from '@openagenda/react-shared';
import I18nContext from '../contexts/I18nContext';
import getUppyLocale from '../locales/uppyLocales';

export default function Attachments({ setUppy, uploadEndpoint }) {
  const { getLabel, lang } = useContext(I18nContext);

  const [uppy] = useState(() =>
    new Uppy({
      restrictions: {
        maxNumberOfFiles: 4,
        allowedFileTypes: [
          'image/*',
          'text/csv',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/pdf',
        ],
      },
      autoProceed: false,
      allowMultipleUploadBatches: false,
    })
      .use(AwsS3, {
        shouldUseMultipart: file => file.size > 100 * 2 ** 20,
        companionUrl: uploadEndpoint,
      })
      .on('upload-success', (file, response) => {
        const url = new URL(response.uploadURL);
        const path = url.pathname;
        const s3Key = path.substring(path.lastIndexOf('/') + 1);
        uppy.setFileMeta(file.id, { key: s3Key });
      }));
  const [modalOpen, setModalOpen] = useState(false);

  const numberFiles = Object.keys(uppy.getState().files).length;

  useEffect(() => {
    setUppy(uppy);

    (async () => {
      const uppyLocale = await getUppyLocale(lang);
      uppy.setOptions({ locale: uppyLocale });
    })();
  }, []);

  return (
    <>
      <p>
        <a role="button" onClick={() => setModalOpen(true)}>
          {numberFiles === 0 ? getLabel('attachFile') : null}
          {numberFiles === 1 ? getLabel('oneAttachment') : null}
          {numberFiles > 1 ? getLabel('nAttachments', { number: numberFiles }) : null}
        </a>
      </p>

      {modalOpen && (
      <Modal
        title={getLabel('uppyModalTitle')}
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        classNames={{
          overlay: 'popup-overlay attachments-upload',
        }}
        disableBodyScroll
      >
        <Dashboard
          uppy={uppy}
          closeModalOnClickOutside
          hideUploadButton
          hideRetryButton
          hideCancelButton
          disableStatusBar
          proudlyDisplayPoweredByUppy={false}
          height={328}
          note={getLabel('uppyNote')}
        />

        <div className="text-center padding-top-md">
          <button type="button" className="btn btn-info" onClick={() => setModalOpen(false)}>
            {getLabel('validate')}
          </button>
        </div>
      </Modal>
      )}

      <StatusBar
        uppy={uppy}
        showProgressDetails
        hideUploadButton
        hideRetryButton
        hideCancelButton
      />
    </>
  );
}
