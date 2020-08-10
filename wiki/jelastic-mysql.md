# Installation d'un cluster MySQL sur Jelastic Cloud

## Prérequis

 * Un compte sur jelastic cloud

## Création d'un environement

Sur https://app.jpe.infomaniak.com/

Lancer la création d'un nouvel environnement à partir de l'URL suivante en laissant les options par défaut:
https://github.com/jelastic-jps/mysql-cluster/blob/master/manifest.jps

Selectionner depuis le marketplace Jelastic le Cluster MySQL/MariaDB, dans le menu, inclure ProxySQL, et prendre MySQL CE.

L'installation comprend:

- 2 nœuds MySQL (Master-Slave)
- 2 nœuds ProxySQL pour la répartition des charges

Un fois l'installation terminée un email avec les informations de connexion sera envoyé.

Il faut ensuite modifier la topologie de l'environement et ajouter une IP publique à ProxySQL, sans ça la base de données n'est pas accessible depuis l'extérieur.

A ce stade, il est possible de se connecter avec un client en non-sécurisé:

    mysql -h proxy.env-1445653.jcloud-ver-jpe.ik-server.com -pVRsrRHy0449pGcVf50 -ujelastic-48749

Pour plus d'informations: https://jelastic.com/blog/mysql-mariadb-database-auto-clustering-cloud-hosting/

## Sécurisation

Pour les données qui transitent sur le web il est important de chiffrer les données, il est donc nécessaire d'activer le SSL au moins pour la connexion à ProxySQL.

### Activer le SSL

Se connecter SSH sur chaque serveur "DB Load balancer" ProxySSL, pour éditer la variable "mysql-have_ssl" de la db de configuration:

```
$> mysql -h 127.0.0.1 -P6032 -uadmin -padmin
mysql> SET mysql-have_ssl = 1;
mysql> LOAD MYSQL VARIABLES TO RUNTIME;
mysql> SAVE MYSQL VARIABLES TO DISK;
```

Les certificats à utiliser pour la connexion depuis le client sont dans le dossier `/var/lib/proxysql`. Ils sont automatiquement générés et sont différents sur chaque instance de DB Load balancer. Copier le contenu des fichiers `proxysql-ca.pem`, `proxysql-cert.pem` et `proxysql-key.pem` de la première instance ProxySQL pour les placer dans les autres.

Les instances ProxySQL où ont été placés les certificats de l'instance de référence doivent être redémarrées.

Les certificats doivent être également présents sur la machine d'où se fait la connexion sécurisée (l'ordi de dev par ex):

    mysql -h proxy.env-1445653.jcloud-ver-jpe.ik-server.com -pVRsrRHy0449pGcVf50 -ujelastic-48749 --ssl-ca=/cheminvers/ca.pem --ssl-cert=/cheminvers/cert.pem --ssl-key=/cheminvers/key.pem

Il est désormais possible de se connecter de manière sécurisée au cluster

### Désactiver les connexions non sécurisées

Pour empecher de se connecter de manière non sécurisée, il faut de nouveau se connecter sur chaque instance de l'environnement "DB Load balancer" pour modifier une variable liée au compte utilisé pour la connexion. Sur un ssh de chaque instance ProxySQL, après une connexion au mysql de configuration (`$> mysql -h 127.0.0.1 -P6032 -uadmin -padmin`), lancer les commandes suivantes:

```
update mysql_users set use_ssl=1;
LOAD MYSQL USERS TO RUNTIME;
SAVE MYSQL USERS TO DISK;
```

La connexion non sécurisée est désormais non autorisée

### Liens utiles

[SSL Configuration for frontends](https://github.com/sysown/proxysql/wiki/SSL-Support#ssl-configuration-for-frontends)
[ProxySQL users configuration](https://proxysql.com/documentation/users-configuration/)
[https://proxysql.com/blog/ssl-at-proxysql-part1/](SSL at ProxySQL Part 1)

## Backups automatisés

Pour stocker vos backups de manière permanente vous devez modifier la topologie de l'environement pour y ajouter un conteneur de stockage (NFS, au même niveau que le conteneur ProxySQL dans le diagramme de la topologie)

Sur un des serveurs Mysql esclaves, vous devez ajouter un point de montage via le menu de configuration du serveur (comme sur l'image suivante):

![jelastic-mysql-backup-mountpoint](./images/jelastic-mysql-backup-mountpoint.png)

Dans la section "Points de montage/Répertoire", cliquer sur "Monter" puis:

 * préciser `/var/lib/jelastic/backup` comme chemin pour le montage
 * choisir le conteneur de données "Extra storage NFS" créé dans la topologie
 * préciser un chemin d'accès distant: `/data/backups`

Toujours sur le serveur MySQL esclave, ajouter la ligne suivante dans le fichier `/var/spool/cron/mysql` en remplaçant `USER` et `PASSWORD`:

```
0 1 * * * /var/lib/jelastic/bin/backup_script.sh -m dump -c 10 -u USER -p PASSWORD -d oa
```
