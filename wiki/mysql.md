# Explication du réseau Public Cloud

https://docs.infomaniak.cloud/network/networks/

### 🔹 Réseaux (Networks)

Dans OpenStack (via **Neutron**), un réseau est comme un **switch virtuel** dans lequel tu connectes tes machines virtuelles (VMs).

- Exemple : un réseau privé interne où toutes tes VMs peuvent communiquer entre elles.

---

### 🔹 Sous-réseaux (Subnets)

Chaque réseau doit avoir au moins un sous-réseau.

- C’est l’**adresse IP et le plan d’adressage** (ex. `192.168.10.0/24`) qui définit quelles IP tes VMs vont recevoir.
- Tu peux aussi définir la **gateway** (passerelle) et les **DNS**.

---

### 🔹 Routeurs (Routers)

Le routeur permet de **relier deux réseaux** :

- Typiquement un **réseau privé** (où vivent tes VMs) et le **réseau externe/public** (qui a accès à Internet).
- Il fait aussi de la **NAT** (Network Address Translation) pour que les VMs privées puissent sortir vers Internet.

---

### 🔹 IP flottantes (Floating IPs)

Une IP flottante est une **IP publique** que tu peux associer/dissocier dynamiquement à une VM.

- Tes VMs ont une **IP privée** (accessible uniquement dans ton cloud).
- Tu attaches une **floating IP** pour la rendre accessible **depuis Internet**.
- Tu peux la déplacer d’une VM à une autre en quelques secondes → pratique pour la **haute dispo** ou la **maintenance**.

---

👉 Résumé visuel :

```
Internet <--> Réseau externe <---> Routeur <---> Réseau privé (subnet) <---> VMs
                     |
                 Floating IP
                     |
                     VM
```

# Déploiement

## Réseau

### Réseau privé

```bash
openstack network create oa-net
```

### Subnet pool

On va créer une pool de subnets pour choisir les plages IP à utiliser.

La pool a une grande plage `10.20.0.0/16`.

Puis si on ajoute des sous-réseaux on peut utiliser `10.20.1.0/24`, `10.20.2.0/24`, `10.20.3.0/24`...

```bash
openstack subnet pool create oa-subnetpool-v4 \
  --pool-prefix 10.20.0.0/16 \
  --default-prefix-length 24

openstack subnet pool create oa-subnetpool-v6 \
  --pool-prefix fd00:20::/48 \
  --default-prefix-length 64

openstack subnet create oa-subnet-v4 \
  --subnet-pool oa-subnetpool-v4 \
  --network oa-net \
  --dns-nameserver 83.166.143.51 \
  --dns-nameserver 83.166.143.52

openstack subnet create oa-subnet-v6 \
  --subnet-pool oa-subnetpool-v6 \
  --network oa-net \
  --ip-version 6 \
  --ipv6-ra-mode slaac \
  --ipv6-address-mode slaac
```

Les DNS `83.166.143.51` et `83.166.143.52`, sont ceux d'Infomaniak, plus près donc plus rapides.

### Router

```bash
openstack router create oa-router

openstack router add subnet oa-router oa-subnet-v4
openstack router add subnet oa-router oa-subnet-v6

openstack router set --external-gateway ext-floating1 oa-router
```

## Volume

```bash
openstack volume create \
  --image "Ubuntu 24.04 LTS Noble Numbat" \
  --size 150 \
  mysql-boot

# Récupérer l’AZ du volume pour aligner l’instance
VOL_AZ=$(openstack volume show -f value -c availability_zone mysql-boot)
echo "Volume AZ = $VOL_AZ"
```

Il faut garder la **Accessibility Zone** (AZ) pour mettre l'instance au plus près.

## Groupe de sécurité

Il faut créer un groupe de sécurité avec les règles suivantes (ipv4 + ipv6):

- SSH (port 22)
- MySQL (port 3306)

Puis tous les ports ICMP, c'est utile pour les Router Advertisement.

On pourra ajuster plus tard pour être plus strict sur le port 3306.

## Instance

Il est mieux de mettre l'instance sur la même Availability Zone que le volume.

---

Détails:

- Instance Name: mysql

Source:

- Image avec volume de 150Go
- Ubuntu 24.04

Gabarit:

- a16-ram64-disk0 (le plus gros sans espace disque, il vient du volume)

Réseaux:

- ext-net1
- ext-v6only1 (pour une ip v6 publique)

Groupe de sécurité:

- mysql-sg

Key Pair:
Créer une pair de clé SSH appelée "mysql" et la mettre dans 1password

---

Puis lancer l'instance.

Créer un fichier `~/.ssh/mysql.pub` avec la clé publique, puis `chmod 644 ~/.ssh/mysql.pub`.

Modifier le `~/.ssh/config` pour simplifier la connexion :

```
Match host mysql
  HostName <IP_DU_SERVEUR>
  User ubuntu
  Port 22
  IdentityFile ~/.ssh/mysql
  IdentitiesOnly yes
```

Puis `ssh mysql` pour se connecter.

## Installer mysql

### La base

Se connecter avec `ssh mysql`.

```bash
sudo apt update && sudo apt upgrade -y

sudo apt install mysql-server -y

sudo mysql_secure_installation

systemctl status mysql
```

### Écouter l'extérieur

Pour se connecter depuis l'extérieur :

- Édite `/etc/mysql/mysql.conf.d/mysqld.cnf`
- Remplace `bind-address = 127.0.0.1` par `bind-address = *`
- Redémarre mysql avec `sudo systemctl restart mysql`

### Définir un utilisateur

root se connecte via `auth_socket`, donc pas besoin de mot de passe depuis la machine :

```bash
sudo mysql -u root
```

Puis en remplaçant `<USER>` et `<MOT_DE_PASSE>`.

```mysql
CREATE USER '<USER>'@'%' IDENTIFIED BY '<MOT_DE_PASSE>';
GRANT ALL PRIVILEGES ON *.* TO '<USER>'@'%' WITH GRANT OPTION;
FLUSH PRIVILEGES;
```

Il faut penser à modifier le port 3306 dans le firewall pour être plus strict.

### Config

Il faut créer le fichier suivant

```bash
sudo nano /etc/mysql/conf.d/my_custom.cnf
```

avec

```
[mysqld]
# --- Généraux ---
skip-name-resolve
skip-log-bin
log_error = /var/log/mysql/error.log

# General charset
character-set-server = utf8mb4
collation-server     = utf8mb4_unicode_ci

# --- InnoDB ---
innodb_buffer_pool_size       = 48G
innodb_buffer_pool_instances  = 8
# innodb_buffer_pool_chunk_size = 56M
innodb_redo_log_capacity      = 4G
innodb_flush_log_at_trx_commit = 2
innodb_flush_method           = O_DIRECT
innodb_read_io_threads = 8
innodb_write_io_threads = 8
innodb_io_capacity            = 400  # perf1
innodb_io_capacity_max        = 800

# --- Connexions & buffers ---
max_connections          = 300
max_allowed_packet       = 1024M
tmp_table_size           = 256M
max_heap_table_size      = 256M
sort_buffer_size         = 4M
read_buffer_size         = 256K
read_rnd_buffer_size     = 256K
thread_stack             = 256K
table_open_cache         = 8000
table_definition_cache   = 4096
```

Puis `sudo systemctl restart mysql`

# Backup

Il faut d'abord installer MySQL Shell:

- https://dev.mysql.com/downloads/repo/apt/ (Exemple de téléchargement avec curl: `curl -JLO https://dev.mysql.com/get/mysql-apt-config_0.8.34-1_all.deb`)
- https://dev.mysql.com/doc/mysql-shell/8.0/en/mysql-shell-install-linux-quick.html

Et `lbzip2`:

```bash
sudo apt install lbzip2
```

## Sauvegarde

Pour faire un dump :

```bash
sudo mysqlsh --js -u root -S /run/mysqld/mysqld.sock -e "
  util.dumpSchemas(
    ['oa'],
    '/tmp/oa-dump',
    {
      threads: 16,
      showProgress: true,
      compression: 'none',
    }
  )
"
```

Puis compresser le dossier :

```bash
tar -I lbzip2 -cf oa-dump-$(date +%Y-%m-%d_%Hh%Mm).tar.bz2 -C /tmp/ oa-dump
```

## Restauration

Pour rendre la restoration beaucoup plus rapide il est nécessaire de créer le fichier suivant en premier.
Il faudra le supprimer et relancer mysql après l'import.

```bash
sudo nano /etc/mysql/conf.d/99-import-turbo.cnf
```

Cette config sert à limiter les vérifications superflues, les doubles écritures et les écritures disques trop fréquentes :

```
[mysqld]
#############################
### TURBO MODE for imports
#############################

skip-log-bin

local_infile = 1

innodb_flush_log_at_trx_commit = 2
innodb_doublewrite             = 0
innodb_ddl_threads             = 8
innodb_parallel_read_threads   = 8
innodb_ddl_buffer_size         = 2097152000

# Buffers/redo pour avaler de gros batches
innodb_log_buffer_size         = 1G
innodb_redo_log_capacity       = 8G

# I/O
innodb_io_capacity             = 2000
innodb_io_capacity_max         = 4000
innodb_read_io_threads         = 8
innodb_write_io_threads        = 8

# Réseau/paquets
max_allowed_packet             = 1G
net_read_timeout               = 600
net_write_timeout              = 600
```

puis relancer mysql:

```bash
sudo systemctl restart mysql
```

Pour décompresser le dossier :

```bash
tar -I lbzip2 -xf oa-dump-2025-10-01.tar.bz2 -C /tmp
```

L'import se fait avec :

```bash
sudo mysql -e "DROP DATABASE IF EXISTS oa; CREATE DATABASE oa;"
sudo mysqlsh --js -u root -S /run/mysqld/mysqld.sock -e "
  util.loadDump(
    '/tmp/oa-dump',
    {
      threads: 16,
      deferTableIndexes: 'all',
      skipBinlog: true,
      showProgress: true,
      schema: 'oa',
    }
  )
"
```

Une fois l'import terminé on peut supprimer le fichier de config temporaire:

```bash
sudo rm /etc/mysql/conf.d/99-import-turbo.cnf
sudo systemctl restart mysql
```

## Automatiser le backup

Le backup est fait gràce à [restic](https://restic.net/).

```bash
sudo apt install restic

# Créer le fichier de mot de passe
nano .restic-pass
chmod 600 .restic-pass

# Créer le fichier de configuration restic
nano restic_credentials
```

Le fichier de configuration, en veillant à modifier les valeurs :

```bash
export OS_AUTH_URL=https://swiss-backup04.infomaniak.com/identity/v3
export OS_REGION_NAME=RegionOne
export OS_PROJECT_NAME=sb_project_SBI-1234
export OS_PASSWORD=xxxx
export OS_USER_DOMAIN_NAME=default
export OS_USERNAME=SBI-1234
export OS_PROJECT_DOMAIN_NAME=default
# useful when resticprofile is not used
# export RESTIC_REPOSITORY=swift:sb_project_SBI-1234:/mysql
# export RESTIC_PASSWORD_FILE=/home/ubuntu/.restic-pass
```

Plus d'infos sur https://docs.infomaniak.cloud/block_storage/swissbackup/

Pour gérer plusieurs profiles restic et automatiser les backups avec [resticprofile](https://creativeprojects.github.io/resticprofile/index.html):

```bash
curl -LO https://raw.githubusercontent.com/creativeprojects/resticprofile/master/install.sh
chmod +x install.sh
sudo ./install.sh -b /usr/local/bin
rm install.sh

sudo mkdir -p /etc/resticprofile
sudo nano /etc/resticprofile/profiles.yml
```

La config, en remplaçant `<MYSQL_USER>` et `<MYSQL_PASSWORD>`:

```yml
version: "1"

default:
  repository: swift:sb_project_SBI-KB523976:/mysql
  password-file: /home/ubuntu/.restic-pass
  env-file: /home/ubuntu/restic_credentials
  backup:
    run-before:
      - >
        mysqlsh --js -u <MYSQL_USER> "-p<MYSQL_PASSWORD>" -S /run/mysqld/mysqld.sock -e
        "util.dumpSchemas(['oa'], '/tmp/oa-dump',
        {threads:16, showProgress:true, compression:'none'})"

    run-finally:
      - rm -rf "/tmp/oa-dump"
    stdin-from-command: true
    stdin-filename: "oa-dump-{{ .Now.Format "2006-01-02_15h04m" }}.tar.bz2"
    stdin-command: >
      tar -I lbzip2 -cf - -C /tmp oa-dump

    verbose: true
    schedule: "daily"
    schedule-permission: user
  retention:
    before-backup: false
    after-backup: true
    keep-last: 7
    keep-daily: 7
    keep-weekly: 4
    keep-monthly: 6
```

## Sauvegarder les données

```bash
resticprofile init # une fois seulement
resticprofile backup
sudo resticprofile schedule
# Control
resticprofile snapshots
resticprofile status
```

## Restaurer les données

```bash
resticprofile restore --target /tmp --snapshot-id "latest"
```

Voir plus haut pour décompresser et importer le dump.

# TLS

Pour avoir une connexion sécurisée il faut une autorité de certification, un certificat serveur et (optionnel) un certificat client.

Les fichiers utiles sont :

`ca.pem` : Utilisez ce fichier pour définir la variable système `ssl_ca` côté serveur et l’option `--ssl-ca` côté client. (Le certificat du CA, s’il est utilisé, doit être identique des deux côtés.)
`server-cert.pem`, `server-key.pem` : Utilisez ces fichiers pour définir les variables système `ssl_cert` et `ssl_key` côté serveur.
`client-cert.pem`, `client-key.pem` : Utilisez ces fichiers comme arguments des options `--ssl-cert` et `--ssl-key` côté client.

On va créer un nouveau dossier pour travailler sur les certificats:

```bash
mkdir newcerts && cd newcerts
```

Pour l'autorité de certification, il en existe une dans 1password.

## CA

Si on utilise le CA existant, on met la clé dans `ca-key.pem` et le certificat dans `ca.pem`.

Si on en crée un spécifiquement pour mysql.

```bash
openssl genrsa 2048 > ca-key.pem
openssl req -new -x509 -nodes -days 3600 \
        -key ca-key.pem -out ca.pem
```

Avec comme infos, par exemple :

- countryName = FR
- stateOrProvinceName = Ile-de-France
- localityName = Courbevoie
- organizationName = OADEV
- commonName = auth.openagenda.com
- emailAddress = support@openagenda.com

## Server certificate

On va créer un certificat avec un FQDN et une IP,
pour ça il faut créer un fichier `openssl.cnf`
en remplaçant <FQDN> (dans commonName et alt_names) et <IP> :

```ini
[ req ]
distinguished_name = req_distinguished_name
req_extensions     = v3_req

[ req_distinguished_name ]
countryName            = FR
stateOrProvinceName    = Ile-de-France
localityName           = Courbevoie
organizationName       = OADEV
commonName             = <FQDN>
emailAddress           = support@openagenda.com

[ v3_req ]
subjectAltName = @alt_names

[ alt_names ]
DNS.1 = <FQDN>
IP.1  = <IP>
IP.2  = <ANOTHER_IP>
```

Par exemple FQDN peut être `mysql.dc4-a.pub2.infomaniak.cloud`
et l'IP peut être `2001:1600:16:11::abc`.

Pour générer et signer le certificat, en remplaçant <FQDN> :

```bash
# Crée la clé privée et le CSR en utilisant notre config
openssl req -new -nodes \
  -keyout server-key.pem \
  -out server-req.csr \
  -subj "/CN=<FQDN>" \
  -config openssl.cnf

# Signez le certificat avec notre CA
openssl x509 -req -in server-req.csr -days 3600 \
  -CA ca.pem \
  -CAkey ca-key.pem \
  -CAcreateserial \
  -out server-cert.pem \
  -extfile openssl.cnf \
  -extensions v3_req
```

## Client certificate

Pour le certificat du client c'est la même manip avec des noms de fichiers différents :

```bash
# Crée la clé privée et le CSR en utilisant notre config
openssl req -new -nodes \
  -keyout client-key.pem \
  -out client-req.csr \
  -subj "/CN=<FQDN>" \
  -config openssl.cnf

# Signez le certificat avec notre CA
openssl x509 -req -in client-req.csr -days 3600 \
  -CA ca.pem \
  -CAkey ca-key.pem \
  -CAcreateserial \
  -out client-cert.pem \
  -extfile openssl.cnf \
  -extensions v3_req
```

## Vérification et utilisation

Pour vérifier les certificats :

```bash
openssl verify -CAfile ca.pem server-cert.pem client-cert.pem
```

On corrige déplace les certificats et corrige les droits :

```bash
sudo mkdir -p /etc/mysql/ssl

sudo cp ca.pem server-cert.pem server-key.pem client-key.pem client-cert.pem /etc/mysql/ssl/

sudo chown -R mysql:mysql /etc/mysql/ssl

sudo chmod 600 /etc/mysql/ssl/server-key.pem
sudo chmod 600 /etc/mysql/ssl/client-key.pem

sudo chmod 644 /etc/mysql/ssl/ca.pem
sudo chmod 644 /etc/mysql/ssl/server-cert.pem
sudo chmod 644 /etc/mysql/ssl/client-cert.pem
```

On va modifier le fichier de conf :

```bash
sudo nano /etc/mysql/conf.d/my_custom.cnf
```

pour y ajouter :

```
ssl_ca = /etc/mysql/ssl/ca.pem
ssl_cert = /etc/mysql/ssl/server-cert.pem
ssl_key = /etc/mysql/ssl/server-key.pem
require_secure_transport = ON
```

Il faut redémarrer mysql :

```bash
sudo systemctl restart mysql
```

On termine en supprimant ce dossier :

```bash
rm -rf newcerts
```

# Plus

Pour utiliser une ipv6 dans docker il faut activer le réseau ipv6.

Il faut créer/modifier `/etc/docker/daemon.json` pour y ajouter :

```json
{
  "ipv6": true,
  "fixed-cidr-v6": "fd00::/80"
}
```

Puis redémarrer le service docker :

```bash
sudo systemctl restart docker
```

Plus d'infos: https://docs.docker.com/engine/daemon/ipv6/
