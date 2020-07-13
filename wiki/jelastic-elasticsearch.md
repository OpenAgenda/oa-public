# Installation d'un cluster Elasticsearch sur Jelastic Cloud

## Prérequis

 * Un compte sur jelastic cloud
 * Le certificat d'une autorité de certification est requis. Elle sert à l'authentification des connexions sur le cluster une fois celui-ci déployé. Avoir un certificat client d'installé sur son navigateur sera utile également pour vérifier que le cluster reste bien accessible une fois la sécurisation faite.
 * Une image sur docker hub pour lancer un noeud elasticsearch, à `openagenda/jelastic-elasticsearch`

## Vérifier la disponibilité de l'image sur Docker Hub

Une image sert

## Création d'un environnement

Sur https://app.jpe.infomaniak.com/

Lancer la création d'un nouvel environnement. Avec:

 * Un équilibrage nginx 1.16.1
 * Des serveurs d'applications à partir de l'image `openagenda/jelastic-elasticsearch`

L'option ssl qui chapotte doit rester désactivée. Nous utiliserons le composant letsencrypt pour sécurisé un accès via un domaine défini sur le DNS principal d'OpenAgenda.

Une fois l'équilibrage et les serveurs d'application configurés, choisir un nom d'environnement et lancer la création.

### Configuration de l'équilibrage

Laisser la configuration proposée (1 à 4 cloudlets en scalabilité horizontale)

### Configuration des serveurs d'application

On utilise un scalabilité horizontale. Il n'est pas utile de définir une fourchette pour un même noeud. On peut partir sur une configuration non ajustable avec 4 gigas de ram. (32 cloudlets au moment de l'écriture de ce guide).

#### Variables d'environnement

[La documentation officielle d'elasticsearch](https://www.elastic.co/guide/en/elasticsearch/reference/current/heap-size.html) conseille de ne pas assigner plus de 50% de la valeur de la mémoire vive d'un serveur au paramètre min et max de la heap java.. et que ce n'est pas utile de mettre plus de 32gb. Pour un noeud qui dispose de 4 gigas, il faut donc mettre:

     ES_JAVA_OPTS: -Xms2g -Xmx2g

Le répartiteur de charge s'autoconfigure au fil de l'ajout et de la suppression de noeuds. Il faut quand même expliciter le port vers lequel il redirige les requêtes s'il est autre que le port 80. [Une variable d'environnement doit être précisée](https://docs.jelastic.com/container-ports/):

    JELASTIC_EXPOSE: 9200

Dans la configuration d'un noeud elasticsearch, une liste d'IP est donnée pour que le noeud puisse se signaler un un noeud 'master' et rejoindre le cluster. L'image `openagenda/jelastic-elasticsearch` liste le noeud donnée par la variable jelastic `MASTER_IP` mais permet également de préciser plus d'IP. C'est utile de désigner plusieurs IP lorsque le cluster comporte plusieurs noeuds pour le rendre plus résilient. Mais pour démarrer, la variable d'environnement servant à préciser ces IP additionnelles peut être laissée vide. Elle doit être définie:

    OTHER_SEED_HOSTS:

## Routage, accès non sécurisé

Une fois l'environnement créé, on reporte son adresse dans une entrée CNAME du fichier de zone, avec en face un sous domaine qui va bien.

`es7.openagenda.com` ça va bien

Mettre dans en CNAME l'adresse jelastic (ressemble à `elasticsearch.jcloud-ver-jpe.ik-server.com`)

Puis ouvrir les paramètres de l'environnement et préciser le domaine choisi dans la section "Domaines personnalisés"

A ce stade, le cluster de 1 noeud devrait être disponible en non sécurisé:

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

### https

Ouvrir le menu `Add-ons` sur la section répartiteur/équilibrage de l'environnement, puis l'item "Let's Encrypt", saisir le domaine choisi (es7.openagenda.com) et enregistrer. La configuration de l'environnement va alors prendre quelques minutes.

Ca suffit pour rendre le cluster accessible en https.

### Authentification client

La génération d'une autorité de certification n'est pas détaillée dans ce guide. Avoir son certificat est un prérequis. Avoir un certificat client correspondant l'est aussi.

Définir un volume local au niveau du répartiteur de charge pour un dossier qui contiendra le certificat "autorité": `/etc/nginx/certs`

Y placer le certificat de l'autorité: `/etc/nginx/certs/auth.pem`.

Editer le fichier `/etc/nginx/conf.d/ssl.conf` et y placer la configuration qui activera la vérification client et la référence au certificat de l'autorité à utiliser:

    ssl_verify_client on;
    ssl_client_certificate /etc/nginx/certs/auth.pem;

Redémarrer le répartiteur, une connection en https nécessitera désormais un certificat client. Si celui-ci est installé sur un navigateur, la connexion demandera une confirmation de selection du certificat client avant d'accéder au cluster en https.

### Fermeture des accès non sécurisés

Ouvrir la section `Paramètres` de l'environnement puis la sous-section `Pare-feu`. Dans les règles entrantes, ne laisser que `ssh` et `https`.

## Vérifications

### Ajout d'un noeud

Le noeud configuré devrait être visible ici: `https://es7.openagenda.com/_cat/nodes?format=json`

Ouvrir la topologie de l'environnement et cliquer sur `+1` dans la section de redimmensionnement horizontal (mode non dynamique). Enregistrer, laisser mijoter. Le nouveau noeud doit apparaitre:

1. ici: https://es7.openagenda.com/_cat/nodes?format=json
2. Et dans le fichier `/etc/nginx/nginx-jelastic.conf` sous la clause `upstream common`



## Liens utiles

 * [Variables d'environnement Jelastic](https://docs.jelastic.com/environment-variables)
