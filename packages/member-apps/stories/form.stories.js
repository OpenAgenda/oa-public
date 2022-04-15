import React, { useState } from 'react';
import '@openagenda/bs-templates/compiled/main.css';
import Form from '../src/components/Form';
import ComponentCanvas from './decorators/ComponentCanvas';
import Providers from './decorators/Providers';
import GDPRInformation from './fixtures/GDPRInformation.md';

export default {
  title: 'Form',
  decorators: [Providers, ComponentCanvas],
};

export const createForm = () => (
  <div>
    <Form
      lang="fr"
      operation="create"
      res="/api/agendas/123/members"
      GDPR={{
        display: true,
      }}
      onSuccess={() => {
        // eslint-disable-next-line no-console
        console.log('success');
      }}
    />
  </div>
);

export const updateForm = () => (
  <div>
    <Form
      lang="fr"
      operation="update"
      res="/api/agendas/123/members/456"
      GDPR={{
        display: true,
        moreInfo: GDPRInformation,
      }}
      onSuccess={() => {
        // eslint-disable-next-line no-console
        console.log('success');
      }}
    />
  </div>
);

export const updateFormWithPreloadedMember = () => (
  <div>
    <Form
      lang="fr"
      operation="update"
      res="http://localhost:3000/api/agendas/123/members/456"
      member={{
        userUid: 456,
        name: 'Préchargé',
        phone: '0651781026',
        email: 'email@openagenda.com',
        position: 'suppert',
        organization: 'OA',
        role: 'administrator',
      }}
    />
  </div>
);

export const UpdateFormModal = () => {
  const [display, setDisplay] = useState(true);
  const closeModal = () => {
    setDisplay(false);
  };

  if (!display) {
    return <div>Closed</div>;
  }

  return (
    <Form
      lang="fr"
      operation="update"
      mode="modal"
      res="/api/agendas/123/members/456"
      onSuccess={() => {
        // eslint-disable-next-line no-console
        console.log('success');
      }}
      onCloseModalRequest={() => closeModal()}
    />
  );
};

export const UpdateFormModalWithConfirm = () => {
  const [display, setDisplay] = useState(true);
  const closeModal = () => {
    setDisplay(false);
  };

  if (!display) {
    return <div>Closed</div>;
  }

  return (
    <Form
      lang="fr"
      operation="update"
      mode="modal"
      showSuccessMessage
      res="/api/agendas/123/members/456"
      onSuccess={() => {
        // eslint-disable-next-line no-console
        console.log('success');
      }}
      onCloseModalRequest={() => closeModal()}
    />
  );
};

export const FormWithCustomTitleAndDescription = () => (
  <Form
    lang="fr"
    operation="update"
    res="/api/agendas/123/members/456"
    title="Un titre passé en prop"
    description="Une description passée en prop"
    onSuccess={() => {
      // eslint-disable-next-line no-console
      console.log('success');
    }}
  />
);

export const FormWithOptionalFields = () => (
  <Form
    lang="fr"
    operation="update"
    optionalFields
    res="/api/agendas/123/members/456"
    title="Les champs sont optionnels"
    description={null}
    onSuccess={() => {
      // eslint-disable-next-line no-console
      console.log('success');
    }}
  />
);

export const FormWithRemoveMeLink = () => (
  <Form
    lang="fr"
    operation="update"
    optionalFields
    res="/api/agendas/123/members/456"
    title="Un lien pour se retirer est présent"
    description={null}
    displayRemoveAction
    onSuccess={() => {
      // eslint-disable-next-line no-console
      console.log('success');
    }}
  />
);

export const FormForRemove = () => (
  <Form
    lang="fr"
    operation="remove"
    res="/api/agendas/123/members/456"
    onRemoveSuccess={() => {
      // eslint-disable-next-line no-console
      console.log('success');
    }}
  />
);

export const FullWidthButtons = () => (
  <Form
    lang="fr"
    operation="create"
    res="http://localhost:3000/api/agendas/123/members/456"
    blockButtons
    onRemoveSuccess={() => {
      // eslint-disable-next-line no-console
      console.log('success');
    }}
  />
);

export const noCancelButton = () => (
  <Form
    lang="fr"
    operation="create"
    res="http://localhost:3000/api/agendas/123/members/456"
    hideCancel
    onRemoveSuccess={() => {
      // eslint-disable-next-line no-console
      console.log('success');
    }}
  />
);

export const FixTwoLinksOneForm = () => {
  const [display, setDisplay] = useState(false);
  const [res, setRes] = useState(false);
  const closeModal = () => {
    setDisplay(false);
  };

  if (!display) {
    return (
      <div>
        <button
          className="btn btn-default margin-all-sm"
          type="button"
          onClick={() => setRes(789)}
        >
          Kevin
        </button>
        <button
          className="btn btn-default margin-all-sm"
          type="button"
          onClick={() => setRes(456)}
        >
          Kaoré
        </button>
        <button
          className="btn btn-default margin-all-sm"
          type="button"
          onClick={() => {
            setDisplay(true);
          }}
        >
          Display
        </button>
      </div>
    );
  }

  return (
    <Form
      lang="fr"
      operation="update"
      mode="modal"
      showSuccessMessage
      res={`/api/agendas/123/members/${res}`}
      onSuccess={() => {
        // eslint-disable-next-line no-console
        console.log('success');
      }}
      onCloseModalRequest={() => closeModal()}
    />
  );
};
