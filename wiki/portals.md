# Portals

## Ajouter un portail

Pour ajouter un portail, il faut :

1. ajouter un service + une config dans le `yml` de https://github.com/OpenAgenda/oa-portals/blob/main/portals/stack.yml
2. créer le `.env` pour ce portail
3. `git commit` le yml
4. `git pull` sur le serveur
5. créer le `.env` sur le serveur
6. lancer `./deploy.sh`

## Mettre à jour un portail

### Le code

Pour mettre à jour le code il faut faire un commit + push basique,
puis `yarn push-image` pour construire et pousser l'image,
et enfin lancer `./deploy.sh` sur le serveur.

### La config

Il faut modifier le `.env` concerné sur le serveur, puis lancer `./update-portal.sh <nom_du_portail>`.

## Déployer le swarm sur OpenStack

```bash
# Se connecter à OpenStack
source ~/app-cred-kkkkaore-openrc.sh
# export OS_REGION_NAME="dc4-a" # pour changer de région si nécessaire

# Créer une clé
openstack keypair create swarm-key > swarm.pem
# ... la mettre sur 1password et la supprimer du pc

# Créer le réseau
openstack network create swarm-net
openstack subnet create \
  --network swarm-net \
  --subnet-range 10.10.0.0/24 \
  --dns-nameserver 1.1.1.1 \
  swarm-subnet

# Créer le router
openstack router create swarm-router
openstack router set swarm-router --external-gateway ext-floating1
openstack router add subnet swarm-router swarm-subnet

# Créer un groupe de sécurité
openstack security group create swarm-sg

# SSH + ICMP
openstack security group rule create --ingress --protocol tcp --dst-port 22   swarm-sg
openstack security group rule create --ingress --protocol icmp                swarm-sg

# HTTP/HTTPS
openstack security group rule create --ingress --protocol tcp --dst-port 80   swarm-sg
openstack security group rule create --ingress --protocol tcp --dst-port 443  swarm-sg

# Swarm
openstack security group rule create --ingress --protocol tcp --dst-port 2377 swarm-sg
openstack security group rule create --ingress --protocol tcp --dst-port 7946 swarm-sg
openstack security group rule create --ingress --protocol udp --dst-port 7946 swarm-sg
openstack security group rule create --ingress --protocol udp --dst-port 4789 swarm-sg

# Autoriser tout le trafic "intra-groupe"
openstack security group rule create --ingress --protocol any --remote-group swarm-sg swarm-sg

# Créer l'instance du manager
openstack server create \
  --flavor a8-ram16-disk20-perf1 \
  --image "Ubuntu 24.04 LTS Noble Numbat" \
  --key-name swarm-key \
  --network swarm-net \
  --security-group swarm-sg \
  swarm-mgr-1

# Créer l'instance du worker
openstack server create \
  --flavor a16-ram64-disk80-perf1 \
  --image "Ubuntu 24.04 LTS Noble Numbat" \
  --key-name swarm-key \
  --network swarm-net \
  --security-group swarm-sg \
  swarm-wkr-1

# Attribuer des IPs
FIP_MGR=$(openstack floating ip create -f value -c floating_ip_address ext-floating1)
FIP_WRK=$(openstack floating ip create -f value -c floating_ip_address ext-floating1)
openstack server add floating ip swarm-mgr-1 $FIP_MGR
openstack server add floating ip swarm-wkr-1 $FIP_WRK
echo "Manager: $FIP_MGR"
echo "Worker : $FIP_WRK"

# Vérifier les serveurs
openstack server list --long
```

### Installer docker sur chaque serveur

```bash
sudo apt-get update
sudo apt-get install -y docker.io
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
exit # nécessaire
```

### Configurer le swarm

SUR LE MANAGER:

```bash
docker swarm init --advertise-addr <IP_PRIVEE_DU_MANAGER>
```

---

SUR LE WORKER:

```bash
docker swarm join --token <SWARM_WORKER_TOKEN> <IP_PRIVEE_DU_MANAGER>:2377
```

---

SUR LE MANAGER:

```bash
docker node ls # on devrait voir les 2 noeuds

docker network create --driver overlay --attachable public
# ou la commande suivante suivante si le traffic passe sur un réseau publique:
# docker network create --driver overlay --attachable --opt encrypted public
```

# Déployer les portails

Il faut cloner le repo `oa-portals`, créer les `.env`, et déployer les portails avec `./deploy.sh`.

Pour se connecter au registre docker:

```bash
docker login registry.oa.events -u portals
```

# Backup

## Mise en place du backup

Le backup est fait gràce à [restic](https://restic.net/).

Sur le manager:

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
# export RESTIC_REPOSITORY=swift:sb_project_SBI-1234:/oa-portals
# export RESTIC_PASSWORD_FILE=/home/ubuntu/.restic-pass
```

Plus d'infos sur https://docs.infomaniak.cloud/block_storage/swissbackup/

Pour gérer plusieurs profiles restic et automatiser les backups avec [resticprofile](https://creativeprojects.github.io/resticprofile/index.html):

```bash
curl -LO https://raw.githubusercontent.com/creativeprojects/resticprofile/master/install.sh
chmod +x install.sh
sudo ./install.sh -b /usr/local/bin

sudo mkdir -p /etc/resticprofile
nano /etc/resticprofile/profiles.yml
```

La config:

```yml
version: '1'

default:
  repository: swift:sb_project_SBI-1234:/oa-portals
  password-file: /home/ubuntu/.restic-pass
  env-file: /home/ubuntu/restic_credentials
  backup:
    verbose: true
    source-base: /home/ubuntu
    source: oa-portals
    source-relative: true
    schedule: 'daily'
    schedule-permission: user
  retention:
    before-backup: false
    after-backup: true
    keep-last: 7
    keep-daily: 7
    keep-weekly: 4
    keep-monthly: 6
```

Puis:

```bash
resticprofile init
resticprofile backup
sudo resticprofile schedule
# Control
resticprofile snapshots
resticprofile status
```

## Restaurer les données

```bash
resticprofile restore --target /home/ubuntu/oa-portals --snapshot-id "latest:oa-portals"
```

## Utiliser les données en local

Pour ça il faut installer restic et resticprofile de la même manière qu'au-dessus,
avec une version allégée de `/etc/resticprofile/profiles.yml`:

```yml
version: '1'

oa-portals:
  repository: swift:sb_project_SBI-1234:/oa-portals
  password-file: /home/bertho/.restic-pass
  env-file: /home/bertho/restic_credentials
```

Pour lister les fichiers du dernier snapshots:

```bash
resticprofile ls@oa-portals latest
```

Pour restaurer le sous-dossier `oa-portals` du dernier snapshot:

```bash
resticprofile restore@oa-portals latest:/oa-portals --target ~/dev/oa-portal-restoration
```
