import isAdminMod from '@/src/utils/isAdminMod';

export default function canModifyLocation(member, event, agenda) {
  return (
    isAdminMod(member) &&
    (event.location?.agendaUid === agenda.uid ||
      event.location?.setUid === agenda.locationSetUid)
  );
}
