'use strict';

module.exports = {
  viewAllActivities: {
    en: 'See all activities',
    fr: 'Voir toutes les activités',
    de: 'Alle Aktivitäten',
    es: 'Ver todas las actividades',
    br: 'Gwelet an holl obererezhioù'
  },
  markAllAsRead: {
    en: 'Mark all as read',
    fr: 'Tout marquer comme lu',
    de: 'Alles als gelesen markieren',
    es: 'Marcar todo como leído',
    br: 'Merkañ pep tra evel lennet'
  },
  noNotif: {
    en: 'No notification.',
    fr: 'Aucune notification.',
    de: 'Keine Benachrichtigung.',
    es: 'Sin notificación.',
    br: "N'eus kemenn ebet."
  },
  next: {
    en: 'Next',
    fr: 'Suivant',
    de: 'Nächster',
    es: 'Próximo',
    br: "War-lerc'h"
  },
  user: {
    en: '{others, plural, =0 {{user}} one {{user} and 1 other user} other {{user} and {others} other users}}',
    fr: '{others, plural, =0 {{user}} one {{user} et 1 autre utilisateur} other {{user} et {others} autres utilisateurs}}',
    de: '{others, plural, =0 {{user}} one {{user} und 1 andere Benutzer} other {{user} und {others} andere Benutzer}}',
    es: '{others, plural, =0 {{user}} one {{user} y 1 otro} other {{user} y {others} otros}}',
    br: '{others, plural, =0 {{user}} one {{user} hag 1 implijer all} other {{user} ha {others} implijer all}}'
  },
  event: {
    en: '{others, plural, =0 {{event}} one {{event} and 1 other event} other {{event} and {others} other events}}',
    fr: '{others, plural, =0 {{event}} one {{event} et 1 autre événement} other {{event} et {others} autres événements}}',
    de: '{others, plural, =0 {{event}} one {{event} und 1 andere Veranstaltung} other {{event} und {others} andere Veranstaltungen}}',
    es: '{others, plural, =0 {{event}} one {{event} y 1 otro evento} other {{event} y eventos {others}}}',
    br: '{others, plural, =0 {{event}} one {{event} hag 1 darvoud all} other {{event} ha {others} a zarvoudoù all}}'
  },
  email: {
    en: '{others, plural, =0 {{email}} one {{email} and 1 other} other {{email} and {others} other}}',
    fr: '{others, plural, =0 {{email}} one {{email} et 1 autre} other {{email} et {others} autres}}',
    de: '{others, plural, =0 {{email}} one {{email} und 1 anderer} other {{email} und {others} andere}}',
    es: '{others, plural, =0 {{email}} one {{email} y 1 otros} other {{email} y {others} otros}}',
    br: '{others, plural, =0 {{email}} one {{email} hag 1 all} other {{email} ha {others} all}}'
  },
  'agenda.sendInvitation': {
    en: '{actor} invited {object} as {credential} on {target}.',
    fr: '{actorCount, plural, one {{actor} a invité} other {{actor} ont invité}} {object} comme {credential} sur {target}.'
  },
  'agenda.acceptInvitation': {
    en: '{actor} has accepted the invitation to become {credential} on {target}.',
    fr: "{actorCount, plural, one {{actor} a accepté} other {{actor} ont accepté}} l'invitation pour devenir {credential} sur {target}."
  },
  'agenda.addMember': {
    en: '{actor} added {object} as {credential} on {target}.',
    fr: '{actorCount, plural, one {{actor} a ajouté} other {{actor} ont ajouté}} {object} comme {credential} sur {target}.'
  },
  'agenda.addMember.withYou': {
    en: '{actor} added you as {credential} on {target}.',
    fr: '{actor} vous a ajouté comme {credential} sur {target}.',
    de: '{actor} hinzugefügt Sie als {credential} auf {target}.',
    es: '{actor} te ha añadido como credencial {target}.',
    br: "{actor} en/he deus ouzhpennet ac'hanoc'h evel {credential} war {target}."
  },
  'agenda.setMemberRole': {
    en: '{actor} appointed {object} as {credential} on {target}.',
    fr: '{actorCount, plural, one {{actor} a nommé} other {{actor} ont nommé}} {object} {credential} sur {target}.'
  },
  'agenda.setMemberRole.withYou': {
    en: '{actor} appointed you as {credential} on {target}.',
    fr: '{actor} vous a nommé {credential} sur {target}.',
    de: '{actor} Sie als {credential} auf {target} ernannt.',
    es: '{actor} te ha llamado de {credential} en {target}.',
    br: "{actor} en/he deus anvet ac'hanoc'h da {credential} war {target}."
  },
  'agenda.create': {
    en: '{actor} created the agenda {target}.',
    fr: "{actor} a créé l'agenda {target}.",
    de: '{actor} der Kalender {target} erstellt.',
    es: '{actor} creó  el {agenda} {target}.',
    br: '{actor} en/he deus krouet an deiziataer {target}.'
  },
  'agenda.updateContribution': {
    en: '{actor} updated contribution settings of {target}.',
    fr: '{actorCount, plural, one {{actor} a mis} other {{actor} ont mis}} à jour les paramètres de contribution de {target}.'
  },
  'agenda.updateProfile': {
    en: '{actor} updated the profile of {target}.',
    fr: '{actorCount, plural, one {{actor} a mis} other {{actor} ont mis}} à jour le profil de {target}.'
  },
  'agenda.rename': {
    en: '{actor} renamed the agenda {beforeTitle} to {afterTitle}.',
    fr: "{actorCount, plural, one {{actor} a renommé} other {{actor} ont renommé}} l'agenda {beforeTitle} en {afterTitle}."
  },
  'agenda.setOfficial': {
    en: 'The agenda {target} became official.',
    fr: "L'agenda {target} est devenu officiel.",
    de: 'Die Kalender {target} wurde offiziell.',
    es: 'El objetivo {agenda} se hizo oficial.',
    br: 'Deuet eo an deiziataer {target} da vezañ ofisiel.'
  },
  'agenda.setUnofficial': {
    en: 'The agenda {target} became unofficial.',
    fr: "L'agenda {target} est devenu non officiel.",
    de: 'Die Kalender {target} wurde inoffiziell.',
    es: 'El agenda de destino se convirtió en oficial.',
    br: 'Deuet eo an deiziataer {target} da vezañ diofisiel.'
  },
  'agenda.changeEventState': {
    en: '{actor} passed {object} as "{newState}" on {target}.',
    fr: '{actorCount, plural, one {{actor} a passé} other {{actor} ont passé}} {object} en "{newState}" sur {target}.'
  },
  'agenda.publishEvent': {
    en: '{actor} published {object} on {target}.',
    fr: '{actorCount, plural, one {{actor} a publié} other {{actor} ont publié}} {object} sur {target}.',
    de: '{actor} {object} auf {target} veröffentlicht.',
    es: '{actor} publicado el {object} en {target}',
    br: '{actor} en/he deus embannet {object} war {target}.'
  },
  'agenda.unpublishEvent': {
    en: '{actor} unpublished {object} on {target}.',
    fr: '{actorCount, plural, one {{actor} a dépublié} other {{actor} ont dépublié}} {object} sur {target}.'
  },
  'agenda.removeEvent': {
    en: '{actor} removed {object} from {target}.',
    fr: '{actorCount, plural, one {{actor} a retiré} other {{actor} ont retiré}} {object} de {target}.'
  },
  'agenda.aggregateEvent': {
    en: '{target} aggregated {object} from {actor}.',
    fr: '{target} a agrégé {object} à partir de {actor}.',
    de: '{target} {object} {from} {actor} aggregiert.',
    es: '{target} ha agregado {object} de {actor}.',
    br: '{target} en/he deus toueziet {object} diwar {actor}.'
  },
  'event.create': {
    en: '{actor} created {object} on {target}.',
    fr: '{actorCount, plural, one {{actor} a créé} other {{actor} ont créé}} {object} sur {target}.'
  },
  'event.update': {
    en: '{actor} updated {object} on {target}.',
    fr: '{actorCount, plural, one {{actor} a mis} other {{actor} ont mis}} à jour {object} sur {target}.'
  },
  'event.delete': {
    en: '{actor} removed {object} from {target}.',
    fr: '{actorCount, plural, one {{actor} a supprimé} other {{actor} ont supprimé}} {object} de {target}.'
  },
};
