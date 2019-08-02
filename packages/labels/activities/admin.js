"use strict";

module.exports = {
  "agenda.sendInvitation": {
    "en": "{user} invited {email} as {credential} on {agenda}.",
    "fr": "{user} a invité {email} comme {credential} sur {agenda}."
  },
  "agenda.acceptInvitation": {
    "en": "{user} has accepted the invitation of {originMember} to become {credential} on {agenda}.",
    "fr": "{user} a accepté l'invitation de {originMember} pour devenir {credential} sur {agenda}.",
    "de": "{user} has der Einladung von {originMember} angenommen {credential} auf {agenda} geworden.",
    "es": "{user} ha aceptado una invitación para unirse {originMember} {credential} sobre el agenda {agenda}."
  },
  "agenda.addMember": {
    "en": "{originMember} added {user} as {credential} on {agenda}.",
    "fr": "{originMember} a ajouté {user} comme {credential} sur {agenda}.",
    "de": "{originMember} hinzugefügt {user} in {credential} auf {agenda}.",
    "es": "{originMember} añadió {user} como de la {agenda} {credential}."
  },
  "agenda.setMemberRole": {
    "en": "{user} passed {originMember} from {beforeCredential} to {credential} on {agenda}.",
    "fr": "{user} a passé {originMember} de {beforeCredential} à {credential} sur {agenda}.",
    "de": "{user} {originMember} bestanden aus {beforeCredential} auf {credential} auf {agenda}.",
    "es": "{user} pasó {originMember} de {beforeCredential} hacia {credential} en {agenda}."
  },
  "agenda.create": {
    "en": "{user} created the agenda {agenda}.",
    "fr": "{user} a créé l'agenda {agenda}.",
    "de": "{user} der Kalender {agenda} erstellt.",
    "es": "{user} ha creado el agenda del {agenda}."
  },
  "agenda.updateContribution": {
    "en": "{user} updated contribution settings on {agenda}.",
    "fr": "{user} a mis à jour les paramètres de contribution sur {agenda}.",
    "de": "{user} aktualisiert Beitrag Einstellungen auf {agenda}.",
    "es": "{user} ha actualizado el agenda de configuración de contribución."
  },
  "agenda.updateProfile": {
    "en": "{user} updated profile on {agenda}.",
    "fr": "{user} a mis à jour le profil sur {agenda}.",
    "de": "{user} Profil auf {agenda} aktualisiert.",
    "es": "{user} ha actualizado el perfil {agenda}."
  },
  "agenda.rename": {
    "en": "{user} renamed the agenda {before} to {after}.",
    "fr": "{user} a renommé l'agenda {before} en {after}.",
    "de": "{user} umbenannt die Kalender {before} auf {after}.",
    "es": "{user} cambió el nombre del agenda {before} a {after}."
  },
  "agenda.setOfficial": {
    "en": "The agenda {agenda} became official.",
    "fr": "L'agenda {agenda} est devenu officiel.",
    "de": "Die Kalender {agenda} wurde offiziell.",
    "es": "El agenda {agenda} se convirtió oficial."
  },
  "agenda.setUnofficial": {
    "en": "The agenda {agenda} became unofficial.",
    "fr": "L'agenda {agenda} est devenu non officiel.",
    "de": "Die Kalender {agenda} wurde inoffiziell.",
    "es": "El agenda {agenda} se convirtió oficial."
  },
  "agenda.changeEventState": {
    "en": "{user} passed {event} from \"{before}\" to \"{after}\".",
    "fr": "{user} a passé {event} de \"{before}\" à \"{after}\".",
    "de": "{user} Veranstaltung von \"{before}\" bestanden \"{after}\".",
    "es": "{user} pasó del evento \"{before}\" a \"{after}\"."
  },
  "agenda.publishEvent": {
    "en": "{user} published {event} on {agenda}.",
    "fr": "{user} a publié {event} sur {agenda}.",
    "de": "{user} {event} auf {agenda} veröffentlicht.",
    "es": "{user} registró {event} sobre el agenda {agenda}."
  },
  "agenda.unpublishEvent": {
    "en": "{user} unpublished {event} on {agenda}.",
    "fr": "{user} a dépublié {event} sur {agenda}.",
    "de": "{user} nicht veröffentlichtes {event} auf {agenda}.",
    "es": "{user} ha cancellado la publicacion de {event} en la agenda {agenda}."
  },
  "agenda.removeEvent": {
    "en": "{user} removed {event} from {agenda}.",
    "fr": "{user} a retiré {event} de {agenda}.",
    "de": "{user} {event} von {agenda} entfernt.",
    "es": "{user} {event} sobre el agenda {agenda} eliminado."
  },
  "agenda.aggregateEvent": {
    "en": "{agenda} aggregated {event} from {sourceAgenda}.",
    "fr": "{agenda} a agrégé {event} à partir de {sourceAgenda}.",
    "de": "{agenda} {event} from {sourceAgenda} aggregiert.",
    "es": "{event} del {agenda} agregada de {sourceAgenda}."
  },
  "agenda.addEvent": {
    "en": "{user} added {event} on {agenda} from {sourceAgenda}.",
    "fr": "{user} a ajouté {event} sur {agenda} à partir de {sourceAgenda}."
  },
  "event.create": {
    "en": "{user} created {event} in the agenda {agenda}.",
    "fr": "{user} a créé {event} dans l'agenda {agenda}.",
    "de": "{user} Veranstaltung auf der Kalender {agenda} erstellt.",
    "es": "{user} creado {event} en el agenda del {agenda}."
  },
  "event.update": {
    "en": "{user} updated {event} on {agenda}.",
    "fr": "{user} a mis à jour {event} sur {agenda}.",
    "de": "{user} {event} auf {agenda} aktualisiert.",
    "es": "{user} ha actualizado {event} de {agenda}."
  },
  'event.updateWithOneChange': {
    "en": "{user} updated the field {fields} of {event} on {agenda}.",
    "fr": "{user} a mis à jour le champ {fields} de {event} sur {agenda}."
  },
  'event.updateWithSomeChanges': {
    "en": "{user} updated {event} on {agenda}: {fields} have been changed.",
    "fr": "{user} a mis à jour {event} sur {agenda}: {fields} ont été modifiés."
  },
  'event.updateWithLotOfChanges': {
    "en": "{user} updated {event} on {agenda} ({fieldsCount} fields).",
    "fr": "{user} a mis à jour {event} sur {agenda} ({fieldsCount} champs)."
  },
  "event.delete": {
    "en": "{user} deleted {event} on {agenda}.",
    "fr": "{user} a supprimé {event} sur {agenda}.",
    "de": "{user} {event} auf {agenda} gelöscht.",
    "es": "{user} elimina eventos de la agenda {agenda}."
  },
  "noActivity": {
    "en": "No activity",
    "fr": "Pas d'activité",
    "de": "Keine Aktivität",
    "es": "No hay actividad"
  },
  "unknownActivity": {
    "en": "Activity label missing for {verb}",
    "fr": "Libellé d'activité manquant pour {verb}"
  }
}
