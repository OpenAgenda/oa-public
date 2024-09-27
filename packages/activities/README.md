# Feed

## activities.feed( { entityType, entityUid } ) / .feed( id )

Permet de pré-sélectionner un feed, sans faire de requête à la BDD pour le moment.

**_params:_**  
entityType: Le type de l'entité qui sera utilisée, peut être 'user', 'agenda', 'event', ou 'network' par exemple  
entityUid: L'uid de l'entité concernée

### .feed( { entityType, entityUid } ).create()

Créé un feed.

### .feed( { entityType, entityUid } ).get( [options, cb] )

Récupère les données du feed pré-sélectionné

options _(object)_:

- follow _(bool)_: Récupère aussi ses follows
- followedBy _(bool)_: Récupère aussi les feeds par lesquels ce feed est suivi

return **data** _(object)_:

- id
- type: 'user', 'agenda', 'event', ou 'network' par exemple'
- entityUid

### .feed( { entityType, entityUid } ).remove( [cb] )

Supprime le feed de manière _soft_.

### .feed( { entityType, entityUid } ).follow( feedId [, cb] )

**Alias:** .follow( entityType, uid [, cb] )

Follow un autre feed.

_Note_: Par la suite on pourrait ajouter un champ `private` à la table activity qui rend ou non l'activité followable par d'autres.

### .feed( { entityType, entityUid } ).unfollow( feedId [, cb] )

**Alias:** .unfollow( { entityType, entityUid } [, cb] )

Arrête de suivre un autre feed, tout en gardant l'historique qui a été suivi jusqu'ici.

## Activities

### .feed( { entityType, entityUid } ).activities.add( activity [, cb] )

Ajoute une activité à un feed. Puis l'ajoute à une notification ou en créé une nouvelle si besoin.

activity _(object)_:

- actor _(string)_: le sujet qui effectue l'action
- verb _(string)_: le type d'action effectuée
- object _(string)_: le sujet concerné par l'activité
- additional*infos *(object)\_: des informations supplémentaires si besoin, utile pour le formatage des notifications

### .feed( { entityType, entityUid } ).activities.list( [query,] fromId, limit, [options, cb] )

Liste les activités d'un feed.

query _(object)_:

- actor
- verb
- object

options _(object)_: ??

### .feed( { entityType, entityUid } ).activities.get( activityId [, cb] )

Récupère une activité, principalement utiliser par les notifications.

## Notifications

Les notifications sont limitées aux feeds utilisateurs.

### .feed( { entityType, entityUid } ).notifications.list( [query,] fromId, limit, [options, cb] )

Liste les notifications d'un feed.

query _(object)_:

- verb

options _(object)_: ??

### .feed( { entityType, entityUid } ).notifications.get( notificationId [, cb] )

Récupère une notification.

### .feed( { entityType, entityUid } ).notifications.update( notificationId, data [, cb] )

Permet de marquer une notification comme vue ou lue.

data _(object)_:

- mark*seen *(bool)\_
- mark*read *(bool)\_

### .feed( { entityType, entityUid } ).notifications.remove( notificationId [, cb] )

Supprime une notification.
