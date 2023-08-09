# Guide d'installation sur Jelastic

Je voudrais tester: un cluster db de dev lowcost (peu de cloudlets mini), idem pour elasticsearch

Pour avoir une installation complète d'OpenAgenda sur jelastic il faut:

 * Le cluster MySQL
 * Un cluster elasticsearch: voir jelastic/elasticsearch.md (variante locale)
 * Un cluster redis
 * Deux environnements pour les serveurs web
 * Un environnement pour les serveurs de tâche
 * Un environnement Traffic Distributor pour la bascule lors des mises en production
 * Un environnement pour l'application de mise en production et les outils d'administration

## Le cluster MySQL

Le détail de l'installation et de la configuration du cluster est donné dans `mysql.md`.

## Le Traffic Distributor

En production, 2 environnements web identiques sont prêts. L'un est actif, l'autre est en attente de la prochaine mise à jour. Le distributeur oriente les requêtes entrante vers l'environnement actif. Lorsqu'une mise à jour est faite, un menu UI permet de basculer les requêtes vers l'environnement venant d'être mis à jour. La documentation: https://www.virtuozzo.com/application-platform-docs/traffic-distributor/

Il gère aussi le décryptage/encryptage des requêtes https: c'est donc là que sont placés les certificats pour le site ainsi que pour l'API.

### Faire une bascule après une mise à jour

La bascule se fait via l'outil "Traffic Distributor" affiché dans la liste des add-ons du groupe noeuds "nginx" de l'environnement Traffic distributor (à coté du add on Lets Encrypt, non utilisé pour la prod).

En cliquant sur "Configure", on voit apparaitre le menu permettant la bascule d'un environnement à l'autre. Il suffit d'appliquer un ratio à 100 sur l'environnement cible de la mise en production et d'appliquer.

### Configuration

**Important**: On a constaté qu'il n'était pas fonctionnel tant que les configurations 'reuse' n'étaient pas commentées. Tant que ce n'est pas fait, les requêtes en post lancent des exceptions nginx.

Dans `conf.d/ssl.conf`, il faut donc commenter les lignes correspondant à IPv6:

```
  listen       443 http2 ssl;
  listen       [::]:443 http2 ssl;
  #listen       443 quic reuseport;
  #listen       [::]:443 quic reuseport;
  server_name  _;
```

La configuration d'un mode maintenance est détaillée dans `maintenance.md`

## Le cluster Redis

Il sert pour la cache serveur et pour les traitements de tâches mises en file d'attente.

La configuration est détaillée dans `redis.md`

## Les environnement web

Comportent un serveur http qui reçoit les requêtes et les transfère vers les sous-noeuds qui doivent les traiter. Il y en a 3:

 * API: contient les noeuds qui traitent les requêtes API
 * Web: contient les noeuds qui traitent les requêtes non-next (cibul-node)
 * Next: voilà.

Les process node dans chaque sous groupe sont gérés par pm2 en mode cluster. Par défaut, ce sont 4 process qui sont lancés par noeud. Mais selon la charge et le nombre de core de disponibles, il peut être utile d'adapter ce nombre. Les commandes utiles:

`nproc`: pour connaitre le nombre de cores de disponibles sur un noeud
`pm2 scale server +2`: pour ajouter 2 process à l'application "server" (Nom de l'application pour les sous-groupes "web" et "api". Pour le sous-groupe "next", l'application s'appelle "next")

Ce n'est à priori pas dramatique s'il y a plus de process que de noeuds. Ce qu'on veut éviter c'est d'en avoir moins pour ne pas sous-utiliser les ressources du noeud.

## Mise en production & Administration

Cet environnement héberge plusieurs outils d'administration de la plateforme:

 * Le script de mise à jour de l'application
 * PHPMyAdmin (sur le même sous groupe)
 * proxy pour P3X (outil de monitoring de cluster redis)
 * pmm2 (monitoring des performances de la base de données)
 * ElasticHQ pour surveiller le cluster elasticsearch

### Mise en production

Les variables d'environnement qui seront chargées sur les noeuds applicatifs sont distribuées dans des fichiers dans le dossier home du noeud de MEP. Elles sont jointes pour générer un fichier de config pour pm2 qui sera installé sur les noeuds web et de tâche:

 * `ENV_FILE_PATH`: pointe vers le json listant les variables en commun
 * `LOCAL_ENV_FILE_PATH`: point vers le json des variables particulières

Si la mise en production n'est pas en phase de test, les 3 variables suivantes sont lues par le script et doivent prendre les valeurs suivantes:

 * `NODE_ENV`: `production`
 * `CI`: `1`
 * `CDN`: `1`

Pour lancer une mise en prod, il faut `ssh` sur le serveur de mep et lancer la commande `run.sh`. Il y a 2 environnements web, la mise en prod vise l'environnement qui ne reçoit pas de traffic. Leur noms découlent de la manière dont ils sont présenter sur le menu de bascule du distributeur: bleu et orange.

PHPMyAdmin est également installé sur ce serveur. La procédure d'installation est détaillée dans phpmyadmin.md

### ElasticHQ

Une installation de python sur le noeud d'admin est nécessaire. Le guide d'installation est ici: http://docs.elastichq.org/installation.html#install-from-source

La commande suivante permet de vérifier la présence de Python 3.4+: `python3 -V`

On a besoin de pip aussi `sudo apt install -y python3-pip`