# Installation d'un cluster MySQL sur Jelastic Cloud

## Prérequis

 * Un compte sur jelastic cloud

## Création d'un environement

Sur https://app.jpe.infomaniak.com/

Lancer la création d'un nouvel environnement avec une base de données MySQL.

Cocher la case **Regroupement automatique**, choisir **Master-slave** comme schéma de regroupement et laisser **ProxySQL**.

Dans la partie **MySQL** il est pas possible de définir des variables d'environement **DB_USER** et **DB_PASS** pour définir les identifiants de connexion de votre choix.

Dans la partie **ProxySQL**, il faut ajouter une adresse publique IPv4 pour pouvoir accéder à la base de données depuis l'exterieur de l'environement.

Ajouter un conteneur de stockage (NFS) de 100Go pour la sauvegarde des backups automatisés.

Dans les volumes de MySQL, éditer le volume `/var/lib/jelastic/backup` en choisissant le serveur NFS avec comme chemin distant `/data/backups`.

Choisir un nom d'environnement et lancer la création.

Selectionner depuis le marketplace Jelastic le Cluster MySQL/MariaDB, dans le menu, inclure ProxySQL, et prendre MySQL CE.

L'installation comprend:

- 2 nœuds MySQL (Master-Slave)
- 2 nœuds ProxySQL pour la répartition des charges
- 1 nœud NFS pour le stockage des backups

Un fois l'installation terminée un email avec les informations de connexion vous sera envoyé.

A ce stade, il est possible de se connecter avec un client en non-sécurisé:

```
mysql -h proxy.env-1445653.jcloud-ver-jpe.ik-server.com -pVRsrRHy0449pGcVf50 -ujelastic-48749
```

Pour plus d'informations: https://jelastic.com/blog/mysql-mariadb-database-auto-clustering-cloud-hosting/

### Maintien des connexions TCP en vie

Par défaut les connexions TCP ont une durée de vie limitée lorsqu'elles sont inactives, ce qui conduit à des erreurs `ECONNRESET` après 15 minutes d'inactivité (par défaut), pour corriger ce problème il faut activer l'option `KeepAlive`.

Sur chaque serveur "DB Load balancer" ProxySSL, exécutez la commande suivante:

```
mysql -h 127.0.0.1 -P6032 -uadmin -padmin -e 'SET mysql-use_tcp_keepalive = 1; SET mysql-tcp_keepalive_time = 20; LOAD MYSQL VARIABLES TO RUNTIME; SAVE MYSQL VARIABLES TO DISK; PROXYSQL RESTART;'
```

## Sécurisation

Pour les données qui transitent sur le web il est important de chiffrer les données, il est donc nécessaire d'activer le SSL au moins pour la connexion à ProxySQL.

### Activer le SSL

Pour éditer la variable `mysql-have_ssl` de la db de configuration:

```
mysql -h 127.0.0.1 -P6032 -uadmin -padmin -e 'SET mysql-have_ssl = 1; LOAD MYSQL VARIABLES TO RUNTIME; SAVE MYSQL VARIABLES TO DISK; PROXYSQL RESTART;'
```

Les certificats à utiliser pour la connexion depuis le client sont dans le dossier `/var/lib/proxysql`. Ils sont automatiquement générés et sont différents sur chaque instance de DB Load balancer. Copier le contenu des fichiers `proxysql-ca.pem`, `proxysql-cert.pem` et `proxysql-key.pem` de la première instance ProxySQL pour les placer dans les autres.

Les instances ProxySQL où ont été placés les certificats de l'instance de référence doivent être redémarrées.

Les certificats doivent être également présents sur la machine d'où se fait la connexion sécurisée (l'ordi de dev par ex):

```
mysql -h proxy.env-1445653.jcloud-ver-jpe.ik-server.com -pVRsrRHy0449pGcVf50 -ujelastic-48749 --ssl-ca=/cheminvers/ca.pem --ssl-cert=/cheminvers/cert.pem --ssl-key=/cheminvers/key.pem
```

Il est désormais possible de se connecter de manière sécurisée au cluster

### Désactiver les connexions non sécurisées

Pour empêcher de se connecter de manière non sécurisée, il faut de nouveau se connecter sur chaque instance de l'environnement "DB Load balancer" pour modifier une variable liée au compte utilisé pour la connexion. Sur un ssh de chaque instance ProxySQL, lancer la commande suivante:

```
mysql -h 127.0.0.1 -P6032 -uadmin -padmin -e 'UPDATE mysql_users SET use_ssl=1; LOAD MYSQL USERS TO RUNTIME; SAVE MYSQL USERS TO DISK; PROXYSQL RESTART;'
```

La connexion non sécurisée est désormais non autorisée

### Liens utiles

[SSL Configuration for frontends](https://github.com/sysown/proxysql/wiki/SSL-Support#ssl-configuration-for-frontends)  
[ProxySQL users configuration](https://proxysql.com/documentation/users-configuration/)  
[SSL at ProxySQL Part 1](https://proxysql.com/blog/ssl-at-proxysql-part1/)

## Backups automatisés

Sur un serveur MySQL esclave, ajouter la ligne suivante dans le fichier `/var/spool/cron/mysql`:

```
0 1 * * * /var/lib/jelastic/bin/backup_script.sh -m dump -c 10 -u $DB_USER -p $DB_PASS -d oa
```
