"use strict";

module.exports = {
  "agenda.sendInvitation": {
    "en": "{user} invited {email} as {credential}.",
    "fr": "{user} a invité {email} comme {credential}.",
    "io": "crwdns11096:0{user}crwdnd11096:0{email}crwdnd11096:0{credential}crwdne11096:0",
    "it": "{user} ha invitato {email} come {credential}."
  },
  "agenda.acceptInvitation": {
    "en": "{user} has accepted the invitation of {originMember} to become {credential}.",
    "fr": "{user} a accepté l'invitation de {originMember} pour devenir {credential}.",
    "de": "{user} has der Einladung von {originMember} angenommen {credential} geworden.",
    "es": "{user} ha aceptado una invitación para unirse {originMember} {credential}.",
    "it": "{user} ha accettato l'invito de {originMember} ha diventare {credential}.",
    "io": "crwdns11098:0{user}crwdnd11098:0{originMember}crwdnd11098:0{credential}crwdne11098:0"
  },
  "agenda.addMember": {
    "en": "{originMember} added {user} as {credential}.",
    "fr": "{originMember} a ajouté {user} comme {credential}.",
    "de": "{originMember} hinzugefügt {user} in {credential}.",
    "es": "{originMember} añadió {user} como {credential}.",
    "it": "{originMember} ha aggiunto {user} come {credential}.",
    "io": "crwdns11100:0{originMember}crwdnd11100:0{user}crwdnd11100:0{credential}crwdne11100:0"
  },
  "agenda.removeMember": {
    "en": "{originMember} removed {user} ({credential}).",
    "fr": "{originMember} a retiré {user} ({credential}).",
    "it": "{originMember} ha rimosso {user} ({credential}).",
    "io": "crwdns11102:0{originMember}crwdnd11102:0{user}crwdnd11102:0{credential}crwdne11102:0"
  },
  "agenda.setMemberRole": {
    "en": "{user} passed {originMember} from {beforeCredential} to {credential}.",
    "fr": "{user} a passé {originMember} de {beforeCredential} à {credential}.",
    "de": "{user} {originMember} bestanden aus {beforeCredential} auf {credential}.",
    "es": "{user} pasó {originMember} de a {beforeCredential} {credential}.",
    "it": "{user} ha cambiato {originMember} de {beforeCredential} ha {credential}.",
    "io": "crwdns11104:0{user}crwdnd11104:0{originMember}crwdnd11104:0{beforeCredential}crwdnd11104:0{credential}crwdne11104:0"
  },
  "agenda.addSource": {
    "en": "{user} added {sourceAgenda} as a source.",
    "fr": "{user} a ajouté {sourceAgenda} aux sources.",
    "it": "{user} ha aggiunto {sourceAgenda} aux sources.",
    "io": "crwdns11106:0{user}crwdnd11106:0{sourceAgenda}crwdne11106:0"
  },
  "agenda.removeSource": {
    "en": "{user} removed {sourceAgenda} from the sources.",
    "fr": "{user} a retiré {sourceAgenda} des sources.",
    "it": "{user} ha rimosso {sourceAgenda} dei fonti.",
    "io": "crwdns11108:0{user}crwdnd11108:0{sourceAgenda}crwdne11108:0",
    "oc": "{user} a tirat {sourceAgenda} de las sorsas."
  },
  "agenda.create": {
    "en": "{user} created the agenda",
    "fr": "{user} a créé l'agenda.",
    "de": "{user} erstellt die Kalender",
    "es": "{user} ha establecido el agenda.",
    "it": "{user} ha creato l'agenda",
    "io": "crwdns11110:0{user}crwdne11110:0",
    "oc": "{user} a creat l'agenda"
  },
  "agenda.updateContribution": {
    "en": "{user} updated contribution settings.",
    "fr": "{user} a mis à jour les paramètres de contribution.",
    "de": "{user} Beitrag Einstellungen aktualisiert.",
    "es": "{user} ha actualizado los parámetros de entrada.",
    "it": "{user} ha aggiornato le impostazioni dei contributi.",
    "io": "crwdns11112:0{user}crwdne11112:0",
    "oc": "{user} a metut a jorn los reglatges de contribucion."
  },
  "agenda.updateProfile": {
    "en": "{user} updated profile of the agenda.",
    "fr": "{user} a mis à jour le profil de l'agenda.",
    "de": "{user} Profil der Agenda aktualisiert.",
    "es": "{user} ha actualizado el perfil agenda.",
    "it": "{user} ha aggiornato il profilo de l'agenda.",
    "io": "crwdns11114:0{user}crwdne11114:0",
    "oc": "{user} a metut lo perfil a jorn."
  },
  "agenda.rename": {
    "en": "{user} renamed the agenda {before} to {after}.",
    "fr": "{user} a renommé l'agenda {before} en {after}.",
    "de": "{user} umbenannt die Agenda {before} auf {after}.",
    "es": "{user} cambió el nombre del agenda {before} a {after} del horario.",
    "it": "{user} ha rinominato l'agenda {before} en {after}.",
    "io": "crwdns11116:0{user}crwdnd11116:0{before}crwdnd11116:0{after}crwdne11116:0",
    "oc": "{user} tornèt nomenar l'agenda {before} en {after}."
  },
  "agenda.setOfficial": {
    "en": "The agenda {agenda} became official.",
    "fr": "L'agenda {agenda} est devenu officiel.",
    "de": "Die Kalender {agenda} wurde offiziell.",
    "es": "El agenda {agenda} se convirtió oficial.",
    "it": "L'agenda {agenda} è diventato ufficiale.",
    "io": "crwdns11118:0{agenda}crwdne11118:0",
    "oc": "L'agenda {agenda} es venguda oficiala."
  },
  "agenda.setUnofficial": {
    "en": "The agenda {agenda} became unofficial.",
    "fr": "L'agenda {agenda} est devenu non officiel.",
    "de": "Die Kalender {agenda} wurde inoffiziell.",
    "es": "El agenda {agenda} se convirtió oficial.",
    "it": "L'agenda {agenda} è diventato ufficioso.",
    "io": "crwdns11120:0{agenda}crwdne11120:0",
    "oc": "L'agenda {agenda} es venguda non-oficiala."
  },
  "agenda.changeEventState": {
    "en": "{user} passed {event} from \"{before}\" to \"{after}\".",
    "fr": "{user} a passé {event} de \"{before}\" à \"{after}\".",
    "de": "{user} Veranstaltung von \"{before}\" bestanden \"{after}\".",
    "es": "{user} pasó del {event} \"{before}\" a \"{after}\".",
    "it": "{user} ha cambiato {event} de \"{before}\" ha \"{after}\".",
    "io": "crwdns11122:0{user}crwdnd11122:0{event}crwdnd11122:0{before}crwdnd11122:0{after}crwdne11122:0"
  },
  "agenda.publishEvent": {
    "en": "{user} published {event} on {agenda}.",
    "fr": "{user} a publié {event} sur {agenda}.",
    "de": "{user} {event} auf {agenda} veröffentlicht.",
    "es": "{user} registró {event} sobre el agenda {agenda}.",
    "it": "{user} ha pubblicato {event} su {agenda}.",
    "io": "crwdns11124:0{user}crwdnd11124:0{event}crwdnd11124:0{agenda}crwdne11124:0"
  },
  "agenda.unpublishEvent": {
    "en": "{user} unpublished {event}.",
    "fr": "{user} a dépublié {event}.",
    "de": "{user} nicht veröffentlichtes {event}.",
    "es": "{user} ha inéditos {event}.",
    "it": "{user} ha inedito {event}.",
    "io": "crwdns11126:0{user}crwdnd11126:0{event}crwdne11126:0",
    "oc": "{user} a despublicat {event}."
  },
  "agenda.systemUnpublishEvent": {
    "en": "{event} has been automatically unpublished on {agenda} for moderation",
    "fr": "{event} a été dépublié automatiquement sur {agenda} pour nouveau contrôle",
    "io": "crwdns16406:0{event}crwdnd16406:0{agenda}crwdne16406:0"
  },
  "agenda.removeEvent": {
    "en": "{user} removed {event}.",
    "fr": "{user} a retiré {event}.",
    "de": "{user} Veranstaltung entfernt.",
    "es": "{user} eliminó{event}.",
    "it": "{user} ha rimosso {event}.",
    "io": "crwdns11128:0{user}crwdnd11128:0{event}crwdne11128:0"
  },
  "agenda.aggregateEvent": {
    "en": "{agenda} aggregated {event} from {sourceAgenda}.",
    "fr": "{agenda} a agrégé {event} à partir de {sourceAgenda}.",
    "de": "{agenda} {event} from {sourceAgenda} aggregiert.",
    "es": "{event} del agenda agregada de {sourceAgenda}.",
    "it": "{agenda} ha aggregato {event} da {sourceAgenda}.",
    "io": "crwdns11130:0{agenda}crwdnd11130:0{event}crwdnd11130:0{sourceAgenda}crwdne11130:0"
  },
  "agenda.addEvent": {
    "en": "{user} added {event} from {sourceAgenda}.",
    "fr": "{user} a ajouté {event} à partir de {sourceAgenda}.",
    "it": "{user} ha aggiunto {event} da {sourceAgenda}.",
    "io": "crwdns11132:0{user}crwdnd11132:0{event}crwdnd11132:0{sourceAgenda}crwdne11132:0"
  },
  "event.create": {
    "en": "{user} created {event}.",
    "fr": "{user} a créé {event}.",
    "de": "{user} Veranstaltung erstellt.",
    "es": "{user} creada {event}.",
    "it": "{user} ha creato {event}.",
    "io": "crwdns11134:0{user}crwdnd11134:0{event}crwdne11134:0"
  },
  "event.update": {
    "en": "{user} updated {event}.",
    "fr": "{user} a mis à jour {event}.",
    "de": "{user} Veranstaltung aktualisiert.",
    "es": "{user} ha actualizado {event}.",
    "it": "{user} ha aggiornato {event}.",
    "io": "crwdns11136:0{user}crwdnd11136:0{event}crwdne11136:0",
    "oc": "{user} a metut {event} a jorn."
  },
  "event.updateWithOneChange": {
    "en": "{user} updated the field {fields} of {event}.",
    "fr": "{user} a mis à jour le champ {fields} de {event}.",
    "it": "{user} ha aggiornato il campo {fields} de {event}.",
    "io": "crwdns11138:0{user}crwdnd11138:0{fields}crwdnd11138:0{event}crwdne11138:0",
    "oc": "{user} a metut a jorn lo camp {fields} de {event}."
  },
  "event.updateWithSomeChanges": {
    "en": "{user} updated {event}: {fields} have been changed.",
    "fr": "{user} a mis à jour {event}: {fields} ont été modifiés.",
    "it": "{user} ha aggiornato {event}: {fields} sono stati modificati.",
    "io": "crwdns11140:0{user}crwdnd11140:0{event}crwdnd11140:0{fields}crwdne11140:0",
    "oc": "{user} a metut a jorn {event} : {fields} son estats cambiats."
  },
  "event.updateWithLotOfChanges": {
    "en": "{user} updated {event} ({fieldsCount} fields).",
    "fr": "{user} a mis à jour {event} ({fieldsCount} champs).",
    "it": "{user} ha aggiornato {event} ({fieldsCount} champs).",
    "io": "crwdns11142:0{user}crwdnd11142:0{event}crwdnd11142:0{fieldsCount}crwdne11142:0",
    "oc": "{user} a metut a jorn {event} ({fieldsCount} camps)."
  },
  "event.delete": {
    "en": "{user} deleted {event}.",
    "fr": "{user} a supprimé {event}.",
    "de": "{user} Veranstaltung gelöscht.",
    "es": "{user} eliminió {eventos}.",
    "it": "{user} ha cancellato {event}.",
    "io": "crwdns11144:0{user}crwdnd11144:0{event}crwdne11144:0"
  },
  "activities": {
    "en": "Activities",
    "fr": "Activités",
    "de": "Aktivitäten",
    "es": "actividades",
    "it": "Attività",
    "io": "crwdns11146:0crwdne11146:0"
  },
  "next": {
    "en": "Next",
    "fr": "Suivant",
    "de": "Nächster",
    "es": "Próximo",
    "it": "Prossimo",
    "br": "War-lerc'h",
    "io": "crwdns11148:0crwdne11148:0"
  },
  "noActivity": {
    "en": "Your agenda activity will be displayed here.",
    "fr": "L'activité de votre agenda s'affichera ici.",
    "de": "Ihre Agenda Aktivität wird hier angezeigt.",
    "es": "La actividad de su agenda aparecerá aquí.",
    "it": "L'attività del vostro agenda sarà visibile qui.",
    "io": "crwdns11150:0crwdne11150:0"
  },
  "unknownActivity": {
    "en": "Activity label missing for {verb}",
    "fr": "Libellé d'activité manquant pour {verb}",
    "it": "Etichetta di attività mancante per {verb}",
    "io": "crwdns11152:0{verb}crwdne11152:0"
  }
}
