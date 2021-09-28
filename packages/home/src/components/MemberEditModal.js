import React from 'react';
import MemberForm from '@openagenda/member-apps/dist/components/Form';

function MemberEditModal({
  member,
  res,
  uid,
  onSuccess,
  closeModal,
  lang,
  description,
}) {
  const isAdminMod = [2, 3].includes(member.role);
  return (
    <MemberForm
      lang={lang}
      operation="update"
      mode="modal"
      description={isAdminMod ? null : description}
      optionalFields={isAdminMod}
      showSuccessMessage
      res={`${res.members.replace(':agendaUid', uid)}/${member.userUid}`}
      onSuccess={update => onSuccess(member, update)}
      onCloseModalRequest={() => closeModal()}
    />
  );
}

export default MemberEditModal;
