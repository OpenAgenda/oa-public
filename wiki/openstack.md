# OpenStack

Pour installer le CLI: https://docs.openstack.org/newton/user-guide/common/cli-install-openstack-command-line-clients.html

```
pip install python-openstackclient
```

Pour configurer le CLI il faut télécharger le fichier OpenStack RC.
Puis lancer la commande suivante (à ajuster) dans chaque nouveau terminal pour se connecter à OpenStack :

```
. ~/Téléchargements/app-cred-bertho-openrc.sh
```

On peut tester la connexion avec cette commande :

```
openstack container list
```

## Swift

Swift est un service de stockage de fichiers comme S3.

Le CLI s'installe comme celui d'OpenStack :

```
pip install python-swiftclient
```

On se connecte de la même manière:

```
. ~/Téléchargements/app-cred-bertho-openrc.sh
```

On peut tester la connexion avec cette commande :

```
swift capabilities
```

### Désactiver l'index des buckets

Par défaut un bucket public permet à n'importe qui de lister tous les fichiers du bucket, pour désactiver l'index d'un bucket il faut faire la commande suivante :

```
swift post <BUCKET_NAME> --read-acl ".r:*"
```

### Rclone

Rclone sert à synchroniser des fichiers entre deux services de stockage.

Pour installer rclone : https://rclone.org/install/

```
sudo -v ; curl https://rclone.org/install.sh | sudo bash
```

Le commande copy permet de copier des fichiers sans modifier les fichiers de la source, et ne met pas à jour la destination si le fichier est plus récent :

```
rclone copy aws:cibul infomaniak-swift:main \
  --update \
  --swift-no-chunk \
  --metadata \
  --transfers=32 \
  --checkers=64 \
  --s3-chunk-size=128M \
  --s3-upload-concurrency=8 \
  --progress \
  --low-level-retries=10 \
  --timeout=60s
```
