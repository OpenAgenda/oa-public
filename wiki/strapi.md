# Strapi

## Récuperer la base de prod pour le développement

### 1. En utilisant la clé de transfert

Il faut:

1. Placer la clé de transfert en variable d'environnement `STRAPI_TRANSFER_TOKEN` dans le .env de oa
2. Lancer `docker exec -it strapi yarn strapi-pull`
3. Redémarrer le conteneur strapi

Pour plus d'infos, voir la [documentation de Strapi](https://docs.strapi.io/cms/data-management/transfer)

### 2. En téléchargeant la base

Il faut:

1. Télécharger la base
2. Redémarrer le conteneur docker strapi
3. Regénérer la clé: pour ne pas utiliser la clé de production en développement
4. Redémarrer oa en intégrer pour vérifier que tout se charge bien

Dans le détail, ça donne:

1. Dans un terminal, aller chercher le fichier sqlite dans l'environnement jelastic pour le placer dans son dossier data, tel que défini dans le .env général oa sous `STRAPI_DATABASE_FILENAME`

   scp -P 3022 168792-2943@gate.jpe.infomaniak.com:/root/database/strapi.sqlite /home/kaore/Dev/data/strapi.db

2. Redémarrer le conteneur strapi se fait à la racine du projet oa:

   docker-compose down strapi
   docker-compose up strapi

3. Regénérer la clé: elle permet à l'app next de requêter strapi. Celle de prod ne doit pas servir. Il faut se connecter au strapi local (https://strapi.local), aller dans Settings > API Tokens, éditer la clé, cliquer sur "Regénerer", récupérer la clé qui s'affiche, la placer dans le .env général devant la variable `STRAPI_API_AUTH_TOKEN`

4. Redémarrer l'app intégrée pour vérifier que tout marche bien.

## Déploiement d'un environnement Strapi sur Virtuozzo/Jelastic

Il faut créer un environnement en partant d'une image docker jelastic/node: un noeud avec un peu de mou en scalabilité verticale et un volume pour la base sqlite. On ne s'embête pas avec un mysql ou autre, ni une scalabilité trop poussée. Si quelqu'un veut faire planter les pages d'accueil, elles planteront. Ou on mettra une cache, un frontbidule. D'ailleurs peut-être qu'un plugin strapi existe pour ça aussi.

Le volume local sur /root/database

Les variables d'environnement doivent être ajoutées. A date, celles-ci:

```
#strapi configuation
SSL=1
DOMAIN=strapi.oagenda.com
JWT_SECRET=
APP_KEYS=
API_TOKEN_SALT=
ADMIN_JWT_SECRET=
DATABASE_SSL
DATABASE_FILENAME
DATABASE_CLIENT=sqlite
NODE_ENV=production
TRANSFER_TOKEN_SALT=

#cdn
S3_KEY=
S3_SECRET=
S3_ROOT_PATH=corpo
S3_ASSETS_PATH=https://cdn.openagenda.com/assets/
S3_ASSETS_BUCKET=assets
S3_ENDPOINT=https://s3.pub1.infomaniak.cloud

#deploy
NPM_TOKEN=
FONTAWESOME_NPM_AUTH_TOKEN=
```

### Config d'un environnement avec serveur http sécurisé

Il faut une IPv6 publique aussi, pour créer une entrée AAAA dans le fichier de zone du DNS qui pointera dessus

Une fois l'environnement créé, on installe quelques bricoles: nginx, certbot, git... il lui faut un acces root. Pour ça il faut aller dans le menu "Importation" de jelastic et executer le script JPS suivant:

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

Et l'install:

```
sudo apt update
sudo apt-get install git nginx snapd
sudo systemctl start snapd.service
sudo snap install --classic certbot
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

Il faut configurer le DNS pour pointer vers l'environnement, disons pour `strapi.oagenda.com`

Puis modifier la config par défaut de nginx pour qu'elle traite ce nom de serveur plutôt que tout. En port 80. C'est souvent dans `/etc/nginx/sites-available/default` que ça se passe, puis `service nginx reload` (ou start) pour vérifier que le DNS pointe bien là ou il faut et que nginx affiche une page (sur un http://strapi.oagenda.com). Quand tout ça est bon, on lance certbot pour mettre en place le https.

```
sudo certbot --nginx
```

### Clone du Monorepo

... parce que strapi est un package qui s'y trouve. Il faut commencer par référencer la clé publique du serveur dans github. Elle peut dériver de la clé privée `.ssh/id_rsa`

```
ssh-keygen -y -f id_rsa > id_rsa.pub
```

... puis la coller dans les clés de déploiement du repo.

```
git clone git@github.com:OpenAgenda/oa.git
```

Il faut rajouter un `.yarnrc.yml` sur /root avec:

```
npmRegistries:
  //registry.npmjs.org:
    npmAuthToken: "${NPM_TOKEN}"
```

Dans `/root/oa/packages/strapi`:

```
yarn
yarn build
yarn start
```

Si là ça marche, on peut créer l'`ecosystem.config.js` de pm2. Avec ça dedans:

```
module.exports = {
  apps: [{
    name: 'strapi',
    cwd: '/root/oa/packages/strapi/',
    script: 'yarn',
    args: 'start'
  }],
};
```

On devrait avoir strapi qui écoute sur le port 1337. On a juste nginx pour qu'il se branche dessus. La config ressemblera à ça (`/etc/nginx/sites-available/default`). Faut rajouter le upstream et le morceau proxy\_.... dans `location /`:

```
upstream strapi {
    server 127.0.0.1:1337;
}

server {
    server_name strapi.oagenda.com; # managed by Certbot


    location / {
         proxy_pass http://strapi;
         proxy_http_version 1.1;
         proxy_set_header X-Forwarded-Host $host;
         proxy_set_header X-Forwarded-Server $host;
         proxy_set_header X-Real-IP $remote_addr;
         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
         proxy_set_header X-Forwarded-Proto $scheme;
         proxy_set_header Host $http_host;
         proxy_set_header Upgrade $http_upgrade;
         proxy_set_header Connection "Upgrade";
         proxy_pass_request_headers on;
    }

    listen [::]:443 ssl ipv6only=on; # managed by Certbot
    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/strapi.oagenda.com/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/strapi.oagenda.com/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot

}
server {
    if ($host = strapi.oagenda.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot


        listen 80 ;
        listen [::]:80 ;
    server_name strapi.oagenda.com;
    return 404; # managed by Certbo

}
```

```
pm2 start ecosystem.config.js
sudo service nginx reload
```
