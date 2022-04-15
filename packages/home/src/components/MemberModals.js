import React from 'react';
import MemberForm from '@openagenda/member-apps/dist/components/Form';

export function MemberEditModal(props) {
  const {
    member,
    res,
    uid,
    onSuccess,
    onRemoveSuccess,
    closeModal,
    lang,
    settings,
  } = props;

  const isAdminMod = [2, 3].includes(member.role);
  return (
    <MemberForm
      lang={lang}
      operation="update"
      mode="modal"
      optionalFields={isAdminMod}
      GDPR={{
        display: !isAdminMod,
        moreInfo: settings.contribution.messages.GDPRInformation,
      }}
      showSuccessMessage
      res={`${res.members.replace(':agendaUid', uid)}/${member.userUid}`}
      onSuccess={update => onSuccess(member, update)}
      onRemoveSuccess={() => onRemoveSuccess()}
      onCloseModalRequest={() => closeModal()}
    />
  );
}

export function MemberRemoveModal({
  member,
  res,
  uid,
  onSuccess,
  closeModal,
  lang,
}) {
  return (
    <MemberForm
      lang={lang}
      operation="remove"
      mode="modal"
      res={`${res.members.replace(':agendaUid', uid)}/${member.userUid}`}
      onRemoveSuccess={() => onSuccess(member)}
      onCloseModalRequest={() => closeModal()}
    />
  );
}
