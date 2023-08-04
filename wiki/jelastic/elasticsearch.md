# Installation d'un cluster Elasticsearch sur Jelastic Cloud

Voici une procédure permettent de déployer un cluster Elasticsearch sur Jelastic pour les besoins d'OpenAgenda: elle s'appuie d'une image docker d'Elasticsearch, complétée d'un plugin maintenu par OpenDataSoft permettant de gérer des agrégations de points sur des cartes.

La dernière partie de la procédure concerne la sécurisation de l'environnement: elle est utile si le cluster doit être accessible depuis Internet. Mais elle ajoute de la complexité: il faut gérer les certificats et leur renouvellement. Elle est beaucoup moins utile si les accès se font depuis des serveurs (web ou de tâche) sur le même réseau local.

La sécurisation se fait via l'utilisation d'un flux https ET via une authentification des clients se connectant au cluster par des certificats.

## Prérequis

 * Un compte sur jelastic cloud
 * Une image sur docker hub pour lancer un noeud elasticsearch, à `openagenda/jelastic-elasticsearch`. (Pour info: le Dockerfile à l'origine de cette image est dans le monorepo, dossier docker/elasticsearch.)

Et pour un cluster sécurisé:

* Le certificat d'une autorité de certification est requis. Elle sert à l'authentification des connexions sur le cluster une fois celui-ci déployé. Avoir un certificat client d'installé sur son navigateur sera utile également pour vérifier que le cluster reste bien accessible une fois la sécurisation faite.

## Vérifier la disponibilité de l'image sur Docker Hub

Elle devrait être ici: https://hub.docker.com/repository/docker/openagenda/jelastic-elasticsearch
Elle ajoute à l'image elasticsearch [un plugin dévelopé par OpenDataSoft](https://github.com/opendatasoft/elasticsearch-aggregation-geoclustering) pour permettre l'affichage d'agrégats de points géographiques.

## Initialisation de l'environnement

Sur https://app.jpe.infomaniak.com/

Lancer la création d'un nouvel environnement. Avec:

 * Un équilibrage nginx 1.18.0: laisser la configuration proposée (1 à 4 cloudlets en scalabilité horizontale). Désactiver le SLB.
 * Des serveurs d'applications à partir de l'image docker `openagenda/jelastic-elasticsearch`: on utilise une scalabilité horizontale. Il n'est pas utile de définir une fourchette pour un même noeud. On peut partir sur une configuration non ajustable avec 4 gigas de ram. (32 cloudlets au moment de l'écriture de ce guide). Désactiver le SLB.

L'option ssl qui chapotte l'environnement doit rester désactivée.

Les variables d'environnement:

 * **ES_JAVA_OPTS: -Xms2g -Xmx2g**: [La documentation officielle d'elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/heap-size.html) conseille de ne pas assigner plus de 50% de la valeur de la mémoire vive d'un serveur au paramètre min et max de la heap java.. et que ce n'est pas utile de mettre plus de 32gb. Pour un noeud qui dispose de 4 gigas, il faut donc mettre *-Xms2g -Xmx2g*
 * **JELASTIC_EXPOSE: 9200**: Le répartiteur de charge s'autoconfigure au fil de l'ajout et de la suppression de noeuds. Il faut quand même expliciter le port vers lequel il redirige les requêtes s'il est autre que le port 80. [Une variable d'environnement doit être précisée](https://docs.jelastic.com/container-ports/)
 * **OTHER_SEED_HOSTS: ' '**: Dans la configuration d'un noeud elasticsearch, une liste d'IP est donnée pour que le noeud puisse se signaler à un noeud 'master' et rejoindre le cluster. L'image `openagenda/jelastic-elasticsearch` liste le noeud donnée par la variable jelastic `MASTER_IP` mais permet également de préciser plus d'IP. C'est utile de désigner plusieurs IP lorsque le cluster comporte plusieurs noeuds pour le rendre plus résilient. Jelastic ne permet pas de rien préciser. Alors on remet la valeur déjà définie dans MASTER_IP, séparée au début par une virgule. Exemple: `, 10.101.14.92`

Une fois l'équilibrage, le(s) serveur(s) d'application et le variables d'environnement configurés, choisir un nom d'environnement et lancer la création.

Laisser mijoter quelques minutes et tenter de faire un appel sur l'environnement depuis le navigateur (l'environnement à un url ressemblant à http://elasticsearch.jcloud-ver-jpe.ik-server.com):

```
{

    "name": "node39281-elasticsearch.jcloud-ver-jpe.ik-server.com",
    "cluster_name": "oa",
    "cluster_uuid": "ypsi8BhaTP2dT4EcDRcrHw",
    "version": {
        "number": "7.5.0",
        "build_flavor": "default",
        "build_type": "docker",
        "build_hash": "e9ccaed468e2fac2275a3761849cbee64b39519f",
        "build_date": "2019-11-26T01:06:52.518245Z",
        "build_snapshot": false,
        "lucene_version": "8.3.0",
        "minimum_wire_compatibility_version": "6.8.0",
        "minimum_index_compatibility_version": "6.0.0-beta1"
    },
    "tagline": "You Know, for Search"

}
```



## Routage

### Accès depuis un domaine personnalisé

Si le cluster doit être accessible depuis internet en sécurisé, il peut l'être via un domaine/sous-domaine particulier. Par exemple: `es7.openagenda.com`. Définir dans le fichier de zone du DNS gérant le domaine une entrée CNAME pointant vers l'adresse de l'environnement (ressemble à `elasticsearch.jcloud-ver-jpe.ik-server.com`).

Ouvrir les paramètres de l'environnement et préciser le domaine choisi dans la section "Domaines personnalisés".

A ce stade, le cluster de 1 noeud devrait être disponible en non sécurisé sur le domaine choisi. Un `curl -XGET http://es7.openagenda.com

```
{

    "name": "node39281-elasticsearch.jcloud-ver-jpe.ik-server.com",
    "cluster_name": "oa",
    "cluster_uuid": "ypsi8BhaTP2dT4EcDRcrHw",
    "version": {
        "number": "7.5.0",
        "build_flavor": "default",
        "build_type": "docker",
        "build_hash": "e9ccaed468e2fac2275a3761849cbee64b39519f",
        "build_date": "2019-11-26T01:06:52.518245Z",
        "build_snapshot": false,
        "lucene_version": "8.3.0",
        "minimum_wire_compatibility_version": "6.8.0",
        "minimum_index_compatibility_version": "6.0.0-beta1"
    },
    "tagline": "You Know, for Search"

}
```

## Sécurisation

La procédure présente 2 variantes à partir d'ici. La première concerne le cluster disponible en non-sécurisé mais seulement sur le réseau local. Pour rendre le cluster accessible depuis internet en https avec une authentification par certificats, passer directement à la section suivante

### Cluster en réseau local

Il faut limiter l'accès au cluster aux environnements en ayant besoin. Dans les paramètres de l'environnement (icône clé a molette engrenage jaune), ouvrir les paramètres pare-feu et en éditer les règles entrantes. Il faut tout désactiver et ne garder que la règle "Allow HTTP" en ne permettant que les connections en provenance des environnements devant accéder au cluster.

### Cluster accessible depuis internet

#### https

Ouvrir le menu `Add-ons` sur la section répartiteur/équilibrage de l'environnement, puis l'item "Let's Encrypt", saisir le domaine choisi (es7.openagenda.com) et enregistrer. La configuration de l'environnement va alors prendre quelques minutes.

Ca suffit pour rendre le cluster accessible en https.

#### Authentification client

La génération d'une autorité de certification n'est pas détaillée dans ce guide. Avoir son certificat est un prérequis. Avoir un certificat client correspondant l'est aussi.

Définir un volume local au niveau du répartiteur de charge pour un dossier qui contiendra le certificat "autorité": `/etc/nginx/certs`

Y placer le certificat de l'autorité: `/etc/nginx/certs/auth.pem`.

Editer le fichier `/etc/nginx/conf.d/ssl.conf` et y placer la configuration qui activera la vérification client et la référence au certificat de l'autorité à utiliser:

    ssl_verify_client on;
    ssl_client_certificate /etc/nginx/certs/auth.pem;

Redémarrer le répartiteur, une connection en https nécessitera désormais un certificat client. Si celui-ci est installé sur un navigateur, la connexion demandera une confirmation de selection du certificat client avant d'accéder au cluster en https.

#### Fermeture des accès non sécurisés

Ouvrir la section `Paramètres` de l'environnement puis la sous-section `Pare-feu`. Dans les règles entrantes, ne laisser que `ssh` et `https`.

## Vérifications

### Ajout d'un noeud

Le noeud configuré devrait être visible ici: `https://es7.openagenda.com/_cat/nodes?format=json`

Ouvrir la topologie de l'environnement et cliquer sur `+1` dans la section de redimmensionnement horizontal (mode non dynamique). Enregistrer, laisser mijoter. Le nouveau noeud doit apparaitre:

1. ici: https://es7.openagenda.com/_cat/nodes?format=json
2. Et dans le fichier `/etc/nginx/nginx-jelastic.conf` sous la clause `upstream common`

## Configuration au lancement

2 noeuds ça parait bien

## Ajouter un noeud

Avant d'ajouter un noeud (un serveur/container), il faut comprendre la notion elasticsearch de "shard". Un cluster elasticsearch héberge plusieurs index, chaque index est découpé en un nombre prédéfini de shards. Chaque shard contient une tranche des documents de l'index. Le nombre de shards d'un index est défini à sa création. Par exemple, l'index "agendas" est composé de 1 shard, l'index events en comporte 5.

Chaque shard peut être associé à un ou plusieurs réplicats. Les réplicats sont également définits à l'initialisation mais peuvent être redéfinis une fois l'index créé sans interruption de service. L'interface d'administration `/supervisor/elasticsearch` affiche un controle qui permet d'incrémenter ou de décrémenter le nombre de réplicats.

Quand on ajoute un noeud et qu'il est intégré au cluster (ça se fait en utilisant l'action de scalabilité horizontale "+1" sur l'UI), le cluster repartit équitablement les shards et réplicats parmis les noeuds disponibles, jusqu'à arriver à une distribution optimale. Si le nombre de noeuds dépasse le nombre de shards+réplicats, certains noeuds seront inutilisés tant que le nombre de réplicats n'aura pas été incrémenté.

## Retirer un noeud

Ne pas en retirer plusieurs d'un coup. Après le retrait d'un noeud, le cluster répartit de nouveau les shards & réplicats parmi les noeuds restants. Il lui faut quelques minutes. Moins d'un quart d'heure.

Si un noeud est retiré sans autres instruction au préalable, le cluster passe sur un état orange: il doit promouvoir des réplicats en shard "primaires" selon ce qui se trouvait au niveau du noeud retiré (c-à-d s'il contenait des shards primaires). Une manière plus soft de retirer un noeud consiste à mettre à jour la configuration du cluster en listant le noeud à exclure (le dernier dans le sous-groupe sera retiré au moment du clic sur "-1")

curl -XPUT http://localhost:9200/_cluster/settings -H 'Content-Type: application/json' -d '{"transient" : {"cluster.routing.allocation.exclude._ip" : "10.101.21.84"}}'

Le noeud exclu va perdre sa charge, il peut être alors retiré et l'état du cluster reste au vert. Une fois le noeud retiré, la liste d'exclusion peut-être réinitialisée. Si l'IP venait à être réassociée à un noeud au moment de sa création, il ne serait pas intégré au cluster.

## Quelques routes utiles:

 * Lister les shards: `/_cat/shards?format=json`
 * Avoir un résumé de l'état du cluster: `_cluster/health?pretty=true`


## Liens utiles

 * [Variables d'environnement Jelastic](https://docs.jelastic.com/environment-variables)
 * [Retirer un noeud](https://medium.com/@sanyamkj/removing-a-node-from-a-elasticsearch-cluster-gracefully-6122d00faf9) et [ici](https://docs.oracle.com/cd/E92519_02/pt856pbr3/eng/pt/tpst/task_RemovingANodeFromACluster.html?pli=ul_d46e43_tpst)
