export default function canModifyLocation(isAdminMod, event, agenda) {
  return isAdminMod && (event.location.agendaUid === agenda.uid || event.location.setUid === agenda.locationSetUid);
}
