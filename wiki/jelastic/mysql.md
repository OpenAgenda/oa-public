# Installation d'un cluster MySQL sur Jelastic Cloud

## Prérequis

 * Un compte sur jelastic cloud
 * Un certificat d'autorité de certification et la possibilité de générer des certificats vérifiés pour les adresses générées lors du déroulement de ce guide (voir la section concernant la supervision)

## Création d'un environement

Sur https://app.jpe.infomaniak.com/

### Groupe de serveurs MySQL

Lancer la création d'un nouvel environnement - en passant pas le bouton "nouvel environnement" - avec une base de données MySQL CE 8.x.x. Pas d'équilibrage, pas d'App Serveurs. En sélectionnant l'item MySQL choisi dans la topologie, sa configuration apparaitra dans le menu central.

La capacité en cloudlets doit être suffisante pour votre besoins. Des ajustements seront probablement nécessaires. Dans notre cas, nous choisissons une capacité fixe de 48 cloudlets par serveur, ce qui équivaut à 6G de RAM pour 19Ghz de capacité de calcul.

Cocher la case **Regroupement automatique**, choisir **Master-slave** ou **Master-master** comme schéma de regroupement et laisser **ProxySQL**.

Préciser les variables d'environnement `DB_USER` et `DB_PASS` pour définir pour définir les identifiants de l'utilisateur associé à la base de données. Le mot de passe devra faire au minimum 8 caractères sans quoi l'environnement ne sera pas correctement créé.

Une variable `DB_NAME` peut également être précisée. Elle sera utilisée lors de la mise en place de la sauvegarde automatisée

### ProxySQL

Ce groupe est automatiquement créé lorsque le regroupement automatique est choisi dans la configuration MySQL. Sa configuration est affichée sur un clic de l'item 'ProxySQL' de la partie gauche (topologie) du menu de création.

Les valeurs par défaut d'allocation de cloudlets est très limitée, une plus grand scalabilité verticale est utile pour éviter un emballement ponctuel des instances ProxySQL. Il est préférable de placer le max de cloudlets à 36 (par exemple)

Une IP publique doit être définie pour permettre un accès depuis l'exterieur de l'environnement. Nous en ajoutons une v4.

### Espace de stockage

De nouveau depuis le menu de topologie à gauche, en ouvrant l'item "Conteneurs de stockage", ajouter un conteneur de stockage (NFS) de 100Go pour la sauvegarde des backups automatisés.

De retour dans la configuration des serveurs MySQL, dans la configuration des volumes, éditer le volume `/var/lib/jelastic/backup` en choisissant le serveur NFS avec comme chemin distant `/data/backups`.

### Création et test

Choisir un nom d'environnement et lancer la création.

Pour résumer, la topologie de l'environnement comprend:

- 2 nœuds MySQL (Master-Slave)
- 2 nœuds ProxySQL pour la répartition des charges
- 1 nœud NFS pour le stockage des backups

L'ajout d'un outil de monitoring de la base de donnée est détaillé plus loin dans cette documentation.

Une fois l'installation terminée un email avec les informations de connexion est envoyé. Une fois l'email reçu, un premier test de connexion devient possible.

```
mysql -h proxy.env-1445653.jcloud-ver-jpe.ik-server.com -pVRsrRHy0449pGcVf50 -ujelastic-48749
```

[Documentation Jelastic](https://jelastic.com/blog/mysql-mariadb-database-auto-clustering-cloud-hosting/)

## Chargement de la base dans les noeuds

Les commandes sql via le client dans les bases primaires passent en replication: une instruction du type `mysql> create database NOMDELABASE;` conduira à la création d'une base oa sur les autres noeuds si la réplication est fonctionnelle. Ce n'est pas le cas avec le chargement d'un dump depuis le terminal de type `mysql -uLUTILISATEURDB -p NOMDELABASE < NOMDELABASE.dump`. Il faut donc lancer la commande du chargement de dump sur chacun des noeuds.

Commencer par charger le dump sur un des noeuds pour ensuite le copier dans le NFS. Le plus rapide est d'utiliser `sftp` pour charger le dump dans un des noeuds: `sftp -i cle ubuntu@serveurousetrouveledump`, de get le dump.

Une fois le dump récupéré, il peut être placé dans le NFS: `mv oa.dump /var/lib/jelastic/backup`

Avant de le charger dans le premier noeud (primaire/maitre), il faut se connecter sur un prompt mysql pour créer la base: `mysql> create database NOMDELABASE;`. Utile ensuite de se connecter sur le prompt mysql d'un noeud voisin pour vérifier que la base vide à bien été créée, sans quoi il y a un problème de réplication.

Puis, dans chaque noeud et en parallèle pour aller plus vite, charger le dump dans la base: `mysql -uLUTILISATEURDB -p NOMDELABASE < /var/lib/jelastic/backup/oa.dump`.

Ca va prendre un moment. Éviter le trop secouer les connections lors du chargement, les noeuds du cluster pour éviter que le chargement du dump se fasse de manière partielle. Si jamais le chargement n'est pas fait de manière complète, l'opération peut être relancée après un `mysql> drop database NOMDELABASE;` sur un noeud maitre. L'instruction passera par la réplication et la base sera supprimée sur les autres noeuds.

Une fois que la base est chargée sur tous les noeuds, un test de réplication ne peut pas nuire. Il suffit de se connecter sur le prompt mysql d'un noeud primaire et d'insérer out de mettre à jour une donnée:

`select id from form_schema order by id desc limit 1;` pour connaitre le dernier id

`insert into form_schema (store) values ('{}');` puis on a l'id de l'entrée.

On se connecte sur un autre noeud et on regarde si on a bien récupéré l'id qui vient d'être créé:

`select id from form_schema order by id desc limit 1;`

## Ajustements de configuration ProxySQL

### Sécurisation

Pour les données qui transitent sur le web il est important de chiffrer les données, il est donc nécessaire d'activer le SSL au moins pour la connexion à ProxySQL.

#### Activer le SSL

Pour éditer la variable `mysql-have_ssl` de la db de configuration:

```
mysql -h 127.0.0.1 -P6032 -uadmin -padmin
mysql> SET mysql-have_ssl = 1;
mysql> LOAD MYSQL VARIABLES TO RUNTIME;
mysql> SAVE MYSQL VARIABLES TO DISK;
mysql> PROXYSQL RESTART;
```

#### Désactiver les connexions non sécurisées

Pour empêcher de se connecter de manière non sécurisée, il faut de nouveau se connecter sur chaque instance de l'environnement "DB Load balancer" pour modifier une variable liée au compte utilisé pour la connexion. Sur un ssh de chaque instance ProxySQL, lancer la commande suivante:

```
mysql -h 127.0.0.1 -P6032 -uadmin -padmin
mysql> UPDATE mysql_users SET use_ssl=1;
mysql> LOAD MYSQL USERS TO RUNTIME;
mysql> SAVE MYSQL USERS TO DISK;
mysql> PROXYSQL RESTART;
```

La connexion non sécurisée est désormais non autorisée.

#### Pare-feu

Dans la section "pare-feu" des paramètres de l'environnement et dans la section "règles entrantes", une séries de ports sont ouverts par défaut pour chaque groupe.

Pour le groupe "Base de données SQL", toutes les règles peuvent être désactivées, à l'exception de la règle ciblant le port 3306. Cette dernière ne doit avoir pour source que le réseau local.

Pour le groupe "Conteneur de stockage", toutes les règles ne doivent cibler que le groupe "Base de données SQL"

Pour le groupe "ProxySQL", toutes les règles peuvent être désactivées, à l'exception de celle ciblant le port 3306. Cette dernière ne doît être accessible que par les IP hébergeant les service nécessitant un accès à la base de données.

#### Liens utiles

[SSL Configuration for frontends](https://github.com/sysown/proxysql/wiki/SSL-Support#ssl-configuration-for-frontends)
[ProxySQL users configuration](https://proxysql.com/documentation/users-configuration/)
[SSL at ProxySQL Part 1](https://proxysql.com/blog/ssl-at-proxysql-part1/)

## Backups automatisés

Sur un des serveurs MySQL esclaves, ajouter la ligne suivante dans le fichier `/var/spool/cron/mysql`:

```
0 1 * * * /var/lib/jelastic/bin/backup_script.sh -m dump -c 10 -u $DB_USER -p $DB_PASS -d $DB_NAME
```

## Supervision

La surveillance se fait avec [Percona Monitoring and Management](https://www.percona.com/doc/percona-monitoring-and-management/2.x/index.html).

### Modification de l'environement

Il faut d'abord changer la topologie de l'environnement et ajouter un nœud de type "Docker Engine CE" dans la catégorie "Services additionnels", avec:

- Une IP publique.
- Un volume (Fichier système local) vers `/var/lib/docker/volumes`
- Un volume (Fichier système local) vers `/var/lib/jelastic/keys/grafana`

Mettre à jour l'environnement pour noter l'url du noeud créé. Il prend la forme suivante:

```
node40971-oa-mysql.jcloud-ver-jpe.ik-server.com
node${nodeId}-${envName}.jcloud-ver-jpe.ik-server.com
```

Pour assurer une connexion sécurisée à l'outil de monitoring, il est nécessaire de générer une clé et un certificat correspondant à l'url du noeud. Ceci n'est pas couvert dans ce guide. Une fois généré, uploadez le certificat, la clé et le CA en les nommant respectivement `certificate.crt`, `certificate.key` et `ca-certs.pem` dans le dossier `/var/lib/jelastic/keys/grafana`.


En SSH sur ce container, nous allons installer `pmm-server` avec les commandes suivantes:

```bash
docker pull percona/pmm-server:2

docker create --volume /srv \
--name pmm-data percona/pmm-server:2 /bin/true

docker run --detach --restart always \
-p 80:80 -p 443:443 \
--volumes-from pmm-data \
-v /var/lib/jelastic/keys/grafana/certificate.crt:/srv/nginx/certificate.crt \
-v /var/lib/jelastic/keys/grafana/certificate.key:/srv/nginx/certificate.key \
-v /var/lib/jelastic/keys/grafana/ca-certs.pem:/srv/nginx/ca-certs.pem \
--name pmm-server \
percona/pmm-server:2
```

Et lancez les commandes suivantes pour activer le SSL et la redirection vers https:

```bash
docker exec -it pmm-server bash

# Dans le container:
sed -i '/location \/graph {/a \      if ($scheme = http) {\n        return 301 https://$host$request_uri;\n      }' /etc/nginx/conf.d/pmm.conf
sed -i '0,/cert_file/{s/\;cert_file =/cert_file = \/srv\/nginx\/certificate.crt/}' /etc/grafana/grafana.ini
sed -i '0,/cert_key/{s/\;cert_key =/cert_key = \/srv\/nginx\/certificate.key/}' /etc/grafana/grafana.ini

# Sortie du container
exit
```

Puis redémarrez le container

Vous pouvez maintenant accéder à l'interface via l'adresse `https://node${nodeId}-${envName}.jcloud-ver-jpe.ik-server.com`.

Les identifiants par défaut sont:

- identifiant: `admin`
- mot de passe: `admin`

La première connexion vous demande de changer votre mot de passe. Notez le mot de passe, cette documentation en fera référence par PMM_SERVER_PWD

### Installation de `pmm2-client`

Il faut commencer par donner les droits root aux instances MySQL en suivant la procédure suivante:

[Jelastic Cloud: lancer des commandes avec un accès root sur n'importe quel conteneur](https://www.infomaniak.com/fr/support/faq/2346/jelastic-cloud-lancer-des-commandes-avec-un-acces-root-sur-nimporte-quel-conteneur)

Il faut ensuite installer `pmm2-client` sur chaque instance MySQL, en SSH:

```
sudo yum install https://repo.percona.com/yum/percona-release-latest.noarch.rpm -y
sudo yum install pmm2-client -y
```

### Création de l'utilisateur MySQL

Sur chaque instance MySQL, en SSH, nous allons créer un utilisateur MySQL appelé `pmm-agent`, l'agent fait beaucoup de requêtes et ça nous permettra de filtrer les requêtes dans l'analyseur de requêtes:

Remplacer PMM_DB_USER_PWD par un mot de passe à utiliser pour ce nouvel utilisateur.

```
$> mysql -u${DB_USER} -p${DB_PASS}
mysql> CREATE USER 'pmm-agent'@'127.0.0.1' IDENTIFIED WITH mysql_native_password BY 'PMM_DB_USER_PWD';
mysql> GRANT ALL ON *.* TO 'pmm-agent'@'127.0.0.1';
```

### Optimisation des remontées de logs

Toujours sur chaque instance MySQL:

```
$> mysql -u${DB_USER} -p${DB_PASS}
mysql> SET GLOBAL slow_query_log = 1; SET PERSIST slow_query_log = 1;
mysql> SET long_query_time = 0; SET GLOBAL long_query_time = 0; SET PERSIST long_query_time = 0;
mysql> SET GLOBAL log_slow_extra = 1; SET PERSIST log_slow_extra = 1;
mysql> SET GLOBAL log_queries_not_using_indexes = 1; SET PERSIST log_queries_not_using_indexes = 1;
mysql> SET GLOBAL log_throttle_queries_not_using_indexes = 100; SET PERSIST log_throttle_queries_not_using_indexes = 100;
```

### Connexion des agents au serveur

Sur chaque instance MySQL, éxecutez les commandes suivantes en remplacant les mots clés suivants par les valeurs choisies précédemment:

 * ${IP_PMM}: l'ip privée du noeud contenant le superviseur pmm
 * ${DB_NODE_IP}: l'ip du noeud mysql édité
 * ${DB_NODE_ID}: l'identifant du noeud

 * ${PMM_SERVER_PWD}: le mot de passe choisi lors de la première connexion au superviseur
 * ${PMM_DB_USER_PWD}: le mot de passe choisi lors de la creation de l'utilisateur MySQL pour le superviseur: pmm-agent

```
sudo pmm-admin config --server-insecure-tls --server-url=https://admin:${PMM_SERVER_PWD}@${IP_PMM}:443 --force ${DB_NODE_IP} generic mysql-${DB_NODE_ID}
pmm-admin register --server-insecure-tls  --server-url=https://admin:${PMM_SERVER_PWD}@${IP_PMM}:443 --force ${DB_NODE_IP}
pmm-admin add mysql --query-source=slowlog --username=pmm-agent --password=${PMM_DB_USER_PWD} mysql-${DB_NODE_ID}-slowlog 127.0.0.1:3306
```

### Pare-feu

Pour que le superviseur puisse se connecter aux agents, une règle entrante doit être ajoutée au pare-feu de l'environnement:

 * Noeud: Base de données SQL
 * Nom: Percona PMM Ports
 * Protocole: TCP/UDP
 * Plage de ports: 42000-42005
 * Source: Noeuds d'environnement
 * Noeuds associés: (Le noeud contenant le superviseur)
 * Priorité: 1050
 * Action: autoriser

Pour le conteneur hébergeant le superviseur, seul le port https peut-être maintenu activé.


### Test & chargement d'un panneau préconfiguré

Pour vérifier que le superviseur accède bien aux agents installés, une liste des agents avec leurs statuts est disponible ici:

    https://node${PMM_NODE_ID}-${JELASTIC_ENV_NAME}.jcloud-ver-jpe.ik-server.com/prometheus/targets

Si une configuration d'un panneau est disponible au format JSON, celle-ci peut être chargée via l'icone "Dashboards" puis "Manage".

## Utilisation de certificats

### Configuration

Dans l'éventualité où une connexion avec certificat était nécessaire, il est possible à partir d'une autorité de certification de générer un certificat et une clé à charger dans les instances ProxySQL.

Le certificat doit être généré avec un Common Name (CN) correspondant à l'url du groupe de proxy (préfixe 'proxy.' avant l'url de l'environnement général).

Le certificat autorité (ca.pem) ainsi que la paire certificat (cert.pem) / clé (key.pem) générée doivent alors être placés dans chaque instance ProxySQL, en remplacement des fichiers présents dans le dossier `/var/lib/proxysql`: `proxysql-ca.pem`, `proxysql-cert.pem` et `proxysql-key.pem`.

Une fois chargés, les instances ProxySQL doivent être redémarrées.

### Renouvellement

Pour mettre à jour les certificats ProxySQL sans interruption de service, vous pouvez suivre les étapes générales suivantes :

Générer de nouveaux certificats : Générez de nouveaux certificats pour les points de terminaison SSL/TLS que vous souhaitez mettre à jour. Le certificat doit être généré avec un Common Name (CN) correspondant à l'url du groupe de proxy (préfixe 'proxy.' avant l'url de l'environnement général).

Installer les nouveaux certificats : Installez les nouveaux certificats sur les serveurs qui fournissent les points de terminaison SSL/TLS, dans le même dossier et avec le même nom que précisé dans la section précédente. Placer dans `/var/lib/proxysql` les nouveaux certificats `proxysql-cert.pem` et `proxysql-key.pem`.

Activer le ssl si ce n'est pas déjà fait:
    UPDATE mysql_servers SET use_ssl=1 WHERE port=3306;
    LOAD MYSQL SERVERS TO RUNTIME;  
    SAVE MYSQL SERVERS TO DISK;

Mettre à jour les chemin pointant vers les certificats:

SET mysql-ssl_p2s_cert="/var/lib/proxysql/proxysql-cert.pem";
SET mysql-ssl_p2s_key="/var/lib/proxysql/proxysql-key.pem";
SET mysql-ssl_p2s_ca="/var/lib/proxysql/proxysql-ca.pem";
SET mysql-ssl_p2s_cipher='ECDHE-RSA-AES256-SHA';

Pour vérifier que les valeurs sont bien chargées:
SELECT * FROM global_variables WHERE variable_name LIKE 'mysql%ssl%';

LOAD MYSQL VARIABLES TO RUNTIME;
SAVE MYSQL VARIABLES TO DISK;

Tester la nouvelle configuration : Testez la nouvelle configuration pour vous assurer qu'elle fonctionne comme prévu.

Échanger les anciens certificats avec les nouveaux : Enfin, échangez les anciens certificats avec les nouveaux. Cela peut être fait un serveur à la fois, chaque serveur étant mis à jour, testé, puis échangé avant de passer au serveur suivant. Cela garantira qu'il n'y a pas d'interruption de service pendant le processus de mise à jour des certificats.