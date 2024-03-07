# Post-mortem

Quand une interruption de service a lieu, garder une trace de ce qu'il s'est passé, sur la résolution et sur les mesures à prendre pour réduire le risque d'une nouvelle occurrence

## 2024-03-07 - Erreurs affichées aléatoirement pour tous les utilisateurs

Un appel "système" d'un service de suivi d'erreurs javascript sur les navigateurs fait à nos serveurs était à l'origine du problème (post sur /monit par la lib de Sentry). La requête passait par un middleware qui faisait la passe au service sentry.io, qui lui rendait un 502. Pour une raison inconnue, Sentry renvoyait parfois des codes 502 à nos serveurs... qui passaient ce code au reverse-proxy chargé de renvoyer la réponse au client. Le comportement par défaut du proxy quand il reçoit ce type de réponse est d'interrompre les requêtes en cours envoyées au même serveur, considérant son adresse comme étant erronée (502: "Bad Gateway").

```
    JS sur Navigateur -> /monit -> Reverse proxy -> Serveur applicatif OA ----> Sentry
                       <-               😱       <-           ..        <- 502 ---|
```

La morale: on évite de passer des 502 en réponse aux requêtes, en particulier quand elle proviennent de services tiers.
L'ironie: c'est un service de tracking d'erreur qui a provoqué le plantage d'OpenAgenda pendant quelques heures.

La résolution du problème est passée par la rédaction d'un script bash de test pour localiser le problème dans le cheminement des requêtes dans OpenAgenda, par un blâme et une prise de contact à Infomaniak (ils n'y étaient pour rien), par un dépiautage de la configuration du serveur nginx semblant poser problème, puis d'une rerelecture des logs d'erreur du proxy. Le message révélateur:

```
2024/03/07 14:28:36 [warn] 9966#0: *5938 upstream server temporarily disabled while reading response header from upstream, client: 10.101.11.228, server: openagenda.com, request: "POST /monit?o=60122&p=128991 HTTP/1.1", upstream: "http://10.101.5.64:8903/monit?o=60122&p=128991", host: "openagenda.com", referrer: "https://openagenda.com/"
```

`upstream server temporarily disabled while reading response header from upstream`: comprendre "je vais désactiver la connexion au serveur pendant un moment, la réponse qu'il me donne me fait dire qu'il est pas en top-forme.

## 2023-10-23 - Certains agendas completements vides d'événements

Résumé: des shards non alloués faussaient les lectures d'événements sur certains agendas: ils apparaissaient comme étant vides.

Vincent m'a prévenu que le petit agenda était vidé de ses événements. J'ai d'abord imaginé une répétition du problème de la semaine dernière quand une valeur invalide sur un événement empêchait une re-synchro de l'agenda (sur changement de config). La resynchro se passait bien en local, mais pas en prod. J'ai supposé qu'un événement créé récemment (après le dernier dump) était à l'origine du problème et j'ai relancé un nouveau dump.

...puis un mail de Versailles nous a prévenu que 4 de leurs agendas étaient vides. Que le problème de validation se soit produit à plusieurs endroits sans que les clients aient réagit sur les jours suivant sa résolution était peu vraisemblable. D'autant plus que tous les agendas concernés étaient complètement vides alors que le bug de validation permettait quand même une réindexation partielle.

`curl -XGET http://localhost:9200/_cluster/health` sur un des noeuds indiquait un statut "red"

Elasticsearch tranche ses index en 'shards' qu'il répartit sur plusieurs noeuds. Selon la config, chaque shard dispose d'un réplicat au cas où il devient indisponible et pour répartir la charge. On peut orienter l'indexation d'un document vers un réplicat donné en jouant sur la valeur `routing` d'un document. Pour OA, on se sert de ça pour orienter les documents (événements) d'un agenda donné vers un shard. https://www.elastic.co/guide/en/elasticsearch/reference/current/mapping-routing-field.html

La commande `curl -XGET "http://localhost:9200/_cat/shards?v=true&h=index,shard,prirep,state,node,unassigned.reason&s=state` permet de voir l'état des shards

Le message d'erreur affiché sur 2 shards: `ALLOCATION_FAILED`

Une commande permet d'avoir un détail sur le problème: `_cluster/allocation/explain`

Le message affiché:

```
shard has exceeded the maximum number of retries [5] on failed allocation attempts - manually call [/_cluster/reroute?retry_failed=true] to retry, [unassigned_info[[reason=ALLOCATION_FAILED], at[2023-10-19T09:00:08.687Z], failed_attempts[5], failed_nodes[[uGKcvyMpRyKD98W0YbHArg, c2poMscoTkWj5nKGjc7mbw]], delayed=false, details[failed shard on node [uGKcvyMpRyKD98W0YbHArg]: failed to create shard, failure IOException[failed to obtain in-memory shard lock]; nested: ShardLockObtainFailedException[[main][1]: obtaining shard lock timed out after 5000ms, previous lock details: [shard creation] trying to lock for [shard creation]]; ], allocation_status[no_attempt]]]
```

L'appel manuel suggéré `/_cluster/reroute?retry_failed=true` a provoqué la ré-allocation des shards (REALLOCATING)... au bout de quelques minutes, les shards étaient de nouveau disponibles... les agendas retrouvaient leurs événements.

`curl -XPOST "http://localhost:9200/_cluster/reroute?retry_failed=true"`

Le problème initial de réallocation a pu se produire quand le cluster avait une grosse charge. Le cluster tentait alors une ré-allocation et la charge l'a empéché de la compléter sous le timeout préconfiguré.

On pourrait, pour mieux réagir la prochaine fois:

 * Coller le statut de santé sur un log insightOps et mettre en place une alerte email ou autre pour quand il n'est plus au vert
 * Augmenter le timeout
 * Ajouter le cluster shard health au /supervisor

Liens utiles:

 * https://www.elastic.co/guide/en/elasticsearch/reference/current/diagnose-unassigned-shards.html
 * https://chat.openai.com/share/20856f8e-0b27-42ff-b046-8c29afac6c69