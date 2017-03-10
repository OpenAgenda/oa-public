
# Feed

## activities.feed( type, uid )

Permet de pré-sélectionner un feed, sans faire de requête à la BDD pour le moment.

***params:***
type: Le type de l'entité qui sera utilisée, peut être 'user', 'agenda', 'event', ou 'network' par exemple
uid: L'uid de l'entité concernée

### .feed( type, uid ).create()

Créé un feed.

### .feed( type, uid ).get( [options, cb] )

Récupère les données du feed pré-sélectionné

options *(object)*: 

 - follow *(bool)*: Récupère aussi ses follows
 - followedBy *(bool)*: Récupère aussi les feeds par lesquels ce feed est suivi

return **data** *(object)*:

 - id
 - type: 'user', 'agenda', 'event', ou 'network' par exemple'
 - entityUid


### .feed( type, uid ).remove( [cb] )

Supprime le feed de manière *soft*.

### .feed( type, uid ).follow( feedId [, cb] )

**Alias:** .follow( entityType, uid [, cb] )

Follow un autre feed.

*Note*: Par la suite on pourrait ajouter un champ `private` à la table activity qui rend ou non l'activité followable par d'autres.

### .feed( type, uid ).unfollow( feedId [, cb] )

**Alias:** .unfollow( entityType, uid [, cb] )

Arrête de suivre un autre feed, tout en gardant l'historique qui a été suivi jusqu'ici.

## Activities

### .feed( type, uid ).activities.add( activity [, cb] )

Ajoute une activité à un feed. Puis l'ajoute à une notification ou en créé une nouvelle si besoin.

activity *(object)*:

- actor *(string)*: le sujet qui effectue l'action
- verb *(string)*: le type d'action effectuée
- object *(string)*: le sujet concerné par l'activité
- additional_infos *(object)*: des informations supplémentaires si besoin, utile pour le formatage des notifications

### .feed( type, uid ).activities.list( [query,] fromId, limit, [options, cb] )

Liste les activités d'un feed.

query *(object)*:

- actor
- verb
- object

options *(object)*: ??

### .feed( type, uid ).activities.get( activityId [, cb] )

Récupère une activité, principalement utiliser par les notifications.

## Notifications

Les notifications sont limitées aux feeds utilisateurs.

### .feed( type, uid ).notifications.list( [query,] fromId, limit, [options, cb] )

Liste les notifications d'un feed.

query *(object)*:

- verb

options *(object)*: ??

### .feed( type, uid ).notifications.get( notificationId [, cb] )

Récupère une notification.

### .feed( type, uid ).notifications.update( notificationId, data [, cb] )

Permet de marquer une notification comme vue ou lue.

data *(object)*:

- mark_seen *(bool)*
- mark_read *(bool)*

### .feed( type, uid ).notifications.remove( notificationId [, cb] )

Supprime une notification.