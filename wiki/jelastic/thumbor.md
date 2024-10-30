# Installation de Thumbor sur Jelastic Cloud

## Prérequis

- Un compte sur jelastic cloud

## Création d'un environement

Sur https://app.jpe.infomaniak.com/

Lancer la création d'un nouvel environnement. Avec:

- _Equilibrage_: Nginx; laisser la configuration proposée (1 à 4 cloudlets en scalabilité verticale).
- _App Serveurs_: VPS Ubuntu 22.04; laisser la configuration proposée (1 à 4 cloudlets en scalabilité verticale).

Activer le SSL intégré.

## Installation de Thumbor

En ssh, exécuter les commandes suivantes pour installer les paquets nécessaires:

```bash
apt update
apt install -y python3-venv python3-pip libcurl4-openssl-dev libssl-dev python3-opencv libopencv-dev libjpeg-dev libpng-dev libwebp-dev webp supervisor
```

Activer supervisor:

```bash
systemctl start supervisor
systemctl enable supervisor
```

Installer Thumbor:

```bash
pip install pycurl thumbor
```

Générer la configuration de Thumbor:

```bash
thumbor-config > /etc/thumbor.conf
```

Copier le dossier `thumbor_loaders` qui se trouve près de ce guide dans `/root`.

Installer `thumbor_loaders`:

```bash
cd thumbor_loaders
pip install -e .
```

## Configuration

Modifier les valeurs suivantes de `/etc/thumbor.conf`:

```
LOADER=thumbor_loaders.oa_loader
AUTO_WEBP = True
AUTO_AVIF = True
AUTO_AVIF = True
AUTO_AVIF = True
```

Créer le dossier de log:

```bash
mkdir /var/log/thumbor
```

Créer le fichier de configuration de supervisor pour Thumbor (`/etc/supervisor/conf.d/tumbor.conf`):

```
[program:thumbor]
command=thumbor -p 80 --conf=/etc/thumbor.conf
process_name=thumbor
numprocs=1
user=root
directory=/root
autostart=true
autorestart=true
startretries=3
stopsignal=TERM
stdout_logfile=/var/log/thumbor/stdout.log
stdout_logfile_maxbytes=1MB
stdout_logfile_backups=10
stderr_logfile=/var/log/thumbor/stderr.log
stderr_logfile_maxbytes=1MB
stderr_logfile_backups=10
```

Redémarrer supervisor:

```bash
systemctl restart supervisor
```

### Commandes additionelles

Après avoir modifié la configuration de Thumbor, pour relancer le service:

```bash
supervisorctl restart thumbor
```
