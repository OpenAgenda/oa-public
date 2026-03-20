# Tunnel WireGuard Jelastic → OpenStack

## Contexte

Le routeur Neutron d'Infomaniak (floating IP) drop des SYN TCP (~3% de perte).
Un tunnel WireGuard UDP entre Jelastic et OpenStack contourne ce problème.

## Architecture

Chaque noeud Jelastic a son propre tunnel WireGuard direct vers la VM admin.
L'approche gateway (VPS intermédiaire) ne fonctionne pas car Jelastic utilise
OpenVZ/venet qui ne supporte pas le forwarding IP entre conteneurs.

```
noeud Jelastic              ── UDP 51821 ──►  admin VM (OpenStack)
 wg1: 10.98.0.X                              wg1: 10.98.0.1
 wireguard-go (userspace)                    kernel WireGuard
                                             MASQUERADE → enp3s0
                                              │
                                         oa-net 10.20.0.0/24
                                          ┌────┴────┐
                                        mysql     redis-*
                                       .208:3306  .xxx:6379
```

## IPs des services

| Service  | IP privée (via tunnel) | Port |
| -------- | ---------------------- | ---- |
| MySQL    | 10.20.0.208            | 3306 |
| Redis-01 | 10.20.0.247            | 6379 |
| Redis-02 | 10.20.0.197            | 6379 |
| Redis-03 | 10.20.0.129            | 6379 |
| Redis-04 | 10.20.0.237            | 6379 |
| Redis-05 | 10.20.0.123            | 6379 |
| Redis-06 | 10.20.0.116            | 6379 |

## Installation du serveur (admin VM)

### 1. Installer WireGuard

```bash
ssh admin
sudo apt-get install -y wireguard-tools
```

### 2. Générer la clé serveur

```bash
wg genkey | sudo tee /etc/wireguard/server.key | wg pubkey | sudo tee /etc/wireguard/server.pub
sudo chmod 600 /etc/wireguard/server.key
```

### 3. Créer la config `/etc/wireguard/wg1.conf`

```ini
[Interface]
Address = 10.98.0.1/24
ListenPort = 51821
PrivateKey = <contenu de /etc/wireguard/server.key>

PostUp = sysctl -w net.ipv4.ip_forward=1; iptables -t nat -A POSTROUTING -s 10.98.0.0/24 -o enp3s0 -j MASQUERADE; iptables -A FORWARD -i wg1 -o enp3s0 -j ACCEPT; iptables -A FORWARD -i enp3s0 -o wg1 -m state --state RELATED,ESTABLISHED -j ACCEPT
PostDown = iptables -t nat -D POSTROUTING -s 10.98.0.0/24 -o enp3s0 -j MASQUERADE; iptables -D FORWARD -i wg1 -o enp3s0 -j ACCEPT; iptables -D FORWARD -i enp3s0 -o wg1 -m state --state RELATED,ESTABLISHED -j ACCEPT

# Les peers sont ajoutés dynamiquement avec wg set + wg-quick save
```

Le PostUp fait 3 choses :

- Active le forwarding IP
- MASQUERADE le traffic tunnel vers oa-net (les services voient l'IP admin, pas l'IP tunnel)
- Autorise le forwarding bidirectionnel entre wg1 et enp3s0

### 4. Démarrer et activer au boot

```bash
sudo systemctl enable --now wg-quick@wg1
```

### 5. Security group OpenStack

Créer un security group `wireguard-sg` autorisant UDP 51821 depuis le range Jelastic :

```bash
openstack security group create wireguard-sg --description "WireGuard tunnel UDP 51821"
openstack security group rule create wireguard-sg --protocol udp --dst-port 51821 --remote-ip 185.172.100.0/24
openstack server add security group admin wireguard-sg
```

## Ajout d'un nouveau noeud client

**Prérequis** : le noeud doit tourner sous **Ubuntu 24.04** (les autres OS
sur Jelastic OpenVZ posent des problèmes de compatibilité wireguard-go).

Le script `/tmp/wg-setup.sh` automatise les étapes 1 à 4 :

```bash
#!/bin/bash
set -e

WG_IP=$1
SERVER_PUBKEY="<clé publique du serveur, voir /etc/wireguard/server.pub sur admin>"
SERVER_ENDPOINT="83.228.201.78:51821"

# 1. Installer wireguard
apt-get update -qq
apt-get install -y -qq wireguard-tools wireguard-go

# 2. Générer la clé et créer la config
PRIVKEY=$(wg genkey)
PUBKEY=$(echo $PRIVKEY | wg pubkey)

cat > /etc/wireguard/wg1.conf << EOF
[Interface]
Address = ${WG_IP}/24
PrivateKey = ${PRIVKEY}

[Peer]
PublicKey = ${SERVER_PUBKEY}
Endpoint = ${SERVER_ENDPOINT}
AllowedIPs = 10.20.0.0/24, 10.98.0.1/32
PersistentKeepalive = 25
EOF
chmod 600 /etc/wireguard/wg1.conf

# 3. Override systemd pour wireguard-go (OpenVZ, pas de module kernel)
mkdir -p /etc/systemd/system/wg-quick@wg1.service.d
echo -e '[Service]\nEnvironment=WG_QUICK_USERSPACE_IMPLEMENTATION=wireguard-go' \
  > /etc/systemd/system/wg-quick@wg1.service.d/override.conf
systemctl daemon-reload
systemctl enable wg-quick@wg1

# 4. Afficher la clé publique (pour l'enregistrement côté serveur)
echo "PUBKEY:${PUBKEY}"
```

### Utilisation

```bash
# Copier le script et l'exécuter sur le noeud (X = prochaine IP libre)
scp /tmp/wg-setup.sh <NODE>-2943@infomaniak:/tmp/
ssh <NODE>-2943@infomaniak "sudo bash /tmp/wg-setup.sh 10.98.0.X"
# → note la PUBKEY affichée

# Démarrer le tunnel sur le noeud
ssh <NODE>-2943@infomaniak "sudo WG_QUICK_USERSPACE_IMPLEMENTATION=wireguard-go wg-quick up wg1"

# Enregistrer le peer côté serveur
ssh admin "sudo wg set wg1 peer '<PUBKEY>' allowed-ips 10.98.0.X/32 && sudo wg-quick save wg1"

# Vérifier
ssh <NODE>-2943@infomaniak "ping -c 3 10.98.0.1"
ssh <NODE>-2943@infomaniak "timeout 3 bash -c 'echo > /dev/tcp/10.20.0.208/3306'" && echo 'mysql OK'
ssh <NODE>-2943@infomaniak "timeout 3 bash -c 'echo > /dev/tcp/10.20.0.247/6379'" && echo 'redis OK'
```

## Peers actuels

| Noeud           | SSH                          | wg1 IP     |
| --------------- | ---------------------------- | ---------- |
| admin (serveur) | `ssh admin`                  | 10.98.0.1  |
| scripts 184320  | `ssh 184320-2943@infomaniak` | 10.98.0.2  |
| web-blue 128244 | `ssh 128244-2943@infomaniak` | 10.98.0.3  |
| web-blue 143153 | `ssh 143153-2943@infomaniak` | 10.98.0.4  |
| web-blue 128233 | `ssh 128233-2943@infomaniak` | 10.98.0.5  |
| web-blue 173168 | `ssh 173168-2943@infomaniak` | 10.98.0.6  |
| web-blue 128237 | `ssh 128237-2943@infomaniak` | 10.98.0.7  |
| web-blue 133732 | `ssh 133732-2943@infomaniak` | 10.98.0.8  |
| web-blue 135384 | `ssh 135384-2943@infomaniak` | 10.98.0.9  |
| tasks 128375    | `ssh 128375-2943@infomaniak` | 10.98.0.10 |

## Configuration MySQL via tunnel

Lors du passage de MySQL sur l'IP tunnel, ajuster l'ecosystem.config.js :

```
MYSQL_HOST=10.20.0.208
MYSQL_SSL_VERIFY=1
MYSQL_SSL_VERIFY_IDENTITY=0
```

`MYSQL_SSL_VERIFY_IDENTITY` doit être à `0` car le certificat SSL est émis
pour la floating IP / le hostname, pas pour l'IP privée 10.20.0.208.
Le cert client SSL reste nécessaire : c'est lui qui authentifie l'utilisateur MySQL
(sans SSL, MySQL refuse la connexion avec `Access denied`).

## Contraintes Jelastic (OpenVZ/venet)

- **Pas de module kernel WireGuard** : les conteneurs partagent le kernel de l'hôte, `ip link add type wireguard` échoue → `wireguard-go` (userspace) obligatoire.
- **Pas de gateway/routage inter-conteneurs** : venet ne délivre que les paquets dont la destination est l'IP du conteneur. Chaque noeud a besoin de son propre tunnel.
- **Ubuntu 24.04 requis** : les paquets `wireguard-tools` + `wireguard-go` fonctionnent out of the box. Les autres OS (Ubuntu 20.04, AlmaLinux 9, CentOS 7) ont des problèmes de compatibilité de versions.

## Commandes utiles

```bash
# Vérifier le tunnel
ssh admin "sudo wg show wg1"
ssh <NODE>-2943@infomaniak "sudo wg show wg1"

# Redémarrer le tunnel
ssh admin "sudo systemctl restart wg-quick@wg1"
ssh <NODE>-2943@infomaniak "sudo systemctl restart wg-quick@wg1"

# Tester la connectivité
ssh <NODE>-2943@infomaniak "ping -c 3 10.98.0.1"
ssh <NODE>-2943@infomaniak "timeout 3 bash -c 'echo > /dev/tcp/10.20.0.208/3306'"  # mysql
ssh <NODE>-2943@infomaniak "timeout 3 bash -c 'echo > /dev/tcp/10.20.0.247/6379'"  # redis
```

## Performances mesurées

1000 connexions TCP vers MySQL via le tunnel :

```
Min: 3ms | Max: 8ms | Avg: 3ms | N: 1000 | Pertes: 0%
```

100 requêtes `SELECT 1` via tunnel (MySQL avec SSL) :

```
Min: 0.6ms | Avg: 0.7ms | P50: 0.6ms | P99: 1.2ms | Max: 4.5ms
```

Comparaison avec les floating IPs :

- Baseline floating IP : ~16ms, ~3% SYN drop, retransmissions jusqu'à 4.6s
- Via tunnel WG : ~3ms, 0% perte
