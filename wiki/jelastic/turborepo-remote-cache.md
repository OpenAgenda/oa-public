# Installation d'un Turborepo Remote Cache

## Prérequis

- Un compte sur jelastic cloud

## Création d'un environement

Sur https://app.jpe.infomaniak.com/

Il faut un groupe de noeud avec l'image docker `ducktors/turborepo-remote-cache`,

avec une ipv4 et un volume sur `/home/app/data`

et les variables d'environnement:

```
DOCKER_EXPOSED_PORT=3000
JELASTIC_EXPOSE=3000
STORAGE_PROVIDER=local
STORAGE_PATH_USE_TMP_FOLDER=false
STORAGE_PATH=/home/app/data
TURBO_TOKEN=<UN_TOKEN_AU_PIF>
```

Dans le SSH du container il faut éxécuter la commande suivante pour corriger des problèmes de permissions:

```
chown -R app /home/app/data
```

# Utilisation

Il faut créer/modifier `.turbo/config.json` dans oa avec:

```
{
  "apiurl": "http://<IP_DU_SERVEUR>:3000",
  "teamslug": "oa",
  "token": "<LE_TOKEN>"
}
```

Ou il faut ajouter ça quelque part dans son `.bashrc` ou `.envrc`,

```
export TURBO_API=http://<IP_DU_SERVEUR>:3000
export TURBO_TEAM=oa
export TURBO_TOKEN=<LE_TOKEN>
```
