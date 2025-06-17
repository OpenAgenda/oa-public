## Prérequis

Il faut commencer par installer le CLI Swift d'OpenStack, déjà documenté dans `wiki/openstack.md`.

Installer `ffmpeg` avec `sudo apt install ffmpeg`.

## Utilisation

Placer un fichier vidéo dans ce dossier.

Se connecter à Swift (voir `wiki/openstack.md`), puis lancer les commandes suivantes :

```bash
./encode_renditions.sh
./package_streams.sh
./generate_thumbnails_vtt.sh
./upload_streaming_to_swift.sh <video_name>
```
