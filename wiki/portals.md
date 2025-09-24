# Portals

L'architecture est basée sur [docker swarm](https://docs.docker.com/engine/swarm/), il y a un noeud **manager** qui reçoit le traffic (avec [Traefik](https://doc.traefik.io/traefik/)) et un ou plusieurs noeuds **workers** qui exécutent les services.

La config et le déploiement des portails se passent sur le serveur du manager, c'est lui qui se débrouille avec le/les workers pour lancer / mettre à jour / supprimer les portails.

Pour faciliter la gestion du DNS, on utilise une entrée **A** pour `*.oa.events` pour faire pointer tous les sous-domaines vers Traefik, qui redistribue automatiquement le traffic vers le portail correspondant.
Traefik gère automatiquement les certificats avec Let's Encrypt, à chaque fois qu'il voit un `Host()` dans ses labels il tente de générer le certificat qui correspond (plus d'infos sur https://doc.traefik.io/traefik/reference/install-configuration/tls/certificate-resolvers/acme/#domain-definition).

La procèdure d'installation qui est détaillée plus bas fonctionne avec un swarm sur OpenStack et un réseau privé entre les noeuds
mais ça peut aussi fonctionner avec un swarm sur des VPS distants ou même un simple VPS en éxécutant tout sur le manager (traefik + portails).

## En bref

- **Le déploiement de production est sur l'infra OpenStack d'infomaniak**, région dc4-a.
- **Registre des images de portail**: chaque portail a son image docker d'enregistrée sur un registre dédié (comme le registre sur docker.com, mais auto-hébergé en utilisant harbor), hébergé sur une VM voisine du déploiement des portails: `registry.oa.events`. Lorsqu'un portail est mis à jour, il faut mettre à jour son image: `docker login registry.oa.events -u portals` - voir 1password pour le mdp.
- **SSH sur les serveurs**: Pour lancer les script de mise à jour, de déploiement de portail, il faut se connecter au serveur "swarm manager". Voir la section "Vérifier & ce connecter aux serveurs" pour le détail.

## Todo

- L'install d'un portail devrait inclure un `.yarnrc` pour nodeLinked node-modules, ajouter un `Dockerfile` et un `.dockerignore`
- Une instruction pour ajouter le script
- Les variables d'environnements qui ont toujours la même chose pourraient être traitées avec des valeurs par défaut pour ne pas avoir à les préciser systématiquement
- Modifier le `server.js` du boot pour mettre `i18n: (await import(process.env.PORTAL_I18N_PATH)).default,`

## Préparer un portail

Quelques ajustements sont utiles en amont d'ajouter un portail au swarm. On part d'un portail fonctionnel, qui `yarn start` bien en local avec les variables d'environnement qu'il faut.

1. S'assurer que le `Dockerfile` et le `.dockerignore` est bien présent
2. Rajouter le script `push-image` dans le `package.json`
3. Ajoute un `i8n/index.js` qui export un objet vide (`export default {}`)
4. Lancer `push-image` pour créer l'image du portail
5. ...quand `push-image` a fini de créer et de placer l'image dans le registre, noter son nom qui s'affiche en fin de push dans le terminal (ex: `=> pushing registry.oa.events/portals/bassens:0.0.1-master with docker`, le nom du portail dans le registre dans ce cas est `registry.oa.events/portals/bassens:0.0.1-master`)

## Ajouter un portail

Pour ajouter un portail (existant), il faut :

1. ajouter un service + une config dans le `yml` de https://github.com/OpenAgenda/oa-portals/blob/main/portals/stack.yml
2. `git commit`+ `git push` le yml
3. `git pull` sur le serveur du manager (voir "Se connecter aux serveurs")
4. créer le `.env` sur le serveur dans `oa-portals/portals/envs`
5. lancer `./deploy.sh`

## Mettre à jour un portail

### Le code

Pour mettre à jour le code il faut faire un commit + push basique,
puis `yarn push-image` pour construire et pousser l'image,
et enfin lancer `./deploy.sh` sur le serveur.

### La config

Il faut modifier le `.env` concerné sur le serveur, puis lancer `./update-portal.sh <nom_du_portail>`.

## Supprimer un portail

Il suffit de supprimer le service + la config dans le `yml` de https://github.com/OpenAgenda/oa-portals/blob/main/portals/stack.yml
puis `./deploy.sh` sur le serveur.

## Éteindre un portail

On peut modifier un label dans `yml` pour mettre `traefik.enable=false`, mais le service sera quand même lancé.

Si on veut vraiment éteindre le service, il faut commenter le service dans le `yml`.

Puis `./deploy.sh` sur le serveur.

## Déployer le swarm sur OpenStack

Si tu n'as pas de fichier de connexion à OpenStack, tu peux le créer sur l'interface du Public Cloud dans _Identité_ > _Identifiants d'application_.

```bash
# Se connecter à OpenStack
source ~/app-cred-kkkkaore-openrc.sh
# export OS_REGION_NAME="dc4-a" # pour changer de région si nécessaire

# Créer une clé
openstack keypair create swarm-key > swarm.pem
# ... la mettre sur 1password et la supprimer du pc

# Créer le réseau
openstack network create swarm-net
openstack subnet create
docker login registry.oa.events -u portals

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
openstack security group rule create --ingress --protocol tcp --dst-port 22 swarm-sg
openstack security group rule create --ingress --protocol icmp swarm-sg

# HTTP/HTTPS
openstack security group rule create --ingress --protocol tcp --dst-port 80 swarm-sg
openstack security group rule create --ingress --protocol tcp --dst-port 443 swarm-sg

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

## Se connecter aux serveurs

Une fois les serveurs créés, il faut mettre la clé ssh sur 1password et la supprimer du pc !
Laisse juste la clé publique dans `~/.ssh/swarm-key.pub`.

Pour faciliter la connexion ssh tu peux ajouter la config suivante dans `~/.ssh/config`:

```
Match host swarm-manager
  HostName <IP_DU_MANAGER>
  User ubuntu
  Port 22
  IdentityFile ~/.ssh/swarm-key
  IdentitiesOnly yes

Match host swarm-worker
  HostName <IP_DU_WORKER>
  User ubuntu
  Port 22
  IdentityFile ~/.ssh/swarm-key
  IdentitiesOnly yes
```

Et tu pourras faire:

```bash
ssh swarm-manager

# ou

ssh swarm-worker
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

Il faut d'abord se connecter au registre docker:

```bash
docker login registry.oa.events -u portals
```

Ensuite il faut cloner ou restaurer le repo `oa-portals`, créer les `.env`, et déployer les portails avec `./deploy.sh`.

Il y a une interface web pour voir ce que Traefik a déployé, c'est visible sur https://traefik.oa.events/dashboard/.

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
sudo nano /etc/resticprofile/profiles.yml
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

# Ptits trucs en plus

## Nettoyer les images automatiquement

Dans le repo `oa-portals` il y a un fichier `docker-prune.yml` qui nettoie toutes les images / containers et volumes non utilisés toutes les 24h, à ne pas exécuter en local.

À déployer avec :

```bash
docker stack deploy -c docker-prune.yml docker-prune --detach=false
```

## Portainer

Portainer est disponible sur https://portainer.oa.events

Il permet de voir les logs, redémarrer les services, mettre à jour un service, etc.

Pour le déployer, il faut créer un `portainer-agent-stack.yml` (plus d'infos sur https://docs.portainer.io/start/install/server/swarm/linux) :

```yml
version: '3.2'

services:
  agent:
    image: portainer/agent:lts
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
      - /var/lib/docker/volumes:/var/lib/docker/volumes
    networks:
      - agent_network
    deploy:
      mode: global
      placement:
        constraints: [node.platform.os == linux]

  portainer:
    image: portainer/portainer-ce:lts
    command: -H tcp://tasks.agent:9001 --tlsskipverify
    # Useless only with Traefik
    # ports:
    #   - "9443:9443"
    #   - "9000:9000"
    #   - "8000:8000"
    volumes:
      - portainer_data:/data
    networks:
      - public
      - agent_network
    deploy:
      mode: replicated
      replicas: 1
      placement:
        constraints: [node.role == manager]
      labels:
        - traefik.enable=true
        - traefik.http.routers.portainer.rule=Host(`portainer.oa.events`)
        - traefik.http.services.portainer.loadbalancer.server.port=9000

networks:
  agent_network:
    driver: overlay
    attachable: true
  public:
    external: true

volumes:
  portainer_data:
```

Puis :

```bash
docker stack deploy -c portainer-agent-stack.yml portainer --detach=false
```
