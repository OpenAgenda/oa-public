# Déploiement Redis Cluster (Infomaniak OpenStack)

> Objectif : Redis Cluster 6 nœuds (3 masters + 3 replicas), réseau `oa-net`, **soft-anti-affinity**, Floating IP sur `redis-01`, **AOF activé**, **auth Redis**, et procédures **scale up/down**.
>
> Hypothèses (à adapter si besoin) :
>
> - Network : `oa-net` (IPv4 `10.20.0.0/24`, IPv6 `fd00:20::/64`)
> - Réseau externe Floating IP : `ext-floating1`
> - Image : `Debian 12 bookworm`
> - Flavor : `a2-ram4-disk20-perf1`
>
> Conventions importantes :
>
> - Les sections marquées **[SUR TON HÔTE]** se lancent depuis ta machine locale (avec `openstack` configuré).
> - Les sections marquées **[SUR redis-01]** se lancent une fois connecté en SSH sur `redis-01`.
> - Par défaut, l'utilisateur des images Debian cloud est souvent `debian` (Ubuntu : `ubuntu`).
>   - Si tu hésites : `ssh debian@...` puis `ssh ubuntu@...`.

---

## 0) Clé SSH dédiée au cluster (ne plus utiliser `admin`) — [SUR TON HÔTE]

### 0.1 Générer la clé

Compatible 1Password SSH agent : tu peux continuer à référencer le `.pub` dans `IdentityFile` si c'est ton workflow.

```bash
ssh-keygen -t ed25519 -a 64 -f ~/.ssh/redis-cluster -C "redis-cluster"
chmod 600 ~/.ssh/redis-cluster
chmod 644 ~/.ssh/redis-cluster.pub
```

### 0.2 Ajouter la clé publique dans OpenStack

```bash
openstack keypair create --public-key ~/.ssh/redis-cluster.pub redis-cluster
```

---

## 1) Security Groups (idempotent) — [SUR TON HÔTE]

### 1.1 SG Redis (6379 + cluster bus 16379)

```bash
SG=redis-cluster-sg
openstack security group show "$SG" >/dev/null 2>&1 || \
  openstack security group create "$SG" --description "Redis Cluster (client 6379 + intra 6379/16379)"

SG_ID=$(openstack security group show -c id -f value "$SG")
echo "SG Redis: $SG ($SG_ID)"

# Clients IPv4 -> 6379
openstack security group rule create --ingress --ethertype IPv4 --protocol tcp --dst-port 6379 \
  --remote-ip 10.20.0.0/24 "$SG" 2>/dev/null || true

# Clients IPv6 -> 6379
openstack security group rule create --ingress --ethertype IPv6 --protocol tcp --dst-port 6379 \
  --remote-ip fd00:20::/64 "$SG" 2>/dev/null || true

# Intra-cluster IPv4 -> 6379 + 16379 (bus)
openstack security group rule create --ingress --ethertype IPv4 --protocol tcp --dst-port 6379 \
  --remote-group "$SG_ID" "$SG" 2>/dev/null || true
openstack security group rule create --ingress --ethertype IPv4 --protocol tcp --dst-port 16379 \
  --remote-group "$SG_ID" "$SG" 2>/dev/null || true

# Intra-cluster IPv6 -> 6379 + 16379
openstack security group rule create --ingress --ethertype IPv6 --protocol tcp --dst-port 6379 \
  --remote-group "$SG_ID" "$SG" 2>/dev/null || true
openstack security group rule create --ingress --ethertype IPv6 --protocol tcp --dst-port 16379 \
  --remote-group "$SG_ID" "$SG" 2>/dev/null || true

echo "Rules SG Redis:"
openstack security group rule list "$SG"
```

### 1.2 SG SSH public (réutilisable) — ⚠️ Internet

> ⚠️ `0.0.0.0/0` = SSH ouvert Internet. Idéalement réservé au bastion / admin (`redis-01`).

```bash
SSH_SG=ssh-admin
openstack security group show "$SSH_SG" >/dev/null 2>&1 || \
  openstack security group create "$SSH_SG" --description "SSH admin (IPv4/IPv6) - reusable"

openstack security group rule create --ingress --ethertype IPv4 --protocol tcp --dst-port 22 \
  --remote-ip 0.0.0.0/0 "$SSH_SG" 2>/dev/null || true

openstack security group rule create --ingress --ethertype IPv6 --protocol tcp --dst-port 22 \
  --remote-ip ::/0 "$SSH_SG" 2>/dev/null || true

echo "Rules SG SSH public:"
openstack security group rule list "$SSH_SG"
```

### 1.3 SG SSH interne (entre nœuds via `oa-net`)

```bash
SG_INT=ssh-internal
openstack security group show "$SG_INT" >/dev/null 2>&1 || \
  openstack security group create "$SG_INT" --description "SSH only from oa-net"

openstack security group rule create --ingress --ethertype IPv4 --protocol tcp --dst-port 22 \
  --remote-ip 10.20.0.0/24 "$SG_INT" 2>/dev/null || true

openstack security group rule create --ingress --ethertype IPv6 --protocol tcp --dst-port 22 \
  --remote-ip fd00:20::/64 "$SG_INT" 2>/dev/null || true

echo "Rules SG SSH interne:"
openstack security group rule list "$SG_INT"
```

---

## 2) Groupe d'instances (soft‑anti‑affinity) — [SUR TON HÔTE]

> `anti-affinity` strict peut bloquer s'il n'y a pas assez d'hôtes. `soft-anti-affinity` répartit "au mieux" sans bloquer.

```bash
openstack server group show redis-cluster >/dev/null 2>&1 || \
  openstack server group create --policy soft-anti-affinity redis-cluster

openstack server group list | grep redis-cluster
```

---

## 3) Cloud-init (Debian 12 + Redis Cluster + AOF) — [SUR TON HÔTE]

Crée `redis-cloudinit.yml` :

> Note : ce cloud-init installe aussi **Grafana Alloy** (monitoring), mais le service reste **désactivé** tant que les certs mTLS + le secret Redis ne sont pas poussés (voir étape 8.3).

```bash
cat > redis-cloudinit.yml <<'YAML'
#cloud-config
package_update: true
packages:
  - redis-server
  - redis-tools

write_files:
  - path: /etc/sysctl.d/99-redis.conf
    content: |
      vm.overcommit_memory = 1
      net.core.somaxconn = 1024

  - path: /etc/systemd/system/disable-thp.service
    content: |
      [Unit]
      Description=Disable Transparent Huge Pages (THP)
      After=network.target

      [Service]
      Type=oneshot
      ExecStart=/bin/sh -c 'echo never > /sys/kernel/mm/transparent_hugepage/enabled || true; echo never > /sys/kernel/mm/transparent_hugepage/defrag || true'
      RemainAfterExit=yes

      [Install]
      WantedBy=multi-user.target

  - path: /usr/local/sbin/install-alloy.sh
    permissions: '0755'
    content: |
      #!/bin/bash
      set -euo pipefail

      # --- Install Alloy (Grafana repo) ---
      apt-get update
      apt-get install -y gpg wget ca-certificates curl

      install -d -m 0755 /etc/apt/keyrings
      wget -qO /etc/apt/keyrings/grafana.asc https://apt.grafana.com/gpg-full.key
      chmod 0644 /etc/apt/keyrings/grafana.asc
      echo "deb [signed-by=/etc/apt/keyrings/grafana.asc] https://apt.grafana.com stable main" > /etc/apt/sources.list.d/grafana.list

      apt-get update
      apt-get install -y alloy

      # --- Prepare dirs for certs & secrets (safe: content pushed later, not in cloud-init) ---
      install -d -m 0750 /etc/alloy/certs /etc/alloy/secrets

      # --- Alloy config (Redis + node exporter -> OTLP mTLS) ---
      # NOTE: relies on:
      #   /etc/alloy/certs/agent.crt
      #   /etc/alloy/certs/agent.key
      #   /etc/alloy/secrets/redis_password
      cat > /etc/alloy/config.alloy <<'ALLOY'
      logging {
        level = "warn"
      }

      otelcol.processor.batch "main" {
        output {
          logs    = [otelcol.exporter.otlp.to_central.input]
          traces  = [otelcol.exporter.otlp.to_central.input]
          metrics = [otelcol.exporter.otlp.to_central.input]
        }
      }

      otelcol.exporter.otlp "to_central" {
        client {
          endpoint = "telemetry.oagenda.com:443"
          tls {
            cert_file   = "/etc/alloy/certs/agent.crt"
            key_file    = "/etc/alloy/certs/agent.key"
            server_name = "telemetry.oagenda.com"
          }
        }
      }

      // Bridge Prometheus -> OTLP -> central
      otelcol.receiver.prometheus "bridge" {
        output {
          metrics = [otelcol.processor.batch.main.input]
        }
      }

      // Redis -> Prometheus -> OTLP
      prometheus.exporter.redis "integrations_redis_exporter" {
        redis_addr          = "127.0.0.1:6379"
        redis_password_file = "/etc/alloy/secrets/redis_password"
        is_cluster          = true
      }

      discovery.relabel "integrations_redis_exporter" {
        targets = prometheus.exporter.redis.integrations_redis_exporter.targets

        rule {
          target_label = "job"
          replacement  = "integrations/redis_exporter"
        }

        rule {
          target_label = "instance"
          replacement  = constants.hostname
        }
      }

      prometheus.scrape "integrations_redis_exporter" {
        targets         = discovery.relabel.integrations_redis_exporter.output
        forward_to      = [otelcol.receiver.prometheus.bridge.receiver]
        job_name        = "integrations/redis_exporter"
        scrape_interval = "15s"
      }

      // Unix -> Prometheus -> OTLP
      prometheus.exporter.unix "node" {
        include_exporter_metrics = true
        disable_collectors       = ["mdadm"]
      }

      discovery.relabel "node" {
        targets = prometheus.exporter.unix.node.targets

        rule {
          target_label = "job"
          replacement  = "integrations/node_exporter"
        }

        rule {
          target_label = "instance"
          replacement  = constants.hostname
        }
      }

      prometheus.scrape "node" {
        clustering { enabled = false }

        targets = array.concat(
          discovery.relabel.node.output,
          [{
            job         = "alloy",
            instance    = constants.hostname,
            __address__ = "127.0.0.1:12345",
          }],
        )

        forward_to      = [otelcol.receiver.prometheus.bridge.receiver]
        scrape_interval = "15s"
      }
      ALLOY

      # Enable Alloy self-metrics endpoint on 127.0.0.1:12345 (used by the scrape above)
      cat > /etc/default/alloy <<'DEFAULTS'
      CUSTOM_ARGS="--server.http.listen-addr=127.0.0.1:12345"
      CONFIG_FILE="/etc/alloy/config.alloy"
      DEFAULTS

      # SAFE mode: do not start Alloy until certs + redis_password are pushed.
      systemctl stop alloy || true
      systemctl disable alloy || true

  - path: /usr/local/sbin/configure-redis-cluster.sh
    permissions: '0755'
    content: |
      #!/bin/bash
      set -euo pipefail

      IFACE=$(ip route show default | awk '{print $5; exit}')
      IP4=$(ip -4 addr show dev "$IFACE" | awk '/inet /{print $2}' | cut -d/ -f1 | head -n1)

      CONF="/etc/redis/redis.conf"
      cp -a "$CONF" "${CONF}.bak.$(date +%s)" || true

      # Remplacements robustes (Debian/Ubuntu)
      sed -i \
        -e 's/^bind .*/bind 0.0.0.0/' \
        -e 's/^protected-mode .*/protected-mode no/' \
        -e 's/^port .*/port 6379/' \
        -e 's/^#\? cluster-enabled .*/cluster-enabled yes/' \
        -e 's/^#\? cluster-config-file .*/cluster-config-file nodes.conf/' \
        -e 's/^#\? cluster-node-timeout .*/cluster-node-timeout 5000/' \
        -e 's/^#\? appendonly .*/appendonly yes/' \
        -e 's/^#\? appendfsync .*/appendfsync everysec/' \
        -e 's/^#\? supervised .*/supervised systemd/' \
        "$CONF"

      # Annonce (évite l'auto-détection foireuse en cloud)
      # Note : si accès externe requis, cluster-announce-ip sera mis à jour
      # avec la Floating IP à l'étape 5.3 (CONFIG SET + CONFIG REWRITE)
      grep -q '^cluster-announce-ip ' "$CONF"       || echo "cluster-announce-ip $IP4" >> "$CONF"
      grep -q '^cluster-announce-port ' "$CONF"     || echo "cluster-announce-port 6379" >> "$CONF"
      grep -q '^cluster-announce-bus-port ' "$CONF" || echo "cluster-announce-bus-port 16379" >> "$CONF"

      # maxmemory dynamique : RAM − 2.5 Go de réserve (OS + Alloy + fork AOF), plancher à 50%
      TOTAL_KB=$(grep MemTotal /proc/meminfo | awk '{print $2}')
      TOTAL_BYTES=$(( TOTAL_KB * 1024 ))
      RESERVE=$(( 2560 * 1024 * 1024 ))  # 2.5 Go
      FLOOR=$(( TOTAL_BYTES / 2 ))       # 50% minimum
      MAX=$(( TOTAL_BYTES - RESERVE ))
      MAXMEM=$(( MAX > FLOOR ? MAX : FLOOR ))
      grep -q '^maxmemory ' "$CONF"        && sed -i "s/^maxmemory .*/maxmemory $MAXMEM/" "$CONF" || echo "maxmemory $MAXMEM" >> "$CONF"
      grep -q '^maxmemory-policy ' "$CONF" || echo "maxmemory-policy noeviction" >> "$CONF"

      sysctl --system
      systemctl daemon-reload
      systemctl enable --now disable-thp.service
      systemctl enable --now redis-server
      systemctl restart redis-server

runcmd:
  - [bash, -lc, "/usr/local/sbin/install-alloy.sh"]
  - [bash, -lc, "/usr/local/sbin/configure-redis-cluster.sh"]
YAML
```

---

## 4) Créer les 6 instances — [SUR TON HÔTE]

> `ssh-admin` uniquement sur `redis-01`. `ssh-internal` sur tous (utile pour admin interne).
> Keypair : `redis-cluster`.

```bash
IMAGE="Debian 12 bookworm"
FLAVOR="a2-ram4-disk20-perf1"
NET="oa-net"
SG_REDIS="redis-cluster-sg"
SG_SSH_PUBLIC="ssh-admin"
SG_SSH_INTERNAL="ssh-internal"
SERVER_GROUP="redis-cluster"
KEYPAIR="redis-cluster"

for i in $(seq -w 01 06); do
  NAME="redis-${i}"
  SG_ARGS=(--security-group "$SG_REDIS" --security-group "$SG_SSH_INTERNAL")
  if [ "$i" = "01" ]; then SG_ARGS+=(--security-group "$SG_SSH_PUBLIC"); fi

  echo "Creating $NAME..."
  openstack server create "$NAME" \
    --image "$IMAGE" \
    --flavor "$FLAVOR" \
    --network "$NET" \
    "${SG_ARGS[@]}" \
    --key-name "$KEYPAIR" \
    --server-group "$SERVER_GROUP" \
    --user-data redis-cloudinit.yml
done

echo "Waiting for ACTIVE..."
openstack server list --name redis-
```

**Vérif :** Tous les status doivent être `ACTIVE` :

```bash
openstack server list --name redis-
```

---

## 5) Floating IPs — [SUR TON HÔTE]

> **⚠️ Section optionnelle** : nécessaire uniquement si les clients Redis sont **hors du réseau `oa-net`**.
> Quand tous les clients seront sur le même réseau privé, tu pourras retirer les Floating IPs
> des nœuds redis-02 à redis-06, remettre les `cluster-announce-ip` sur les IPs privées,
> et ne garder la Floating IP que sur redis-01 (bastion SSH).

### 5.1 Créer et assigner une Floating IP par nœud

```bash
EXT_NET="ext-floating1"

for i in $(seq -w 01 06); do
  NAME="redis-${i}"
  SERVER_ID=$(openstack server show -f value -c id "$NAME")
  FIP=$(openstack floating ip create -c floating_ip_address -f value "$EXT_NET")
  openstack server add floating ip "$SERVER_ID" "$FIP"
  echo "$NAME ($SERVER_ID) -> $FIP"
done

# Vérifier les adresses
openstack server list --name redis- -c Name -c Networks
```

Note les Floating IPs — tu en auras besoin pour l'étape 5.3.

### 5.2 Ouvrir le port 6379 depuis l'extérieur (security group)

> ⚠️ Restreindre aux IPs sources connues si possible. L'exemple ci-dessous est ouvert à Internet.
> À remplacer par `--remote-ip <IP_SOURCE>/32` en production.

```bash
SG="redis-cluster-sg"

# Port client 6379 depuis l'extérieur (IPv4)
openstack security group rule create --ingress --ethertype IPv4 --protocol tcp --dst-port 6379 \
  --remote-ip 0.0.0.0/0 "$SG" 2>/dev/null || true

# Port cluster bus 16379 entre nœuds via Floating IPs (IPv4)
openstack security group rule create --ingress --ethertype IPv4 --protocol tcp --dst-port 16379 \
  --remote-ip 0.0.0.0/0 "$SG" 2>/dev/null || true
```

### 5.3 Mettre à jour `cluster-announce-ip` sur chaque nœud — [SUR redis-01]

Chaque nœud doit annoncer sa Floating IP pour que les redirections `MOVED` fonctionnent depuis l'extérieur.

```bash
export REDISCLI_AUTH="$REDIS_PASS"

# Associer chaque IP privée à sa Floating IP (à adapter)
declare -A FIP_MAP=(
  ["10.20.0.247"]="FIP_REDIS_01"
  ["10.20.0.197"]="FIP_REDIS_02"
  ["10.20.0.129"]="FIP_REDIS_03"
  ["10.20.0.237"]="FIP_REDIS_04"
  ["10.20.0.123"]="FIP_REDIS_05"
  ["10.20.0.116"]="FIP_REDIS_06"
)

for PRIV_IP in "${!FIP_MAP[@]}"; do
  FIP="${FIP_MAP[$PRIV_IP]}"
  echo "== $PRIV_IP -> announce $FIP =="
  redis-cli -h "$PRIV_IP" CONFIG SET cluster-announce-ip "$FIP"
  redis-cli -h "$PRIV_IP" CONFIG REWRITE
done

# Vérifier que les nœuds annoncent les bonnes IPs
redis-cli -c -h 10.20.0.247 cluster nodes

unset REDISCLI_AUTH
```

> **Retour au réseau privé** : quand les clients sont sur `oa-net`, relancer la même boucle
> en remplaçant les Floating IPs par les IPs privées (`FIP_MAP` inversée),
> puis retirer les Floating IPs des nœuds redis-02 à redis-06.

---

## 6) SSH sur `redis-01` — [SUR TON HÔTE]

### Connexion simple

```bash
ssh -o IdentitiesOnly=yes -o IdentityFile=~/.ssh/redis-cluster.pub debian@<FIP_REDIS_01>
# si besoin : ssh ... ubuntu@<FIP_REDIS_01>
```

### Connexion via jump + 1Password (ta méthode)

> Exemple : se connecter à `10.20.0.254` (redis-02) via un bastion `83.228.234.116` (redis-01).

```bash
ssh \
  -o IdentitiesOnly=yes -o IdentityFile=~/.ssh/redis-cluster.pub \
  -o ProxyCommand="ssh -o IdentitiesOnly=yes -o IdentityFile=~/.ssh/redis-cluster.pub -W %h:%p debian@83.228.234.116" \
  debian@10.20.0.254
```

### Variante via `~/.ssh/config` (1Password + ProxyJump)

Ajoute ceci (exemple) :

```sshconfig
Host redis-01
  HostName 83.228.234.116
  User debian
  Port 22
  IdentityFile ~/.ssh/redis-cluster.pub
  IdentitiesOnly yes
```

Puis tu peux faire :

```bash
ssh -o ProxyJump=redis-01 -o IdentitiesOnly=yes -o IdentityFile=~/.ssh/redis-cluster.pub debian@10.20.0.254
```

---

## 7) Init du cluster Redis — [SUR redis-01]

### 7.1 Récupérer la liste d'IPs privées (pratique)

Depuis ton hôte, tu peux copier les IPs. Sinon ici : remplace manuellement.

### 7.2 Vérifier que Redis répond sur chaque instance

```bash
NODES=(10.20.0.247 10.20.0.197 10.20.0.129 10.20.0.237 10.20.0.123 10.20.0.116)

for ip in "${NODES[@]}"; do
  echo "== $ip =="
  redis-cli -h "$ip" -p 6379 ping
done
```

### 7.3 Vérifier le "cluster bus" (16379) — installer `nc` si besoin

```bash
sudo apt-get update
sudo apt-get install -y netcat-openbsd

for ip in "${NODES[@]}"; do
  echo "== $ip ports =="
  nc -zv -w2 "$ip" 6379  && echo "6379 OK"  || echo "6379 FAIL"
  nc -zv -w2 "$ip" 16379 && echo "16379 OK" || echo "16379 FAIL"
done
```

### 7.4 Créer le cluster (3 masters + 3 replicas)

```bash
yes yes | redis-cli --cluster create \
  10.20.0.247:6379 \
  10.20.0.197:6379 \
  10.20.0.129:6379 \
  10.20.0.237:6379 \
  10.20.0.123:6379 \
  10.20.0.116:6379 \
  --cluster-replicas 1
```

### 7.5 Vérifier l'état du cluster

```bash
redis-cli -c -h 10.20.0.247 cluster info
redis-cli -c -h 10.20.0.247 cluster nodes
redis-cli --cluster check 10.20.0.247:6379
```

### 7.6 Petit test fonctionnel (redirections MOVED)

```bash
redis-cli -c -h 10.20.0.247 set test:hello world
redis-cli -c -h 10.20.0.237 get test:hello
```

---

## 8) Activer l'auth Redis (requirepass + masterauth) — [SUR redis-01]

### 8.1 Générer un mot de passe fort

```bash
REDIS_PASS="$(openssl rand -base64 36)"
echo "$REDIS_PASS"
```

### 8.2 Appliquer sur tous les nœuds + persister (CONFIG REWRITE)

Ordre important :

1. `masterauth` partout (pour ne pas casser la réplication)
2. `requirepass` partout
3. `CONFIG REWRITE` avec auth (`REDISCLI_AUTH`)

```bash
NODES=(10.20.0.247 10.20.0.197 10.20.0.129 10.20.0.237 10.20.0.123 10.20.0.116)

# 1) masterauth
for ip in "${NODES[@]}"; do
  echo "masterauth -> $ip"
  redis-cli -h "$ip" CONFIG SET masterauth "$REDIS_PASS"
done

# 2) requirepass
for ip in "${NODES[@]}"; do
  echo "requirepass -> $ip"
  redis-cli -h "$ip" CONFIG SET requirepass "$REDIS_PASS"
done

# 3) rewrite + ping + checks (auth requise maintenant)
export REDISCLI_AUTH="$REDIS_PASS"

for ip in "${NODES[@]}"; do
  echo "rewrite -> $ip"
  redis-cli -h "$ip" CONFIG REWRITE
done

for ip in "${NODES[@]}"; do
  echo "ping -> $ip"
  redis-cli -h "$ip" PING
done

echo "cluster info/check"
redis-cli -c -h 10.20.0.247 cluster info
redis-cli --cluster check 10.20.0.247:6379

unset REDISCLI_AUTH
```

### 8.3 Activer Alloy sur tous les nœuds Redis (certs + secret hors cloud-init) — [SUR TON HÔTE]

> On ne met **ni le mot de passe Redis** ni les **certificats mTLS** dans le `user-data` cloud-init.
> Cloud-init a seulement **installé Alloy** et écrit `/etc/alloy/config.alloy`, mais le service est **désactivé** tant que les secrets ne sont pas poussés.

Pré-requis :

- Tu as un couple de fichiers mTLS pour l'agent : `agent.crt` et `agent.key`
- Tu as le `REDIS_PASS` (copié depuis l'étape 8.1)
- Tes nœuds Redis sont joignables en SSH via `redis-01` (ProxyJump / 1Password)

Sur ton hôte :

```bash
# IPs privées des nœuds Redis (à adapter)
NODES=(10.20.0.247 10.20.0.197 10.20.0.129 10.20.0.237 10.20.0.123 10.20.0.116)

# Chemins locaux vers tes certs mTLS (à adapter)
AGENT_CRT="./agent.crt"
AGENT_KEY="./agent.key"

# Fichier temporaire pour pousser le secret Redis (évite les soucis de quoting)
TMP_PASS="$(mktemp)"
printf '%s' "$REDIS_PASS" > "$TMP_PASS"
chmod 600 "$TMP_PASS"

for ip in "${NODES[@]}"; do
  echo "== Provision Alloy on $ip =="

  # 1) Push certs + secret to /tmp (rename to generic names)
  scp -o ProxyJump=redis-01 -o IdentitiesOnly=yes -o IdentityFile=~/.ssh/redis-cluster.pub "$AGENT_CRT" debian@"$ip":/tmp/agent.crt
  scp -o ProxyJump=redis-01 -o IdentitiesOnly=yes -o IdentityFile=~/.ssh/redis-cluster.pub "$AGENT_KEY" debian@"$ip":/tmp/agent.key
  scp -o ProxyJump=redis-01 -o IdentitiesOnly=yes -o IdentityFile=~/.ssh/redis-cluster.pub "$TMP_PASS"  debian@"$ip":/tmp/

  # 2) Install them in /etc/alloy + enable/start Alloy
  ssh -o ProxyJump=redis-01 -o IdentitiesOnly=yes -o IdentityFile=~/.ssh/redis-cluster.pub debian@"$ip" "sudo bash -lc '
      install -d -m 0750 /etc/alloy/certs /etc/alloy/secrets

      install -m 0640 /tmp/agent.crt /etc/alloy/certs/agent.crt
      install -m 0640 /tmp/agent.key /etc/alloy/certs/agent.key
      install -m 0640 /tmp/$(basename "$TMP_PASS") /etc/alloy/secrets/redis_password

      # Laisser Alloy lire les secrets
      chown -R root:alloy /etc/alloy/certs /etc/alloy/secrets || true

      systemctl enable --now alloy
      systemctl restart alloy

      systemctl is-active alloy && echo "alloy: active" || (echo "alloy: NOT active"; exit 1)
      curl -fsS http://127.0.0.1:12345/metrics >/dev/null && echo "alloy metrics: OK" || echo "alloy metrics: no http endpoint"
    '"
done

rm -f "$TMP_PASS"
```

Vérifier côté Redis (une fois Alloy actif) :

- Tu dois voir des métriques `integrations/redis_exporter` et `integrations/node_exporter` remonter vers `telemetry.oagenda.com`.

> Astuce : pour éviter de passer `-a` (warning), on utilise `REDISCLI_AUTH`.

---

## 9) AOF (données à conserver) — vérif — [SUR redis-01]

Le cloud-init active déjà :

- `appendonly yes`
- `appendfsync everysec`

Vérifier sur tous les nœuds :

```bash
export REDISCLI_AUTH="$REDIS_PASS"
for ip in "${NODES[@]}"; do
  echo "== $ip =="
  redis-cli -h "$ip" CONFIG GET appendonly appendfsync
done
unset REDISCLI_AUTH
```

---

## 10) Scalabilité manuelle

### 10.1 Up : ajouter 2 nœuds (1 master + 1 replica) — [SUR redis-01]

Préparer :

- Créer `redis-07` et `redis-08` (mêmes SG, cloud-init, keypair)
- Récupérer leurs IPs privées : `NEW_MASTER`, `NEW_REPLICA`
- Choisir un seed `SEED` (un master existant)

```bash
export REDISCLI_AUTH="$REDIS_PASS"

SEED="10.20.0.247"
NEW_MASTER="10.20.0.X7"
NEW_REPLICA="10.20.0.X8"

echo "Add master: $NEW_MASTER"
redis-cli --cluster add-node "${NEW_MASTER}:6379" "${SEED}:6379"
redis-cli --cluster check "${SEED}:6379"

echo "Rebalance (use empty masters)"
redis-cli --cluster rebalance "${SEED}:6379" --cluster-use-empty-masters --cluster-yes
redis-cli --cluster check "${SEED}:6379"

MASTER_ID=$(redis-cli -c -h "$SEED" cluster nodes \
  | awk -v ip="$NEW_MASTER" '$2 ~ ip":6379" && $3 ~ /master/ {print $1; exit}')

echo "NEW_MASTER_ID=$MASTER_ID"

echo "Add replica: $NEW_REPLICA -> master $MASTER_ID"
redis-cli --cluster add-node "${NEW_REPLICA}:6379" "${SEED}:6379" \
  --cluster-slave --cluster-master-id "$MASTER_ID"

redis-cli --cluster check "${SEED}:6379"
unset REDISCLI_AUTH
```

### 10.2 Down : retirer 2 nœuds (1 replica + 1 master) — [SUR redis-01]

```bash
export REDISCLI_AUTH="$REDIS_PASS"

SEED="10.20.0.247"
OLD_MASTER="10.20.0.122"
OLD_REPL="10.20.0.85"

MASTER_ID=$(redis-cli -c -h "$SEED" cluster nodes | awk -v ip="$OLD_MASTER" '$2 ~ ip":6379" {print $1; exit}')
REPL_ID=$(redis-cli -c -h "$SEED" cluster nodes | awk -v ip="$OLD_REPL"   '$2 ~ ip":6379" {print $1; exit}')

echo "MASTER_ID=$MASTER_ID"
echo "REPL_ID=$REPL_ID"

echo "Remove replica first"
redis-cli --cluster del-node "${SEED}:6379" "$REPL_ID"
redis-cli -c -h "$SEED" cluster nodes | grep -F "$OLD_REPL" || echo "replica removed"

echo "Drain slots from master (weight=0)"
redis-cli --cluster rebalance "${SEED}:6379" --cluster-weight "${MASTER_ID}=0" --cluster-yes

echo "Check master line (must show no slot ranges at the end)"
redis-cli -c -h "$SEED" cluster nodes | awk -v id="$MASTER_ID" '$1==id{print}'

echo "Remove master"
redis-cli --cluster del-node "${SEED}:6379" "$MASTER_ID"

redis-cli --cluster check "${SEED}:6379"
unset REDISCLI_AUTH
```

### 10.3 Si on veut garder les nœuds retirés pour plus tard

⚠️ À faire **sur les nœuds retirés** (ou via SSH/jump). Ça stoppe Redis et supprime l'état local (risque de perte si tu voulais conserver les données).

```bash
sudo systemctl stop redis-server

# Optionnel : nettoyer l'état local pour pouvoir les réutiliser comme nœuds "neufs"
sudo rm -f /var/lib/redis/nodes.conf
sudo rm -f /var/lib/redis/appendonly.aof /var/lib/redis/dump.rdb
```

---

## 11) Vérifs rapides (troubleshooting)

### 11.1 Vérifier les ports Redis depuis `redis-01`

```bash
sudo apt-get update && sudo apt-get install -y netcat-openbsd
for ip in "${NODES[@]}"; do
  nc -zv -w2 "$ip" 6379  || echo "Port 6379 FAIL on $ip"
  nc -zv -w2 "$ip" 16379 || echo "Port 16379 FAIL on $ip"
done
```

### 11.2 Vérifier l'auth sans afficher `-a`

```bash
export REDISCLI_AUTH="$REDIS_PASS"
redis-cli -c -h 10.20.0.247 cluster info
redis-cli --cluster check 10.20.0.247:6379
unset REDISCLI_AUTH
```
