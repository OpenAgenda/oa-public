import React from 'react';
import MemberForm from '@openagenda/member-apps/dist/components/Form';

function MemberEditModal({
  member, res, uid, onSuccess, closeModal, lang
}) {
  return (
    <MemberForm
      lang={lang}
      operation="update"
      mode="modal"
      showSuccessMessage
      res={`${res.members.replace(':agendaUid', uid)}/${member.userUid}`}
      onSuccess={update => onSuccess(member, update)}
      onCloseModalRequest={() => closeModal()}
    />
  );
}

export default MemberEditModal;
