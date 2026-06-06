# Déploiement du serveur MCP en production (VPS KVM)

Guide pour déployer le serveur MCP `@openagenda/mcp` en mode **hosted** (public,
multi-tenant) sur un VPS neuf, tel que mis en place sur `mcp-ovh`
(`https://mcp.openagenda.com`).

## Pourquoi un VPS dédié avec KVM

En mode `hosted`, le MCP exécute du **code JavaScript soumis par des inconnus**
sur internet. La frontière de sécurité est un **micro-VM microsandbox**
(libkrun + KVM) par exécution, avec une allowlist d'egress imposée par l'hôte.
`config.js` **fail-closed** : `OA_MCP_MODE=hosted` exige
`OA_EXECUTOR=microsandbox` + `OA_CODE_EGRESS_AUTHORITY=executor`, et refuse tout
le reste.

microsandbox a besoin de **`/dev/kvm`** (virtualisation imbriquée). Tous les
clouds ne l'exposent pas : l'**Infomaniak Public Cloud ne l'expose sur aucun
flavor**. Les **VPS OVH** l'exposent (vérifié). C'est le prérequis qui valide ou
tue tout le déploiement — on le teste en **Étape 1**.

> C'est, par nature, la charge la plus à risque de l'infra (exécution de code non
> fiable). On l'isole donc sur un **hôte dédié, hors du réseau OA** : il atteint
> l'API v3 et l'AS sur leurs endpoints **publics**, il n'a pas besoin du réseau
> interne. Une évasion éventuelle est ainsi contenue, loin de MySQL/Redis.

## Vue d'ensemble

```
Client MCP (Claude…)          VPS mcp-ovh (OVH, KVM)
┌──────────────────┐          ┌─────────────────────────────────────────┐
│ flux OAuth        │          │ nginx :443 (TLS) ─► node MCP :8904        │
│ Bearer token      │── https ─┤   (hosted, http transport)                │
│ POST /mcp         │          │     └─ microsandbox ─► µVM llrt /exécution │
└──────────────────┘          │          (egress allowlist = api host)     │
        ▲                      └─────────────────────────────────────────┘
        │ valide les tokens (JWKS) + token-exchange RFC 8693
        ▼
   AS better-auth  https://openagenda.com/api/auth
```

> **À adapter pour vous.** Ce guide contient les valeurs concrètes de `mcp-ovh` :
> hôte SSH `mcp-ovh`, utilisateur `ubuntu`, IP `37.59.99.64`, domaine
> `mcp.openagenda.com`. Remplacez-les par les vôtres. **Les secrets**
> (`OA_MCP_EXCHANGE_SECRET`, token InsightOps, clé de déploiement GitHub) sont
> dans 1Password / fournis par l'AS — ne les écrivez **jamais** en clair dans le
> dépôt. Les commandes `bash -s` ci-dessous s'exécutent **sur le VPS** (via
> `ssh mcp-ovh 'bash -s' <<'EOF' … EOF` ou en session interactive).

---

## Étape 1 — VPS, accès SSH, vérifier KVM (prérequis gating)

### 1.1 Commander le VPS + clé SSH

Commander un VPS OVH (≥ 8 vCPU / 16 Go ; `mcp-ovh` = 8 vCPU / 22 Go / 193 Go,
Ubuntu 26.04). À la commande, fournir **votre clé publique SSH** (OVH la dépose
dans `~/.ssh/authorized_keys` de l'utilisateur `ubuntu`) — sinon l'ajouter
ensuite. On suit le guide OVH
[« Sécuriser son VPS »](https://docs.ovhcloud.com/fr/guides/bare-metal-cloud/virtual-private-servers/secure-your-vps).

### 1.2 Accès depuis votre poste (`~/.ssh/config`)

Ajouter un alias dans le `~/.ssh/config` **de votre poste** (pas le VPS) pour
faire `ssh mcp-ovh` sans retenir IP/clé. Avec l'**agent SSH 1Password** (cas de
`mcp-ovh`), `IdentityFile` pointe sur la **clé publique** (`.pub`, mode `644`) :
l'agent fournit la clé privée correspondante.

```sshconfig
Host mcp-ovh
  Hostname 37.59.99.64
  User ubuntu
  Port 22
  IdentityFile ~/.ssh/mcp-ovh.pub
  IdentitiesOnly yes
```

> La clé privée reste dans 1Password (jamais sur disque) — activer l'intégration
> « SSH agent » de 1Password. Sans 1Password, pointer `IdentityFile` sur la clé
> privée classique.

Vérifier : `ssh mcp-ovh 'whoami && hostname'`.

### 1.3 Vérifier KVM (prérequis gating)

Sur le VPS, **vérifier la virtualisation imbriquée** :

```sh
ls -l /dev/kvm                                  # doit exister (crw-rw---- root kvm)
grep -oE 'vmx|svm' /proc/cpuinfo | sort -u      # doit afficher vmx (Intel) ou svm (AMD)
lscpu | grep -i virtual                         # "Virtualization: VT-x/AMD-V"
```

**Si `/dev/kvm` est absent ou aucun flag `vmx`/`svm` : STOP** — ce VPS ne peut
pas faire tourner microsandbox. Changer de gamme/provider (bare-metal garanti).

## Étape 2 — Durcir l'OS

```sh
sudo apt-get update && sudo apt-get -y upgrade
sudo apt-get install -y fail2ban
```

**fail2ban** — la jail `sshd` doit être activée explicitement. Créer
`/etc/fail2ban/jail.local` (d'après le guide OVH
[« Sécuriser son VPS »](https://docs.ovhcloud.com/fr/guides/bare-metal-cloud/virtual-private-servers/secure-your-vps)) :

```ini
[sshd]
enabled = true
filter = sshd
maxretry = 3
findtime = 5m
bantime  = 30m
```

```sh
sudo systemctl restart fail2ban
sudo fail2ban-client status sshd        # doit afficher la jail active
```

**Désactiver l'auth SSH par mot de passe.** Piège : sur les images cloud,
`PasswordAuthentication yes` est posé par `/etc/ssh/sshd_config.d/50-cloud-init.conf`,
et sshd retient la **première** valeur lue. Un drop-in `00-` est donc lu _avant_ :

```sh
sudo tee /etc/ssh/sshd_config.d/00-hardening.conf >/dev/null <<'CONF'
PasswordAuthentication no
KbdInteractiveAuthentication no
PermitRootLogin prohibit-password
CONF
sudo sshd -t && sudo systemctl reload ssh
sudo sshd -T | grep -E '^(passwordauthentication|pubkeyauthentication)'  # password=no, pubkey=yes
```

> Vérifiez qu'une **nouvelle** connexion par clé fonctionne **avant** de fermer la
> session courante.

**Firewall ufw** — ordre anti-verrouillage : autoriser le 22 **avant** d'activer.
Filet de sécurité (rollback auto si une règle vous coupe l'accès) :

```sh
sudo systemd-run --on-active=180 --unit=oa-ufw-rollback /usr/sbin/ufw --force disable
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 22/tcp comment 'ssh'
sudo ufw allow 80/tcp comment 'http'
sudo ufw allow 443/tcp comment 'https'
sudo ufw --force enable
# tester une connexion neuve, puis annuler le rollback :
sudo systemctl stop oa-ufw-rollback.timer 2>/dev/null
```

## Étape 3 — Node 24 (nvm) + yarn

```sh
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.4/install.sh | bash
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
nvm install 24                    # le MCP exige Node ≥ 24
corepack enable yarn
corepack install -g yarn@stable   # dernière version stable de yarn, en global
node -v && yarn -v                # global = yarn 4.16.x ; dans ~/oa il se pinne sur 4.5.3 (packageManager)
```

> Le binaire node vit dans `~/.nvm/versions/node/v24.x/bin/node` — chemin **figé
> par version** ; le service systemd (Étape 8) le référence en absolu.

## Étape 4 — Accès au dépôt (clé de déploiement read-only)

```sh
ssh-keygen -t ed25519 -N '' -C 'oa-mcp-deploy-ro' -f "$HOME/.ssh/oa_deploy_ed25519"
cat >> "$HOME/.ssh/config" <<'CFG'
Host github.com
  HostName github.com
  User git
  IdentityFile ~/.ssh/oa_deploy_ed25519
  IdentitiesOnly yes
CFG
chmod 600 "$HOME/.ssh/config"
cat "$HOME/.ssh/oa_deploy_ed25519.pub"   # → GitHub : OpenAgenda/oa → Settings → Deploy keys (READ-ONLY)
```

Une fois la clé ajoutée sur GitHub :

```sh
GIT_SSH_COMMAND='ssh -o StrictHostKeyChecking=accept-new' \
  git clone --depth 1 --single-branch --branch main git@github.com:OpenAgenda/oa.git "$HOME/oa"
```

## Étape 5 — Installer + builder le MCP

```sh
cd "$HOME/oa"
yarn workspaces focus @openagenda/mcp      # installe SEULEMENT le MCP + ses workspaces
yarn workspace @openagenda/mcp build       # produit dist/sdk-bundle.js
```

> **Erreur attendue et bénigne** : `@fortawesome/fontawesome-free … Invalid
authentication`. C'est une dépendance du **frontend** (registre privé
> fontawesome) que `focus` effleure ; le sous-ensemble MCP s'installe correctement
> (vérifier : `ls node_modules/microsandbox`, `node_modules/@openagenda/api-spec`).

**Donner l'accès `/dev/kvm` à l'utilisateur de service :**

```sh
sudo usermod -aG kvm ubuntu      # prend effet à la prochaine session/au démarrage du service
```

## Étape 6 — Image µVM llrt (distroless)

Le runtime llrt (RAM −52 %, warm start ×3 vs node-in-µVM) tourne depuis une image
distroless dédiée. **Le plus simple : réutiliser l'image publiée**, pinnée par
digest (microsandbox la pull au premier boot) :

```
openagenda/mcp-llrt@sha256:81b2242a631b31a848a7232cb523ab9aeff66f9e9a7f93b2c2ba5e4b34410d58
```

Pour la (re)construire/publier : `packages/mcp/llrt.Dockerfile` +
`packages/mcp/scripts/refresh-llrt-image.sh` (résout version llrt + digests).

## Étape 7 — Valider microsandbox sur l'hôte

Smoke de bout en bout en runtime llrt (mode local, clé factice — les checks ne
dépendent pas d'une vraie clé API). Le **premier run pull l'image** :

```sh
cd "$HOME/oa/packages/mcp"
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
OA_EXECUTOR=microsandbox OA_SANDBOX_RUNTIME=llrt OA_CODE_EGRESS_AUTHORITY=executor \
OA_MICROSANDBOX_IMAGE=openagenda/mcp-llrt@sha256:81b2242a…  \
OA_SANDBOX_MEMORY_MB=256 OA_BASE_URL=https://api.openagenda.com/v3 \
OA_API_KEY=oa_pk_smoke_dummy  node scripts/smoke.js
```

Attendu : `tools listed` ✓, `execute runs in sandbox (1+1 === 2)` ✓,
`egress blocked` ✓.

> **Piège de diag egress.** Si vous testez à la main `fetch` vers
> `api.openagenda.com/v3/agendas`, vous obtiendrez un `ECONNRESET` — **non pas**
> un bug d'allowlist : `/v3/*` **redirige (301) vers `developers.openagenda.com`**
> (v3 pas encore GA) et le `fetch` qui **suit** la redirection tape un hôte non
> autorisé → bloqué (comportement correct). Avec `redirect:'manual'` la connexion
> à l'hôte autorisé renvoie bien un statut. L'egress fonctionne ; c'est l'URL qui
> redirige hors-domaine.

Tests d'intégration complets (sur hôte KVM) : `OA_MSB_IT=1 yarn workspace @openagenda/mcp test`.

## Étape 8 — Service systemd + configuration

**Fichier d'env** `~/oa-mcp.env` (mode **600** — contient des secrets) :

```sh
cat > "$HOME/oa-mcp.env" <<'ENV'
OA_MCP_MODE=hosted
OA_EXECUTOR=microsandbox
OA_CODE_EGRESS_AUTHORITY=executor
OA_MCP_TRANSPORT=http
OA_MCP_HTTP_PORT=8904
OA_BASE_URL=https://api.openagenda.com/v3

# µVM runtime : image llrt distroless (pinnée par digest)
OA_SANDBOX_RUNTIME=llrt
OA_MICROSANDBOX_IMAGE=openagenda/mcp-llrt@sha256:81b2242a631b31a848a7232cb523ab9aeff66f9e9a7f93b2c2ba5e4b34410d58

# Capacité / empreinte (hôte 22 Go ; llrt ~75 Mio réels)
OA_SANDBOX_MEMORY_MB=256      # plafond dur du µVM (pas une réservation) ; 128 trop juste vs accumulate-all-pages
OA_MICROSANDBOX_POOL_SIZE=8   # spares warm pré-bootés
OA_MAX_CONCURRENCY=16         # exécutions simultanées max (garde-fou RAM hôte)

# OAuth — AS better-auth de prod (jwksUrl, exchangeUrl, clientId='mcp' auto-dérivés de l'issuer)
OA_OAUTH_ISSUER=https://openagenda.com/api/auth
OA_MCP_RESOURCE_URL=https://mcp.openagenda.com/mcp
OA_MCP_EXCHANGE_SECRET=__SECRET_PARTAGE_AVEC_AS__   # doit matcher la config de l'AS

# Observabilité — sinon audit log + logs opérationnels sont JETÉS (banner "no log sink")
OA_INSIGHT_OPS_TOKEN=__TOKEN_INSIGHTOPS__
ENV
chmod 600 "$HOME/oa-mcp.env"
```

> Seules `OA_OAUTH_ISSUER`, `OA_MCP_RESOURCE_URL`, `OA_MCP_EXCHANGE_SECRET` sont
> requises côté OAuth ; `jwksUrl=<issuer>/jwks`,
> `exchangeUrl=<issuer>/oauth2/token-exchange`, `clientId='mcp'` se déduisent.
> Prérequis : **l'AS de prod doit être déployé** (`…/api/auth/jwks` accessible
> publiquement) avec le client MCP + le secret de token-exchange configurés.

**Unité systemd** `/etc/systemd/system/oa-mcp.service` :

```ini
[Unit]
Description=OpenAgenda MCP server (hosted, microsandbox)
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/home/ubuntu/oa
EnvironmentFile=/home/ubuntu/oa-mcp.env
ExecStart=/home/ubuntu/.nvm/versions/node/v24.16.0/bin/node packages/mcp/src/index.js
Restart=on-failure
RestartSec=3
NoNewPrivileges=true

[Install]
WantedBy=multi-user.target
```

```sh
sudo systemctl daemon-reload
```

## Étape 9 — DNS + nginx + TLS

1. **DNS** : enregistrement A `mcp.openagenda.com` → IP du VPS. Vérifier la
   propagation (`getent hosts mcp.openagenda.com`) **avant** certbot.

2. **Vhost nginx** `/etc/nginx/sites-available/mcp.openagenda.com` :

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name mcp.openagenda.com;

    location / {
        proxy_pass http://127.0.0.1:8904;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        # MCP Streamable HTTP / SSE : streamer, ne pas bufferiser, longue durée
        proxy_buffering off;
        proxy_cache off;
        proxy_read_timeout 3600s;
        proxy_send_timeout 3600s;
        chunked_transfer_encoding on;
    }
}
```

3. **Activer + certificat** :

```sh
sudo apt-get install -y nginx certbot python3-certbot-nginx
sudo ln -sf /etc/nginx/sites-available/mcp.openagenda.com /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d mcp.openagenda.com --non-interactive --agree-tos \
  -m <email-ops> --redirect      # ajoute le bloc 443 + redirection 80→443 ; renouvellement auto
```

## Étape 10 — Démarrer + vérifier

```sh
sudo systemctl enable --now oa-mcp
systemctl is-active oa-mcp ; sudo ss -tlnp | grep 8904     # active + listening

# La frontière OAuth doit refuser les requêtes sans token :
curl -s -o /dev/null -w '%{http_code}\n' -X POST https://mcp.openagenda.com/mcp \
  -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}'        # attendu : 401

curl -s -o /dev/null -w '%{http_code}\n' \
  https://mcp.openagenda.com/.well-known/oauth-protected-resource/mcp     # attendu : 200
```

Flux complet (token réel → `execute`) : pointer un client MCP (Claude Desktop /
Code) sur `https://mcp.openagenda.com/mcp` — il déroule l'OAuth automatiquement.

---

## Étape 11 — Monitoring host (Grafana Alloy)

Métriques système (CPU / RAM / disque / réseau) → télémétrie centrale OpenAgenda
(`telemetry.oagenda.com`, mTLS). La procédure agent de référence est dans
[`wiki/grafana.md`](grafana.md) ; spécifique au MCP :

1. **Installer alloy** (dépôt Grafana) :

```sh
sudo apt-get install -y gpg wget
sudo mkdir -p /etc/apt/keyrings
wget -q -O - https://apt.grafana.com/gpg.key | gpg --dearmor | sudo tee /etc/apt/keyrings/grafana.gpg >/dev/null
echo "deb [signed-by=/etc/apt/keyrings/grafana.gpg] https://apt.grafana.com stable main" | sudo tee /etc/apt/sources.list.d/grafana.list
sudo apt-get update && sudo apt-get install -y alloy
```

2. **Hostname propre** (devient le label `instance` dans Grafana) :

```sh
sudo hostnamectl set-hostname mcp-ovh
```

3. **Config** `/etc/alloy/config.alloy` = la **« Config de base (tout serveur) »**
   de [`wiki/grafana.md`](grafana.md) (node_exporter host + bridge
   Prometheus→OTLP→central). **Pas de bloc MySQL** : le MCP n'expose pas de
   métriques applicatives — ses logs + audit partent vers InsightOps, séparément.

4. **Certs mTLS — émission depuis la CA OADEV.** La CA (cert + clé privée) vit
   dans **1Password** : item **« Autorité de certification »** (vault
   _Devs ubercore_), champs _clé privée_ + _certificat (2025-2035)_. Émettre **un**
   cert agent par hôte sur un **poste de confiance** (la clé de CA ne touche
   **jamais** l'hôte agent), avec `op` + `openssl` :

```sh
umask 077
# 1) CA cert (courant) + clé privée — ne jamais committer/afficher la clé
op read "op://Devs ubercore/Autorité de certification/5nmg4gpcstcebscfnidyc3uuym" > ca.crt  # certificat (2025-2035)
op read "op://Devs ubercore/Autorité de certification/ahrh5cgto6vs5wsaaa67opw2ne" > ca.key  # clé privée

# 2) clé + CSR de l'agent (CN = hostname de l'instance)
openssl genrsa -out agent.key 2048
openssl req -new -key agent.key -out agent.csr -subj "/C=FR/O=OADEV/CN=mcp-ovh"

# 3) signer un cert CLIENT (clientAuth + CA:FALSE), validité < celle de la CA (<2035)
cat > agent.ext <<'EXT'
basicConstraints = CA:FALSE
keyUsage = critical, digitalSignature, keyEncipherment
extendedKeyUsage = clientAuth
subjectAltName = DNS:mcp-ovh
EXT
openssl x509 -req -in agent.csr -CA ca.crt -CAkey ca.key -CAcreateserial \
  -out agent.crt -days 3000 -sha256 -extfile agent.ext
openssl verify -CAfile ca.crt agent.crt          # → agent.crt: OK

# 4) déployer (canal SSH chiffré), puis DÉTRUIRE la clé de CA locale
for f in ca.crt agent.crt agent.key; do ssh mcp-ovh "sudo tee /etc/alloy/certs/$f >/dev/null" < "$f"; done
shred -u ca.key agent.key && rm -f ca.crt agent.crt agent.csr agent.ext ca.srl
```

Puis corriger les droits **sur l'hôte** :

```sh
sudo chown root:alloy /etc/alloy/certs/ca.crt /etc/alloy/certs/agent.crt /etc/alloy/certs/agent.key
sudo chmod 0644 /etc/alloy/certs/ca.crt /etc/alloy/certs/agent.crt
sudo chmod 0640 /etc/alloy/certs/agent.key
```

5. **Valider + démarrer** :

```sh
sudo alloy fmt /etc/alloy/config.alloy >/dev/null   # valide la syntaxe
sudo systemctl enable --now alloy
sudo systemctl status alloy
sudo systemctl reload alloy                          # après tout changement de config
```

> L'`otelcol.receiver.otlp` (`:4317`/`:4318`) fait partie du template de base
> mais **aucun producteur OTLP local** sur cet hôte (le MCP n'émet pas d'OTEL) — il
> reste idle ; ufw bloque ces ports en entrée de toute façon.

## Exploitation

| Tâche                          | Commande                                                                                                     |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------ |
| Logs                           | → InsightOps (clé `OA_INSIGHT_OPS_TOKEN`). En local : `DEBUG=openagenda-mcp* node packages/mcp/src/index.js` |
| Statut / redémarrage           | `systemctl status oa-mcp` · `sudo systemctl restart oa-mcp`                                                  |
| Journal systemd                | `sudo journalctl -u oa-mcp -f` (banners/fatals ; les logs applicatifs partent vers InsightOps)               |
| Maintenance (couper `execute`) | poser `OA_EXECUTE_DISABLED=1` dans l'env + restart (`search_docs` reste servi)                               |
| Mise à jour du code            | `~/update-mcp.sh` (pull main → install → build → restart → **vérifie** ; voir ci-dessous)                    |
| Renouvellement TLS             | automatique (timer certbot) ; test : `sudo certbot renew --dry-run`                                          |
| Tuning RAM/débit               | `OA_SANDBOX_MEMORY_MB` / `OA_MICROSANDBOX_POOL_SIZE` / `OA_MAX_CONCURRENCY` dans l'env + restart             |

### Script de mise à jour (`~/update-mcp.sh`)

Créer une fois sur le serveur (`chmod +x ~/update-mcp.sh`), puis lancer
`~/update-mcp.sh` à chaque déploiement. Il **vérifie** l'état après restart et
sort en erreur si le service est KO (service inactif, port non écouté, ou `/mcp`
ne renvoie pas 401) :

```bash
#!/usr/bin/env bash
# Met à jour le MCP : pull main → install → build → restart → vérifie.
set -euo pipefail
export NVM_DIR="$HOME/.nvm"; . "$NVM_DIR/nvm.sh"
cd "$HOME/oa"

echo "→ fetch + reset main"
git fetch --depth 1 origin main
git reset --hard origin/main
git log --oneline -1

echo "→ install + build"
yarn workspaces focus @openagenda/mcp || true   # erreur fontawesome (dép frontend) bénigne
yarn workspace @openagenda/mcp build            # vraie barrière : échoue si une dép manque

echo "→ restart service"
sudo systemctl restart oa-mcp
sleep 3

echo "→ vérification"
systemctl is-active --quiet oa-mcp || { echo "❌ service inactif"; sudo journalctl -u oa-mcp -n 30 --no-pager; exit 1; }
sudo ss -tlnp | grep -q :8904   || { echo "❌ n'écoute pas sur 8904"; exit 1; }
code=$(curl -s -o /dev/null -w '%{http_code}' -X POST https://mcp.openagenda.com/mcp \
  -H 'content-type: application/json' -H 'accept: application/json, text/event-stream' \
  -d '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{}}')
[ "$code" = "401" ] && echo "✅ MCP à jour et sain (401 sans token)" \
  || { echo "⚠️  /mcp a répondu $code (attendu 401)"; exit 1; }
```

> Adapter le domaine dans le check `curl` si ≠ `mcp.openagenda.com`. Le
> `git reset --hard` écrase toute modif locale du dépôt (voulu : la prod suit
> `origin/main`).

## Limites connues / à surveiller

- **API v3 pas encore GA** : `api.openagenda.com/v3/*` redirige vers la doc → les
  appels API réels via `execute` échoueront tant que v3 n'est pas live (rien à
  changer côté MCP quand ce sera le cas). `search_docs` et l'`execute` de code
  non-API fonctionnent.
- **Mono-hôte = SPOF** : acceptable au lancement. Scaler horizontalement plusieurs
  VPS derrière nginx/un LB ensuite (le MCP est sans état hors µVM).
- **Durcissement egress de l'orchestrateur** (process node lui-même, sous un
  wrapper type `srt` n'autorisant que l'AS + l'API) = defense-in-depth, différé.
- **Secrets** : `OA_MCP_EXCHANGE_SECRET` et `OA_INSIGHT_OPS_TOKEN` vivent **dans
  `~/oa-mcp.env` (mode 600)** uniquement, jamais dans le dépôt.

## Voir aussi

- `packages/mcp/README.md` — modèle d'exécution, matrice fail-closed, threat-model.
- `packages/mcp/docs/microsandbox.md` — egress SNI, footprint, pool, cycle de vie µVM.
