# Serveur de développement distant (VM Infomaniak)

Guide de mise en place d'un environnement de développement `oa` complet sur une
VM distante, accessible depuis un poste léger via Tailscale.

## Pourquoi

La stack de dev `oa` (MySQL + Elasticsearch + nginx + Strapi + alloy-agent +
serveur Next.js + conteneurs annexes) sature facilement un portable à 16 Go de
RAM. Plutôt que de tout faire tourner en local, on déporte la stack sur une VM
(8 vCPU / 32 Go / volume Ceph) sur l'Infomaniak Public Cloud (OpenStack). Le
portable ne fait plus tourner que l'éditeur, le navigateur et Tailscale.

L'accès passe **exclusivement** par un réseau maillé Tailscale (WireGuard) :
aucun port public n'est exposé. La VM reste joignable comme n'importe quelle
machine du tailnet, par son nom MagicDNS.

> **À adapter pour vous** : ce guide contient des valeurs concrètes utilisées
> pour la VM `kaore-dev` (réseau `kaore-net`, utilisateur `ubuntu`, dépôt restic
> `sb_project_<VOTRE_ID_SWISS_BACKUP>`, etc.). Remplacez-les par les vôtres. Les secrets
> (tokens npm/fontawesome, identifiants Swiss Backup, mot de passe restic) sont
> dans 1Password — ne les copiez **jamais** en clair dans un dépôt.

## Vue d'ensemble

```
Portable (client léger)                VM kaore-dev (Infomaniak)
┌─────────────────────┐                ┌──────────────────────────────┐
│  éditeur + navigateur│                │  Docker Compose : node, next, │
│  Tailscale           │◄── WireGuard ──┤  nginx, mysql, redis, es,     │
│  ssh dev / devport   │   (tailnet)    │  strapi, alloy, mailpit…      │
│  /etc/hosts → 100.x  │                │  ~/Dev/lib/oa                 │
└─────────────────────┘                └──────────────────────────────┘
```

---

## Étape 1 — Provisionner la VM (Infomaniak OpenStack)

### 1.1 Réseau isolé (à faire **avant** la VM)

La prod tourne sur son propre réseau OpenStack. Pour éviter qu'une règle Docker
mal configurée ou un script ne touche la prod, on isole le dev sur un réseau dédié.

- **Réseau** `kaore-net`
  - sous-réseau IPv4 `10.30.0.0/24` (choisir une plage qui n'entre pas en
    collision avec les sous-réseaux existants de la prod et du swarm)
  - sous-réseau IPv6 `fd00:30::/64` (ULA)
  - DHCP activé
- **Routeur** `kaore-router`
  - passerelle externe : `ext-net1` (pour `apt`/`yarn`/registries + relais
    Tailscale)
  - interface interne sur `kaore-net` **uniquement** — aucune interface sur
    `oa-net` ni `swarm-net` (c'est la frontière d'isolation)
- **Security group** `kaore-vm-sg`
  - deny all entrant par défaut
  - ICMP entrant autorisé (debug)
  - 22/tcp entrant depuis votre IP publique (bootstrap seulement — à retirer une
    fois Tailscale en place)
  - tout sortant autorisé

### 1.2 Instance

- **Flavor** : usage général 8 vCPU / 32 Go. Le goulot d'étranglement de la
  stack est la RAM (ES + MySQL + Node), pas le CPU.
- **Image** : Ubuntu 24.04 LTS.
- **Réseau** : attacher à `kaore-net` **uniquement**.
- **Keypair** : importer votre clé publique existante (ne pas laisser le portail
  en générer une).
- **Security group** : `kaore-vm-sg`.
- **Volume de boot** : volume Ceph de 100 Go (sert à la fois de disque système et
  de disque de données — simple et suffisant pour du dev). Redimensionnable à
  chaud par la suite (voir [Exploitation](#agrandir-le-volume-disque)).
- **Floating IP** : en allouer une depuis `ext-floating1` pour le bootstrap SSH.
  **La libérer une fois Tailscale opérationnel** — la VM reste joignable sur le
  tailnet, sans exposition publique ni coût d'IP.

---

## Étape 2 — Configuration de base de la VM

Tout se fait en tant qu'utilisateur sudo par défaut (`ubuntu`), pas en root.

```bash
# Hygiène OS
sudo apt update && sudo apt full-upgrade -y
sudo hostnamectl set-hostname kaore-dev
sudo timedatectl set-timezone Europe/Paris

# Swap de sécurité (4 Go)
sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile
sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab

# Tuning noyau pour Elasticsearch
printf 'vm.max_map_count=262144\nvm.swappiness=1\n' | \
  sudo tee /etc/sysctl.d/99-elasticsearch.conf
sudo sysctl -p /etc/sysctl.d/99-elasticsearch.conf
```

### 2.1 Durcissement SSH + pare-feu

```bash
# /etc/ssh/sshd_config : PasswordAuthentication no, PermitRootLogin no, AllowUsers ubuntu
sudo systemctl reload ssh

sudo ufw allow in on tailscale0
sudo ufw allow from <VOTRE_IP_PUBLIQUE> to any port 22 proto tcp
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw enable
```

### 2.2 Tailscale

```bash
curl -fsSL https://tailscale.com/install.sh | sh
sudo tailscale up --ssh --accept-routes
```

Activer **MagicDNS** dans la console d'admin Tailscale : la VM devient joignable
sous le nom court `kaore-dev`. Une fois validé, **libérer la floating IP** dans
le portail.

### 2.3 Docker

```bash
# Dépôt officiel Docker (pas la version Snap/distrib)
# … installer docker-ce + docker-compose-plugin …
sudo usermod -aG docker $USER   # se reconnecter ensuite
```

---

## Étape 3 — Accès depuis le portable (Tailscale)

### 3.1 Config SSH (`~/.ssh/config` du portable)

```sshconfig
Host dev
  HostName kaore-dev
  User ubuntu
  IdentityFile ~/.ssh/id_ed25519

# Variante qui forwarde le port 5173 (ex. Vite/Storybook)
Host dev5173
  HostName kaore-dev
  User ubuntu
  IdentityFile ~/.ssh/id_ed25519
  LocalForward 5173 localhost:5173

# Variante qui ouvre directement tmux (session "main", attach-or-create)
Match Host devmux
  HostName kaore-dev
  User ubuntu
  IdentityFile ~/.ssh/id_ed25519
  RequestTTY yes
  RemoteCommand tmux new-session -A -s main
```

> `kaore-dev` est résolu par MagicDNS — pas d'IP en dur. tmux est **opt-in** :
> `ssh dev` donne un shell normal, `ssh devmux` ouvre tmux. Pour se détacher de
> tmux : `Ctrl+b` puis `d`.

### 3.2 Forward de port à la demande (`~/.zshrc` du portable)

```zsh
devport() {
  local args=()
  for p in "$@"; do args+=(-L "${p}:localhost:${p}"); done
  ssh "${args[@]}" dev
}
# Usage : devport 4000 8903   → forwarde les deux ports puis ouvre un shell
```

> ⚠️ Les `${p}` doivent être entre accolades : en zsh, `$p:l` est interprété
> comme le modificateur « lowercase » et casse la spécification de forward.

### 3.3 Résolution des hôtes `*.local` / `*.openagenda.com`

Pour que le navigateur du portable atteigne l'app servie par nginx sur la VM, on
fait pointer les hôtes de dev vers l'IP Tailscale de la VM dans le `/etc/hosts`
du **portable** :

```
100.x.x.x   d.openagenda.com dapi.openagenda.com strapi.local es7.local \
            phpmyadmin.local mailpit.local grafana.local traefik.local.dev …
```

Sur la **VM**, ces mêmes hôtes pointent vers `127.0.0.1` (nginx local au conteneur).

> C'est sûr de passer par Tailscale : le trafic est chiffré de bout en bout
> (WireGuard) et ne transite jamais par l'Internet public en clair.

---

## Étape 4 — Code source et secrets

```bash
mkdir -p ~/Dev/lib && cd ~/Dev/lib
git clone git@github.com:OpenAgenda/oa.git
cd oa
```

### 4.1 Fichier `.env`

Récupérer un `.env` fonctionnel (depuis un poste existant ou 1Password), puis :

```bash
cp .env .env.bak.$(date +%Y%m%d-%H%M%S)

# Réécrire les chemins absolus du poste d'origine vers ceux de la VM
sed -i "s|/home/<ancien_user>/|/home/ubuntu/|g" .env
```

**Aligner les UID/GID Docker sur l'utilisateur de la VM.** L'`ubuntu` d'Infomaniak
a l'UID `1000`. Si le `.env` provient d'un poste où l'UID était `1001`, corriger :

```ini
DOCKER_USER=1000:1000
DOCKER_USER_ID=1000
DOCKER_USER_GROUP_ID=1000
```

> ⚠️ Voir le piège Strapi en [étape 8](#étape-8--démarrage-de-la-stack--pièges) :
> changer ces UID **impose un rebuild de l'image strapi**.

### 4.2 Secrets des registres privés — dans `~/.profile`, pas `~/.bashrc`

```bash
# ~/.profile
export NPM_TOKEN="…"                  # scope @openagenda
export FONTAWESOME_NPM_AUTH_TOKEN="…" # npm.fontawesome.com
```

> ⚠️ **Piège majeur** : un shell SSH non interactif (`ssh dev 'commande'`,
> exécutions de hooks, etc.) ne source **pas** `~/.bashrc` (early-return pour les
> shells non interactifs). Les tokens doivent donc être dans `~/.profile`, lu par
> les shells de login (`bash -lc`). Mettre les tokens dans `~/.bashrc` provoque
> des 404 / « Invalid authentication » au `yarn install`.

Copier aussi la config yarn/npm depuis un poste existant :

```bash
scp ~/.yarnrc.yml ~/.npmrc dev:/home/ubuntu/
```

---

## Étape 5 — Dépendances

```bash
cd ~/Dev/lib/oa
yarn install
# Construire les packages du workspace (sinon ERR_MODULE_NOT_FOUND au runtime)
yarn workspaces foreach --topological-dev --all run prepack
```

> **`cpu-features`** : ce module optionnel (peer de `ssh2`) ne compile pas avec
> le V8 de Node 22. C'est cassé en amont et sans impact — on le laisse de côté.

---

## Étape 6 — Base de données MySQL (restauration depuis Swiss Backup)

On restaure un dump récent via `restic` (dépôt Swift sur Infomaniak Swiss Backup).

### 6.1 Installer restic + resticprofile

```bash
sudo apt install -y restic            # 0.16.4
# resticprofile : binaire depuis les releases GitHub (0.33.1)
```

### 6.2 Configuration

```bash
# ~/.restic-pass-mysql        (chmod 600) → mot de passe du dépôt restic
# ~/restic_credentials        (chmod 600) → exports OS_* (Swift/OpenStack)
```

```yaml
# /etc/resticprofile/profiles.yml
version: '1'
mysql:
  repository: swift:sb_project_<VOTRE_ID_SWISS_BACKUP>:/mysql
  password-file: /home/ubuntu/.restic-pass-mysql
  env-file: /home/ubuntu/restic_credentials
```

> Identifiants Swiss Backup et mot de passe restic → **1Password**.
> Procédure de restauration détaillée : voir `wiki/mysql.md` et `wiki/cookbook.md`.

### 6.3 Restaurer puis charger le dump

Le conteneur MySQL (`mysql:8.0.33`) a `require_secure_transport=ON` et un cert
auto-signé. Particularités du chargement :

- Le client mysql doit fournir le CA : `--ssl-ca=/home/ubuntu/Dev/data/mysql/ca.pem`.
- `mysqlsh` empaqueté sur Ubuntu est **sans support JavaScript** → utiliser le
  mode Python (`--py`, options en `snake_case` / `camelCase`).
- Avec `--ssl-ca`, le mode SSL doit être `VERIFY_CA` (pas `REQUIRED`).
- Activer `local_infile` avant le chargement : `SET GLOBAL local_infile=1;`.

```bash
mysqlsh --py --ssl-mode=VERIFY_CA --ssl-ca=/home/ubuntu/Dev/data/mysql/ca.pem \
  -uroot -p -h 127.0.0.1 \
  -e "util.load_dump('/chemin/vers/dump', {'threads': 8, 'resetProgress': True})"
```

### 6.4 Tuning : import vs dev courant

Pour accélérer un gros import on gonfle temporairement `my.cnf`
(`/home/ubuntu/Dev/data/mysql.cnf`) :

```ini
innodb_buffer_pool_size  = 20000M
innodb_redo_log_capacity = 5G
```

**Une fois la restauration terminée, revenir à des valeurs de dev** et
redémarrer MySQL. Sinon :

- le buffer pool à 20 Go mange ~20 Go de RAM sur la VM (contre-productif) ;
- le redo log occupe ~5 Go de disque inutilement.

Valeurs raisonnables pour du dev sur 32 Go : `innodb_buffer_pool_size = 6144M`,
`innodb_redo_log_capacity = 1G`. Le redo log rétrécit sur disque au redémarrage
de MySQL.

---

## Étape 7 — Strapi (base SQLite)

Strapi utilise SQLite (`/home/ubuntu/Dev/data/strapi.db`, monté dans le conteneur
sur `/home/strapiuser/db.sqlite`).

- Une base **vide/fraîche** renvoie **401** sur `GET /api/pages` : elle ne
  contient ni les pages, ni la ligne de token d'API attendue par le front Next.
- **Solution** : copier le `strapi.db` d'une instance fonctionnelle (qui contient
  les pages + les tokens). Le token doit avoir été haché avec le **même**
  `STRAPI_API_TOKEN_SALT` que celui du `.env`.

```bash
# Arrêter strapi, sauvegarder la base fraîche, copier la base peuplée
ssh dev 'cd ~/Dev/lib/oa && docker compose stop strapi && \
  cp -a ~/Dev/data/strapi.db ~/Dev/data/strapi.db.bak'
scp /chemin/strapi.db.peuplee dev:/home/ubuntu/Dev/data/strapi.db
ssh dev 'chmod 664 ~/Dev/data/strapi.db && cd ~/Dev/lib/oa && docker compose start strapi'
```

> Côté front, `packages/next/.env` mappe
> `NEXT_STRAPI_API_AUTH_TOKEN=$STRAPI_API_AUTH_TOKEN` (expansion de variable au
> chargement Next). Le token envoyé en `Bearer` vient donc bien du `.env` racine.

---

## Étape 8 — Démarrage de la stack & pièges

```bash
cd ~/Dev/lib/oa
docker compose up -d
docker compose ps   # tous les services doivent être Up/healthy
```

Pièges rencontrés (tous résolus) :

| Symptôme                                                                   | Cause                                                                                                                                                                      | Correctif                                                                                                                                                                                                                                                    |
| -------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Strapi `SqliteError: unable to open database file`                         | `strapi.db` était un répertoire auto-créé                                                                                                                                  | remplacer par un **fichier** (voir étape 7)                                                                                                                                                                                                                  |
| Strapi `attempt to write a readonly database`                              | image strapi buildée avec `DOCKER_USER_ID=1001`, `/home/strapiuser` appartient à 1001 alors que le conteneur tourne en 1000                                                | **rebuild** : `docker compose build strapi`                                                                                                                                                                                                                  |
| next `EACCES .next/dev`                                                    | `DOCKER_USER` à 1001 (UID du poste d'origine)                                                                                                                              | passer les `DOCKER_USER*` à 1000 dans `.env`                                                                                                                                                                                                                 |
| migrator `EACCES /ssl/db-key.pem`                                          | clé client mysql en 600 / uid 999                                                                                                                                          | `sudo chmod 644 ~/Dev/data/mysql/client-key.pem`                                                                                                                                                                                                             |
| node : prompt **corepack** « about to download yarn… » qui bloque `dco up` | l'image build `corepack enable` **avant** que `package.json` (qui épingle `yarn@4.5.3`) ne soit monté → yarn 4.5.3 jamais mis en cache ; pas de stdin interactif sous `up` | cache à chaud : `docker compose exec -T node bash -c 'cd /root/oa && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 yarn -v'` (réutilisé par `dcn`). **Correctif durable** : ajouter `&& corepack install -g yarn@4.5.3` dans `docker/Dockerfile` après `corepack enable` |
| `EAI_AGAIN strapi` au SSR                                                  | strapi down                                                                                                                                                                | voir étapes 7 & 8 ci-dessus                                                                                                                                                                                                                                  |

---

## Étape 9 — Vérification

```bash
# Depuis la VM
curl -ksI https://d.openagenda.com/fr        # → 200
docker compose exec -T redis redis-cli PING   # → PONG
oadb -e "SELECT COUNT(*) FROM oadev.users;"    # données présentes
```

Depuis le portable : ouvrir `https://d.openagenda.com/fr` dans le navigateur
(faire un hard-refresh — Next met en cache l'overlay d'erreur). La page doit
s'afficher et la connexion à un compte doit fonctionner (auth MySQL + session
redis).

---

## Aliases utiles (`~/.bashrc` de la VM)

```bash
alias tm='tmux new-session -A -s main'

alias dco='docker compose'
alias dcu='docker compose up'
alias dcd='docker compose down'
alias dcs='docker compose stop'
alias dcr='docker compose restart'
alias dcl='docker compose logs -f'
alias dcp='docker compose ps'
alias dce='docker compose exec'

alias doa='cd ~/Dev/lib/oa && dco stop node && dco run node /bin/bash'
alias dcn='cd ~/Dev/lib/oa && dco stop node && dco up node'   # app au premier plan (logs live)
alias dcns='cd ~/Dev/lib/oa && dco stop node && cd -'
alias oadb='mysql -uroot -pgrut -h 127.0.0.1 --ssl-ca=/home/ubuntu/Dev/data/mysql/ca.pem'

alias gtoa='cd ~/Dev/lib/oa'
alias gt='cd ~/Dev/lib/oa/packages'
alias gtcn='cd ~/Dev/lib/oa/packages/cibul-node'
```

> Ces aliases ne sont chargés que dans un shell de login interactif. Un
> `ssh dev 'dcn'` ne les connaît pas — se connecter d'abord, puis lancer.
>
> `oadb` contient le mot de passe MySQL de **dev local** (valeur par défaut du
> `.env`, liée à `127.0.0.1` sur un hôte Tailscale-only). Ce n'est pas un secret
> de prod et il ne doit jamais être réutilisé ailleurs — remplacez-le par le
> vôtre si votre `.env` en définit un autre.

---

## Exploitation

### Agrandir le volume disque

Le volume Cinder se redimensionne **à chaud** (backend Ceph, volume « in-use »).

1. **Portail Infomaniak** : Public Cloud → Horizon → **Volumes** → volume de boot
   de `kaore-dev` → **Extend Volume** (ex. 100 → 200 Go).
   Ou CLI : `openstack volume set --size 200 <volume-id>`.
2. **Sur la VM** :
   ```bash
   echo 1 | sudo tee /sys/class/block/sda/device/rescan   # le noyau voit la nouvelle taille
   sudo growpart /dev/sda 1                                # étend la partition
   sudo resize2fs /dev/sda1                                # étend l'ext4 (en ligne, sans démontage)
   df -h /                                                 # vérifier
   ```

> Cinder ne sait qu'**agrandir** : un volume ne se réduit pas. La taille choisie
> devient le nouveau plancher de facturation.

### Sauvegardes

- **Code** : `git push` régulier.
- **MySQL** : dumps via `restic` vers Swiss Backup (voir `wiki/mysql.md`).
- **Volume** : snapshots quotidiens OpenStack (optionnel, facturé au Go).

### Coût indicatif (CHF/mois, facturé au tenant société)

| Poste                             | Estimation            |
| --------------------------------- | --------------------- |
| Instance 8 vCPU / 32 Go           | ~32                   |
| Volume de boot (200 Go)           | ~10–20                |
| Snapshots quotidiens (si activés) | ~1–2                  |
| Object Storage (backups restic)   | <1                    |
| **Total**                         | **~CHF 43–55 / mois** |

> Estimations basées sur le dimensionnement — le montant exact est dans la page
> Consommation du portail. Le crédit de démarrage de CHF 300 couvre ~5–6 mois.
> Pas de floating IP en facturation récurrente (libérée après Tailscale).

---

## Migrer vers un autre hôte (ex. mini-PC)

Comme l'accès passe par Tailscale, déplacer la stack vers une autre machine (un
mini-PC à domicile, par exemple) est transparent côté client :

1. Installer Tailscale sur le nouvel hôte (`tailscale up`) → il rejoint le tailnet
   avec son propre nom MagicDNS et son IP `100.x`.
2. Migrer les données : `git` + restauration restic MySQL + copie de `strapi.db`
   (exactement les étapes 4 à 7).
3. Sur le portable, repointer le `HostName` de l'alias `dev` et les entrées
   `/etc/hosts` vers le nouveau nom/IP.

Aucune ouverture de port sur la box (WireGuard sortant traverse le NAT via les
relais DERP) : même posture de sécurité que la VM. `ssh dev` continue de
fonctionner à l'identique.
