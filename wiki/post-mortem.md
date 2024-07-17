# Post-mortem

Quand une interruption de service a lieu, garder une trace de ce qu'il s'est passé, sur la résolution et sur les mesures à prendre pour réduire le risque d'une nouvelle occurrence

## 2024-07-03 - Interruption de la base, disque plein

**Le début**: j'ai tenté de me connecté sur la base pour je ne sais plus quelle raison, la session phpmyadmin ne s'ouvrait pas. Je me suis rendu sur jelastic/infomaniak au bout de 2 minutes, le temps de tester ma connexion internet, les chargements de page (pages de lecture elasticsearch ok, pas de lecture db nok.

**Début du dépistage**: ce n'est pas la première fois que nous sommes confrontés à un pb de disque dur plein. Sur un terminal ouvert sur le noeud concerné, les commandes utiles sont: `df -h` pour avoir une idée générale de l'occupation des disques et `sudo du -ah / | sort -rh | head -n 20` pour avoir une idée de la place que prend chaque dossier dans le dossier courant. On voit assez rapidement que deux types de fichiers non indispensables remplissent le disque: 1/ les fichiers de backup et 2/ les fichiers temporaires innodb. On voit assez rapidement que deux types de fichiers non indispensables remplissent le disque: 1/ les fichiers de backup et 2/ les fichiers temporaires innodb.

**Suppression des fichiers**: la suppression des fichiers est assez simple et se fait vite. Mais même une fois les fichiers supprimés et plus de 50Go libérés, la commande `df` et l'UI jelastic ne reflètent pas ce changement.

**Hypothèse des process empèchent la suppression**: on se souvient d'un problème similaire vécu sur le cluster Elasticsearch, quand les fichiers de logs se remplissaient avec un message d'erreur de requête intempestif jusqu'à arriver à saturation: lorsqu'on supprime un fichier, celui-ci n'est pas réellement supprimé tant qu'un ou plusieurs process l'utilisent.

**Hypothèse des process empèchent la suppression**: on se souvient d'un problème similaire vécu sur le cluster Elasticsearch, quand les fichiers de logs se remplissaient avec un message d'erreur de requête intempestif jusqu'à arriver à saturation: lorsqu'on supprime un fichier, celui-ci n'est pas réellement supprimé tant qu'un ou plusieurs process l'utilisent.

**Tentative de résolution**: un redémarrage du noeud permettrait de relancer tous les process et de libérer les fichiers supprimés. Mais jelastic empèche le redémarrage d'un noeud avec un disque plein. Un redémarrage du process mysql n'aboutit pas non plus. Un ticket et un appel sont initiés pour faire intervernir l'hébergeur.

**Résolution**: l'identification du process bloquant la suppression permettrait son redémarrage et un possible débloquage de la suppression. Les commandes utiles:

**`sudo du -ah / | sort -rh | head -n 20`**: lister les 20 fichiers et/ou dossiers les plus volumineux dans un dossier (ici la racine)

**`lsof`**: liste tous les fichiers en cours de lecture par des process actifs. La liste peut être très longue.

**`sudo lsof +L1 /var/lib/mysql`**: (le dossier `/var/lib/mysql` étant le dossier où se trouvaient les fichiers volumineux) sert pour lister les fichiers ayant moins de 1 lien. Ce qui équivaut à demander de lister les fichiers supprimés mais liés à des process actifs. La liste donnée fourni en 2ème colonne les `pid` des process liés, en 3ème le nom de la commande: On trouve **`nscd`**

**ncsd** est un logiciel de cache système. Qu'on découvre par la même occasion. La suppression n'aboutit que lorsque ce service est à l'arrêt. Donc:: **`sudo service nscd stop`** puis **`rm /les/fichiers/problematiques`** et pour finir **`sudo service nscd start`**

Un **`du`** montre tout de suite que le disque est libéré. L'UI jelastic met 1 minute pour suivre. Le redémarrage du noeud via l'UI est débloqué, la base est de nouveau disponible après un redémarrage

En temps normal on reçoit des alertes quand un noeud se rapproche de la saturation de l'espace disque. Seulement dans ce cas, l'alerte avait été lancée en 2023, à un moment les alertes tombaient dans une adresse email non surveillée. Puis la mémoire s'est très lentement remplie jusqu'à provoquer le problème d'aujourd'hui.

Désormais l'alerte sera bien vue la prochaine fois que le disque passe un seuil. Pour la suite:
1/ J'ai noté de vérifier l'occupation de l'espace disque lundi qui vient pour voir comment ça évolue.
2/ les fichiers volumineux sont des fichiers de cache mysql (à peu près): ils se remplissent lorsque certains type de requêtes sont effectuées. Si ce problème menace de faire mine de refaire surface, il faudra identifier les requêtes nécessitant le plus cette cache pour les optimiser. Une documentation utile: https://dev.mysql.com/doc/refman/5.7/en/internal-temporary-tables.html
3/ Je baisse le niveau du seuil d'alerte pour le tester

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

- Coller le statut de santé sur un log insightOps et mettre en place une alerte email ou autre pour quand il n'est plus au vert
- Augmenter le timeout
- Ajouter le cluster shard health au /supervisor

Liens utiles:

- https://www.elastic.co/guide/en/elasticsearch/reference/current/diagnose-unassigned-shards.html
- https://chat.openai.com/share/20856f8e-0b27-42ff-b046-8c29afac6c69
