"use strict";

module.exports = {
  "agenda.changeEventState": {
    "en": "{user} passed {event} from \"{before}\" to \"{after}\" on {agenda}.",
    "fr": "{user} a passé {event} de \"{before}\" à \"{after}\" sur {agenda}."
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
    "es": "{user} ha cancellado la publicacion de {event} en la agenda  {agenda}."
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
    "es": "{event} del agenda agregada de {sourceAgenda}."
  },
  "agenda.addEvent": {
    "en": "{user} added {event} from {sourceAgenda}.",
    "fr": "{user} a ajouté {event} à partir de {sourceAgenda}."
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
  "unknownActivity": {
    "en": "Activity label missing for {verb}",
    "fr": "Libellé d'activité manquant pour {verb}"
  }
}
