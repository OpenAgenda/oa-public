import MemberForm from '@openagenda/member-apps/dist/components/Form';
import utils from '@openagenda/members/utils';
import { AgendaItem } from './Welcome';

const { getRoleSlug, getRoleCode } = utils;

export function MemberEditModal(props) {
  const {
    agenda,
    member,
    res,
    uid,
    onSuccess,
    onRemoveSuccess,
    closeModal,
    lang,
    settings,
    schema,
  } = props;

  const isAdminMod = [2, 3].includes(
    Number.isInteger(member.role) ? member.role : getRoleCode(member.role),
  );

  return (
    <MemberForm
      header={agenda ? <AgendaItem agenda={agenda} /> : null}
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
      schema={schema}
      userRole={getRoleSlug(member.role)}
      member={member?.custom ? null : member}
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
