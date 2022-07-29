# Recettes


## GIT

Supprimer une branche locale: `git branch -d nomdelabranche`
Supprimer une branche remote: `git push origin --delete nomdelabranche`

Si un commit est perdu (sur une branche détachée qui n'a pas été fusionné avant qu'un nouveau checkout de la branche principale ait été faite), la commande suivante permet de le retrouver:

    git fsck --lost-found

https://stackoverflow.com/questions/16368605/is-there-a-tool-to-have-git-show-detached-heads-in-a-graph/16368880

## Jelastic

Forcer une redirection vers https (voir la 2ème réponse): https://stackoverflow.com/questions/37370280/jelastic-nginx-http-to-https-redirect

Dans le fichier nginx-jelastic.conf, sous le listen 80, server_name, mettre:

    if ($http_x_forwarded_proto != "https") {
        return 301 https://$host$request_uri;
    }


## Mails

Un éditeur de template peut être lancé depuis cibul-node: `yarn mails-editor`.

Les labels sont placés dans un dossier `locales`, une langue par fichier. Crowdin générera les fichiers restants après un push.

## Ghost

Les sites de documentation utilisent un déploiement avec un équilibreur nginx et une image docker ghost 3.40.2-alpine. Une variable d'environnement doit être ajoutée pour préciser à ghost quelle url utiliser. Son nom: "url" (ex: https://doc.openagenda.com)

Un volume local contient tout le déploiement ghost: /var/lib/ghost. Pour déplacer un site ghost d'un environnement à un autre, il suffit de reprendre le contenu du dossier /var/lib/ghost/content

Pour changer de version de ghost (mineur ou patch), il suffit de changer d'image docker ghost dans la topologie du serveur sur Infomaniak. Le site sera indisponible le temps que la réinstallation se fasse.

## React

### Contexte

Quand on est dans un container, on peut récupérer les données de contexte (agenda, user) avec un décorateur (fonction qui prend le truc suivant) provenant de react-shared: withLayoutData. ex de member-apps `Dashboard.js`: `@withLayoutData('agenda', 'member', 'role', 'user')`. Ca charge les données demandées dans les props.

Quand on est dans une fonction-composant React, les infos de contexte (user, agenda...) sont accessible depuis un hook `useLayoutData` provenant de react-shared. Exemple: `const { agenda, agendaSchema, filtersContainerRef } = useLayoutData();`

### Intl

Lorsque un composant d'un package est utilisé dans un autre et que dans les 2 cas les labels sont gérés par react-intl, il est nécessaire de fusionné les labels du package intégré dans ceux du package intégrant pour que les labels multilingues du package intégré soient utilisés.

Ce merge doit être fait soit dans le container principale de l'app intégrante, soit dans un décorateur du storybook exploitant le composant

Dans l'app:

```js
import React from 'react';
import {
  mergeLocales,
  useLayoutData
} from '@openagenda/react-shared';

// locales du package intégré
import { locales as reactFiltersLocales } from '@openagenda/react-filters';

// locales du package intégrant
import appLocales from '../locales-compiled';

const locales = mergeLocales(appLocales, reactFiltersLocales);

export default function MyComponent() {
  const { lang } = useLayoutData();

  return (
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
      {/* ... */}
    </IntlProvider>
  );
}
```

Si les props permettent d'ajouter ou modifier des labels il est préférable d'utiliser un hook:

```js
import React, { useMemo } from 'react';
import {
  mergeLocales,
  useLayoutData
} from '@openagenda/react-shared';

// locales du package intégré
import { locales as reactFiltersLocales } from '@openagenda/react-filters';

// locales du package intégrant
import appLocales from '../locales-compiled';

export default function MyComponent({ locales: userLocales }) {
  const { lang } = useLayoutData();

  const locales = useMemo(
    () => mergeLocales(
      appLocales,
      reactFiltersLocales,
      userLocales || {}
    ),
    [userLocales]
  );

  return (
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
      {/* ... */}
    </IntlProvider>
  );
}
```

Exemple de decorateur de story:

```js
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useConstant } from '@openagenda/react-shared';
import { IntlProvider } from 'react-intl';

import { locales as reactFiltersLocales } from '@openagenda/react-filters';
import appLocales from '../../src/locales-compiled';

const locales = mergeLocales(appLocales, reactFiltersLocales);

const lang = 'fr';

import {
  mergeLocales,
  useLayoutData
} from '@openagenda/react-shared';

export default Story => (
  <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
    <Story />
  </IntlProvider>
);
```
### Intl dans React 'before hooks'

L'utilisation d'hook tel useIntl() est impossible dans cette version de react.
intl est donc donné en props avec injectIntl()

```js
import React from 'react';
import { defineMessages, IntlProvider, injectIntl } from 'react-intl';
import {getSupportedLocale} from '@openagenda/intl'

class Main extends Component {...};

const MainWithIntl = injectIntl(Main) ;
render(
  <IntlProvider
    key={props.lang}
    locale={props.lang}
    messages={locales[props.lang]}
    defaultLocale={getSupportedLocale(props.lang)}
  >
    <MainWithIntl {...props} />
  </IntlProvider>, document.getElementById('app'));
```

## Crowdin & Labels

Il faut privilégier les traductions sur crowdin et modifier les sources (`en`) depuis git.

L'action github qui s'éxécute à chaque `push` n'upload que les sources en supprimant les obsolètes. NE PAS modifier les sources sur crowdin.  
Le script `dispatch` ne télécharge que les traductions, sans la langue `en`.

### Lorsqu'on ajoute des labels sources

> Si on a modifié le package `labels` il faut y éxecuter `node .crowdin/aggregate.js`.

Il suffit de faire un commit et de le push.

On peut ensuite traduire les labels sur crowdin et lancer `node scripts/crowdin/dispatch.js` dans oa pour récupérer les traductions.

### Lorsqu'on a traduit des labels sur crowdin

Il faut exécuter `node scripts/crowdin/dispatch.js` dans oa pour récupérer les traductions.

### Si on veut traduire des labels depuis les sources

Avant toute modification il faut se mettre à jour par rapport à crowdin en éxecutant `node scripts/crowdin/dispatch.js` dans oa.

On peut maintenant traduire ce qu'on veut.

> Si on a modifié le package `labels` il faut y éxecuter `node .crowdin/aggregate.js`.

Puis depuis l'onglet "intégrations" de crowdin il faut lancer l'action `Upload Translations` manuellement pour oa et/ou oa-public. [Doc](https://support.crowdin.com/github-integration/#uploading-translations-from-repo)

### Si on veut ajouter de nouveaux labels dans sources

Dans les packages concernés, on a executé `yarn extract-messages` pour ajouter les nouveaux labels dans les fichiers de sources.
On push
Crowdin devrait récupérer les nouvelles sources.
On traduit les nouveaux labels dans crowdin
Puis `node scripts/crowdin/dispatch.js`

### Si on veut modifier des sources directement sur crowdin

Il faut les récupérer sur le projet en partant d'un code non édité/modifié par rapport à ce qui se trouve sur le repo en ligne.

... et avoir le crowdin-cli d'installé: `npm i -g @crowdin/cli`

On télécharge les sources dans le dossier de base du projet (oa):

```
CROWDIN_PROJECT_ID=316319 CROWDIN_PERSONAL_TOKEN=$CROWDIN_KEY crowdin download sources -b "[OpenAgenda.oa] main"
```

On dispatch les labels récupérés dans le package labels:

```
cd packages/labels
node .crowdin/dispatch.js
```

... et dans le projet public

```
CROWDIN_PROJECT_ID=316319 CROWDIN_PERSONAL_TOKEN=$CROWDIN_KEY crowdin download sources -b "[OpenAgenda.oa-public] main"
```

On commie


### Si on a modifié le pack

## redis

Pour copier une base redis sur un nouveau serveur, on se connecte au nouveau serveur et on lance la commande:

    redis-cli slaveof IP-ADDRESS-OF-OLD-SERVER 6379

Une fois que la réplication est faite (la ram doit être occupée d'une manière similaire) et qu'on est prêt à basculer, on arrête la réplication:

    redis-cli slaveof no one

Et voilà. [Source](https://www.tothenew.com/blog/copying-redis-database-from-one-server-to-another/)

redis,configuration

## regex

Utilitaires pour gérer des regex avec des routes express:

 * [PillarJs](https://github.com/pillarjs/path-to-regexp): convertit une route express en regex
 * [Express Route Tester](https://forbeslindesay.github.io/express-route-tester/): app de test de route express

express,regex

## yarn

### Publier une lib publique de manière isolée

Utile quand on veux publier une librairie publique sans pour autant partir d'un monorepo propre (à jour, sans modifications). Cette méthode est une "mauvaise" pratique, elle est à éviter au possible. Il faut préférer la méthode documentée dans `CONTRIBUTING.md`

On fait les commits sur la lib, on itère sur la version directement dans le `package.json` qu'on commit également, puis `yarn npm publish --access public`

### Patcher une lib publique de manière isolée

Une petite modification sur agenda-portal à patcher sur npm peut se faire simplement en mettant à jour la version `yarn version patch -i`, en commitant les modifications, puis en `npm publish`ant le package localement.

## structure d'un projet

[Comment nommer les dossiers](https://gist.github.com/tracker1/59f2c13044315f88bee9)

## Certificats

L'accès du cluster elasticsearch en production est protégé par une vérification de clés authentifiant le client executant la recherche. Un proxy nginx se charge de cette vérification.

[Client] -> [Nginx] -> [Elasticsearch]

Le certificat servant pour vérifier la clé du client est celui qui l'aura signé. L'autorité de certification peut servir. La configuration du proxy nginx (`es.conf` pour le container de l'environnemnet de dev) ressemble à ceci:

```
server {
  server_name ${ES7_DOMAIN};

  # certificats pour le domain ES7_DOMAIN
  listen 443 ssl;
  ssl_certificate /ssl/es7.cert.pem;
  ssl_certificate_key /ssl/es7.key.pem;

  # certificat utilisé pour vérifier la clé du client
  ssl_client_certificate /ssl/client.crt;
  ssl_verify_client on;

  location / {
    proxy_pass http://${ES7_HOST}:9200;
  }
}
```

La clé du client est générée en la faisant signer par la clé associée au certificat spécifié dans la conf ci-dessus.

### En développement

Pour l'environnement de dev, c'est le script `docker/devinstaller/ssl/create_client_certificate.sh` qui peut être utilisé pour la générer.

Autrement, il est également possible d'utiliser directement le certificat de vérification ainsi que sa clé. Cela va sans dire qu'en production, ceci ne doit jamais être fait.

### En production

La paire certificat/clé est dans le keepass technique. Elle est nécessaire pour créer de nouvelle clés clients.

#### L'autorité

Si l'autorité doit être créée, utiliser les informations suivantes (en suivant les commandes détaillées dans le script create_oa_authority)

C = FR,
L = Courbevoie,
O = OA,
CN = auth.openagenda.com,
emailAddress = support@openagenda.com

Les clients devront également être mis à jour. Et une fois la paire de l'autorité en production, il faut mettre à jour le keepass technique avec les nouvelles clés.

Autrement, il est également possible de prolonger la validité de l'autorité: https://www.golinuxcloud.com/renew-self-signed-certificate-openssl/

En production, seul le certificat se place dans le sous-groupe du répartiteur, ici: `/etc/nginx/certs/auth.pem`

#### Les clients

Mettre autre chose que ce qui a été précisé dans le CN de l'autorité:

C = FR,
ST = Some-State,
O = Open Agenda SAS,
CN = openagenda.com




### Les clients

Si ce sont les clients qui doivent être renouveler, reprendre la paire autorité du keepass pour suivre les commandes utilisées dans le script create_client_certificate. Les certificats clients doivent alors être placés dans chaque instance se connectant au clusteur (.ssh/es7.key et .crt)

## Tests

### Configuration des tests

Pour executer les tests intégrés il est nécessaire d'avoir elasticsearch d'accessible de l'exterieur du container.

Dans le .env, les variables d'environnement suivantes doivent êtres définies:

```

CLIENT_SSL_CERT=/fullpathto/oa/docker/devinstaller/ssl/certs/ca.crt

.....

DEPLOY_ES_NGINX_PROXY=1
ES1_HOST=es1
ES1_DOMAIN=es1.local
ES1_SSL_CERT=/fullpathto/oa/docker/devinstaller/ssl/domains/es1.local.crt
ES1_SSL_KEY=/fullpathto/oa/docker/devinstaller/ssl/domains/es1.local.key
ES7_HOST=es7
ES7_DOMAIN=es7.local
ES7_SSL_CERT=/fullpathto/oa/docker/devinstaller/ssl/domains/es7.local.crt
ES7_SSL_KEY=/fullpathto/oa/docker/devinstaller/ssl/domains/es7.local.key
```

Le script `oa/docker/devinstaller/ssl/create_domain_certificates.sh /chemin/complet/vers/devinstaller/ssl es.local7`  peut être utilisé pour générer les certificats.

Si nginx était déjà lancé, il faut l'arrêter `docker-compose stop nginx` puis le relancer `docker-compose up nginx` pour relancer la commmande générant le fichier es.conf dans le container.

Avant de lancer les tests, il faut supprimer un éventuel index 'test' déjà existant `curl -X DELETE http://es7.local:9200/test`

es7.local & es1.local doivent être définits parmi les loopback dans /etc/hosts:

```
127.0.0.1 es7.local
127.0.0.1 es1.local
```

## Erreurs

Si une donnée passée à un service à un mauvais formattage, le service doit lancer une erreur BadRequest:

    const { BadRequest } = require('@openagenda/verror');
    throw new BadRequest({ info: { errors } }, 'invalid something something');

## Ubuntu, serveur

### openssl

Si une clé fournie commence par `-----BEGIN ENCRYPTED PRIVATE KEY-----`, elle est encryptée et doit être décryptée par mot de passe avant son utilisation dans nginx. Une fois le mot de passe en main, la commande pour la décrypter est la suivante:

    openssl rsa -in /path/to/encrypted/key -out /path/to/decrypted/key

### crontab

Utiliser la bonne version de `node` avec `nvm` et `crontab` sans coder en dur la version de node:

https://gist.github.com/simov/cdbebe2d65644279db1323042fcf7624

### Configuration d'une instance ec2 pour la prod

Pour une instance ec2 ubuntu 20.04:

 1. `sudo apt-get update && sudo apt-get upgrade`
 2. `sudo apt-get install npm nginx imagemagick libmagick++-dev libmagic-dev webp`
 3. `sudo npm install forever -g`
 4. Créer un dossier `www` sur la home
 5. Lancer une mise en prod pour charger les fichiers nginx dans le dossier `www`
 6. Créer un lien symbolique `cd /etc/nginx && sudo ln -s /home/ubuntu/www/nginx conf.d`
 7. Ajouter les clés de connexion au cluster es7 dans .ssh -> es7.crt & es7.key
 8. Créer un raccourci pour cibul-node: `ln -s /home/ubuntu/www/oa/packages/cibul-node cibul-node`

## @openagenda/files

Les post avec fichier nécessitent l'utilisation d'une lib comme multer coté serveur pour traiter les fichiers. Le package `files` peut encapsuler multer pour traiter les fichiers directement. Le middleware parse avec multer et fusionne les fichiers avec le reste des données postées.

```
const multer = require('multer')
const { makeMiddleware: makeFilesMw } = require('@openagenda/files');

const filesMw = makeFilesMw(multer());

app.use(filesMw(['image', 'other'])); // string is for unique file
// or
app.use(filesMw([{ name: 'image', unique: true }, { name: 'files', maxCount: 3 }]));
// or
app.use(filesMw('any')); // each fieldname become an array, e.g. `req.body.image[0]`
```

C'est utilisé dans le middleware du storybook du package `agenda-settings`.
