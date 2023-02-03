"use strict";

module.exports = {
  "agenda.changeEventState": {
    "en": "{user} passed {event} from \"{before}\" to \"{after}\" on {agenda}.",
    "fr": "{user} a passé {event} de \"{before}\" à \"{after}\" sur {agenda}.",
    "io": "crwdns11154:0{user}crwdnd11154:0{event}crwdnd11154:0{before}crwdnd11154:0{after}crwdnd11154:0{agenda}crwdne11154:0",
    "oc": "{user} a passat {event} de \"{before}\" a \"{after}\" sus {agenda}."
  },
  "agenda.publishEvent": {
    "en": "{user} published {event} on {agenda}.",
    "fr": "{user} a publié {event} sur {agenda}.",
    "de": "{user} {event} auf {agenda} veröffentlicht.",
    "es": "{user} registró {event} sobre el agenda {agenda}.",
    "it": "{user} ha pubblicato {event} su {agenda}.",
    "io": "crwdns11156:0{user}crwdnd11156:0{event}crwdnd11156:0{agenda}crwdne11156:0",
    "oc": "{user} a publicat {event} sus {agenda}."
  },
  "agenda.unpublishEvent": {
    "en": "{user} unpublished {event} on {agenda}.",
    "fr": "{user} a dépublié {event} sur {agenda}.",
    "de": "{user} nicht veröffentlichtes {event} auf {agenda}.",
    "es": "{user} ha cancellado la publicacion de {event} en la agenda  {agenda}.",
    "it": "{user} ha annullato la pubblicazione di {event} su {agenda}.",
    "io": "crwdns11158:0{user}crwdnd11158:0{event}crwdnd11158:0{agenda}crwdne11158:0",
    "oc": "{user} a despublicat {event} sus {agenda}."
  },
  "agenda.systemUnpublishEvent": {
    "en": "{event} has been automatically unpublished on {agenda} for moderation",
    "fr": "{event} a été dépublié automatiquement sur {agenda} pour nouveau contrôle",
    "io": "crwdns16408:0{event}crwdnd16408:0{agenda}crwdne16408:0",
    "oc": "{event} es estat automaticament despublicat de {agenda} per moderacion"
  },
  "agenda.removeEvent": {
    "en": "{user} removed {event} from {agenda}.",
    "fr": "{user} a retiré {event} de {agenda}.",
    "de": "{user} {event} von {agenda} entfernt.",
    "es": "{user} {event} sobre el agenda {agenda} eliminado.",
    "it": "{user} ha rimosso {event} da {agenda}.",
    "io": "crwdns11160:0{user}crwdnd11160:0{event}crwdnd11160:0{agenda}crwdne11160:0",
    "oc": "{user} a tirat {event} de {agenda}."
  },
  "agenda.aggregateEvent": {
    "en": "{agenda} aggregated {event} from {sourceAgenda}.",
    "fr": "{agenda} a agrégé {event} à partir de {sourceAgenda}.",
    "de": "{agenda} {event} from {sourceAgenda} aggregiert.",
    "es": "{event} del agenda agregada de {sourceAgenda}.",
    "it": "{agenda} ha aggregato {event} da {sourceAgenda}.",
    "io": "crwdns11162:0{agenda}crwdnd11162:0{event}crwdnd11162:0{sourceAgenda}crwdne11162:0",
    "oc": "{agenda} a agregat {event} de {sourceAgenda}."
  },
  "agenda.addEvent": {
    "en": "{user} added {event} from {sourceAgenda}.",
    "fr": "{user} a ajouté {event} à partir de {sourceAgenda}.",
    "it": "{user} ha aggiunto {event} da {sourceAgenda}.",
    "io": "crwdns11164:0{user}crwdnd11164:0{event}crwdnd11164:0{sourceAgenda}crwdne11164:0",
    "oc": "{user} a apondut {event} a partir de {sourceAgenda}."
  },
  "event.create": {
    "en": "{user} created {event} in the agenda {agenda}.",
    "fr": "{user} a créé {event} dans l'agenda {agenda}.",
    "de": "{user} Veranstaltung auf der Kalender {agenda} erstellt.",
    "es": "{user} creado {event} en el agenda del {agenda}.",
    "it": "{user} ha creato {event} nell'agenda {agenda}.",
    "io": "crwdns11166:0{user}crwdnd11166:0{event}crwdnd11166:0{agenda}crwdne11166:0",
    "oc": "{user} a creat {event} dins l'agenda {agenda}."
  },
  "event.update": {
    "en": "{user} updated {event} on {agenda}.",
    "fr": "{user} a mis à jour {event} sur {agenda}.",
    "de": "{user} {event} auf {agenda} aktualisiert.",
    "es": "{user} ha actualizado {event} de {agenda}.",
    "it": "{user} ha aggiornato {event} su {agenda}.",
    "io": "crwdns11168:0{user}crwdnd11168:0{event}crwdnd11168:0{agenda}crwdne11168:0",
    "oc": "{user} a metut {event} a jorn sus {agenda}."
  },
  "event.updateWithOneChange": {
    "en": "{user} updated the field {fields} of {event} on {agenda}.",
    "fr": "{user} a mis à jour le champ {fields} de {event} sur {agenda}.",
    "it": "{user} ha aggiornato il campo {fields} de {event} su {agenda}.",
    "io": "crwdns11170:0{user}crwdnd11170:0{fields}crwdnd11170:0{event}crwdnd11170:0{agenda}crwdne11170:0",
    "oc": "{user} a metut a jorn lo camp {fields} de {event} sus {agenda}."
  },
  "event.updateWithSomeChanges": {
    "en": "{user} updated {event} on {agenda}: {fields} have been changed.",
    "fr": "{user} a mis à jour {event} sur {agenda} : {fields} ont été modifiés.",
    "it": "{user} ha aggiornato {event} su {agenda}: {fields} sono stati modificati.",
    "io": "crwdns11172:0{user}crwdnd11172:0{event}crwdnd11172:0{agenda}crwdnd11172:0{fields}crwdne11172:0",
    "oc": "{user} a metut a jorn {event} sus {agenda} : {fields} son estats cambiats."
  },
  "event.updateWithLotOfChanges": {
    "en": "{user} updated {event} on {agenda} ({fieldsCount} fields).",
    "fr": "{user} a mis à jour {event} sur {agenda} ({fieldsCount} champs).",
    "it": "{user} ha aggiornato {event} su {agenda} ({fieldsCount} champs).",
    "io": "crwdns11174:0{user}crwdnd11174:0{event}crwdnd11174:0{agenda}crwdnd11174:0{fieldsCount}crwdne11174:0",
    "oc": "{user} a metut a jorn {event} sus {agenda} ({fieldsCount} camps)."
  },
  "event.delete": {
    "en": "{user} deleted {event} on {agenda}.",
    "fr": "{user} a supprimé {event} sur {agenda}.",
    "de": "{user} {event} auf {agenda} gelöscht.",
    "es": "{user} elimina eventos de la agenda {agenda}.",
    "it": "{user} ha cancellato {event} su {agenda}.",
    "io": "crwdns11176:0{user}crwdnd11176:0{event}crwdnd11176:0{agenda}crwdne11176:0",
    "oc": "{user} a suprimit {event} sus {agenda}."
  },
  "unknownActivity": {
    "en": "Activity label missing for {verb}",
    "fr": "Libellé d'activité manquant pour {verb}",
    "it": "Etichetta di attività mancante per {verb}",
    "io": "crwdns11178:0{verb}crwdne11178:0",
    "oc": "Etiqueta d'activitat de manca per {verb}"
  }
}
