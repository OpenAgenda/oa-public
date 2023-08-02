# Mode maintenance du TD

Le mode maintenance est configuré sur le serveur de bascule en plaçant les 3 fichiers présents dans `oa/packages/mep/td/maintenance.conf` et en permettant l'accès sudo au noeud.

## L'accès sudo

Se met en place via l'admin jelastic, menu 'Import' en plaçant le code JPS suivant puis en l'executant. Il suffit alors de choisr l'environnement du TD:

```
type: update
name: Root Access

targetNodes:
  nodeGroup: '*'
      
onInstall:
  - cmd[${targetNodes.nodeGroup}]: |-
      TARGET_UID=$(id -u jelastic 2>/dev/null) || TARGET_UID="700"
      getent passwd "${TARGET_UID}" &>/dev/null && TARGET_USER=$(getent passwd "${TARGET_UID}" | cut -d: -f1)  || TARGET_USER="jelastic"
      sed -i "\$a${TARGET_USER}\ ALL=NOPASSWD\:\ ALL" /etc/sudoers; echo ${TARGET_USER}
    user: root
  - setGlobals:
      sudo_user: ${response.out}

onUninstall:
  cmd[${targetNodes.nodeGroup}]: |-
      sed -i "/${globals.sudo_user}\ ALL=NOPASSWD\:\ ALL/d" /etc/sudoers
  user: root
```

## Placement des fichiers

Dans `/etc/nginx/conf.d`, placer `maintenance.conf`.

Dans la home `/var/lib/nginx`, placer le script `maintenance.ch`, permettre son execution, puis dans un dossier html le fichier `maintenance.html`.

`sudo ./maintenance.sh off` pour désactiver le mode maintenance

`sudo ./maintenance.sh on` pour l'activer

Pour test et pour bien s'assurer qu'il sera désactivé au prochain lancement, lancer la commande de désactivation.