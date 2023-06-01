# Recettes

## Table des matières

 * GIT
 * Jelastic
   * Portails agenda
   * Cluster redis
 * Mails
 * Ghost
 * React
   * Contexte
   * Intl
   * Intl dans React 'before hooks'
 * Crowdin & Labels
   * Lorsqu'on ajoute des labels sources
   * Lorsqu'on a traduit des labels sur crowdin
   * Si on veut traduire des labels depuis les sources
   * Si on veut ajouter de nouveaux labels dans sources
   * Si on veut modifier des sources directement sur crowdin
   * Si on a modifié le pack
 * Redis
 * Regex
 * Node
 * Yarn
   * Publier une lib publique de manière isolée
   * Patcher une lib publique de manière isolée
 * Structure d'un projet
 * Certificats
   * En développement
   * En production
   * Les clients
 * Tests
   * Configuration des tests
 * Erreurs
 * Ubuntu, serveur
   * OpenSSL
   * crontab
   * Configuration d'une instance ec2 pour la prod
 * @openagenda/files
 * Refactos
   * Enlever les `import React` dans les packages
   * Intégration de NextJs
 * Scripts
   * MCC
     * Téléchargement des images d'un agenda
 * Histoires
   * L'ancien export JSON

## GIT

Supprimer une branche locale: `git branch -d nomdelabranche`
Supprimer une branche remote: `git push origin --delete nomdelabranche`

Si un commit est perdu (sur une branche détachée qui n'a pas été fusionné avant qu'un nouveau checkout de la branche principale ait été faite), la commande suivante permet de le retrouver:

    git fsck --lost-found

https://stackoverflow.com/questions/16368605/is-there-a-tool-to-have-git-show-detached-heads-in-a-graph/16368880

## Jelastic

### Portails agenda

Forcer une redirection vers https (voir la 2ème réponse): https://stackoverflow.com/questions/37370280/jelastic-nginx-http-to-https-redirect

Dans le fichier nginx-jelastic.conf, sous le listen 80, server_name, mettre:

    if ($http_x_forwarded_proto != "https") {
        return 301 https://$host$request_uri;
    }

### Cluster Redis

La marketplace Jelastic propose de déployer un cluster redis en quelques minutes avec scalabilité horizontale

A propos du cluster redis sur Jelastic (Virtuozzo): https://www.virtuozzo.com/application-platform-docs/redis-cluster/
A propos du fonctionnement du cluster Redis plus généralement: https://redis.io/docs/reference/cluster-spec/

Une fois déployé, le mot de passe fourni permet la connexion depuis un autre environnement au cluster, en utilisant node-redis avec une configuration adaptée aux clusters: 

```
import { createCluster } from 'redis';

(async () => {
  const cluster = createCluster({
    rootNodes: [{
      url: 'redis://node117132-oa-redis.jcloud-ver-jpe.ik-server.com:6379'
    }, {
      url: 'redis://node117128-oa-redis.jcloud-ver-jpe.ik-server.com:6379'
    }, {
      url: 'redis://node117129-oa-redis.jcloud-ver-jpe.ik-server.com:6379'
    }],
    defaults: {
      password: process.env.PWD,
    }
  });

  await cluster.connect();

  await cluster.set('key', 'value');

  const value = await cluster.get('key');

  console.log(value);

  process.exit();
})();
```

**Note**: Dans l'exemple ci-dessus, les adresses utilisées sont celles des 3 premiers nodes de l'environnement (qui en compte au minimum 6). Le client gère la découverte de nodes additionnels.

Une interface d'administration permet d'avoir une vue d'ensemble sur l'utilisation du cluster


### Avoir les droits admin sur un noeud

https://www.infomaniak.com/fr/support/faq/2346/jelastic-cloud-lancer-des-commandes-avec-un-acces-root-sur-nimporte-quel-conteneur


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

## Redis

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

## Node

### Mise à jour

Pour mettre à jour nodeJs à la dernière version LTS:

**màj nvm**:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash

**màj node**:
nvm install 'lts/*' --reinstall-packages-from=node --latest-npm

## yarn

### Publier une lib publique de manière isolée

Utile quand on veux publier une librairie publique sans pour autant partir d'un monorepo propre (à jour, sans modifications). Cette méthode est une "mauvaise" pratique, elle est à éviter au possible. Il faut préférer la méthode documentée dans `CONTRIBUTING.md`

On fait les commits sur la lib, on itère sur la version directement dans le `package.json` qu'on commit également, puis `yarn npm publish --access public`

### Patcher une lib publique de manière isolée

Une petite modification sur agenda-portal à patcher sur npm peut se faire simplement en mettant à jour la version `yarn version patch -i`, en commitant les modifications, puis en `NODE_ENV=production npm publish`ant le package localement.

## Structure d'un projet

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

Si ce sont les clients qui doivent être renouvelés, reprendre la paire autorité du keepass pour suivre les commandes utilisées dans le script create_client_certificate. Les certificats clients doivent alors être placés dans chaque instance se connectant au clusteur (.ssh/es7.key et .crt)

## Tests

### Configuration des tests

Pour executer les tests intégrés il est nécessaire d'avoir elasticsearch d'accessible de l'exterieur du container.

Dans le .env, les variables d'environnement suivantes doivent êtres définies:

```

CLIENT_SSL_CERT=/fullpathto/oa/docker/devinstaller/ssl/certs/ca.crt

.....

DEPLOY_ES_NGINX_PROXY=1
ES_HOST=es7
ES_DOMAIN=es7.local
ES_SSL_CERT=/fullpathto/oa/docker/devinstaller/ssl/domains/es7.local.crt
ES_SSL_KEY=/fullpathto/oa/docker/devinstaller/ssl/domains/es7.local.key
```

Le script `oa/docker/devinstaller/ssl/create_domain_certificates.sh /chemin/complet/vers/devinstaller/ssl es.local7`  peut être utilisé pour générer les certificats. Le fichier destination ne doit pas déjà exister sans quoi la procédure n'aboutira pas.

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

## Refactos

### Enlever les `import React` dans les packages

Le 15/12/2022

Le linter demande désormais que les `import React from react` ne soient plus explicités en tête de fichier. Il faut les retirer progressivement des packages où ils apparaissent.

Les retirer sans adapter le `.babelrc.js` du package ainsi que l'ajout de dépendences provoquera le plantage de l'application dans l'environnement intégré.

Le `.babelrc.js` doit ressembler à ceci:

```javascript
'use strict';

module.exports = {
  presets: [
    [
      require.resolve('@openagenda/babel-preset'),
      {
        reactIntl: {
          idInterpolationPattern: '[sha512:contenthash:base64:6]',
          extractFromFormatMessageCall: true,
          ast: true,
        },
        importSource: '@emotion/react',
      },
    ],
  ],
  plugins: [
    require.resolve('@loadable/babel-plugin'),
    require.resolve('@emotion/babel-plugin'),
  ],
  sourceType: 'unambiguous',
};
```

... où le plugin `@emotion/babel-plugin` est ajouté, la clause `importSource` est ajoutée aux presets et la ligne `require.resolve('@emotion/babel-preset-css-prop')` n'apparait plus.

Dans le `package.json`, la dépendence `@emotion/babel-preset-css-prop` doit être retirée, et la dépendence `"@emotion/babel-plugin": "^11.10.5"` ajoutée dans les `devDependencies`.


## Intégration de NextJs

https://openagenda.com/next

NextJS est désormais intégré au projet, directement dans le package `cibul-node`. Il tourne sur son process node et reçoit les requêtes du client et les faire suivre s'il ne doit pas les traiter. L'application dans son ensemble écoute trois ports:

 * 8901: le nouveau process NextJS 
 * 8902: les requêtes qui ne concernent pas NextJS sont transférées ici, elles sont traitées par le process historique
 * 8903: les requêtes API qui sont aussi traitées par le process historique

En développement, les 2 process sont lancés via le scripts "start" ou "watch" qui se servent du package `concurrently`. En production, les 2 process sont gérés par `pm2` qui fonctionne en mode cluster: 2 core pour nextJs, 6 pour le serveur.

Le script de mise en prod (build) fait un `pm2 reload all` à la fin de la mise à jour. Un fichier `ecosystem.config.js` présent sur le serveur contient la configuration à charger.  Deux nouvelles tâches sont ajoutées dans la suite `gulp`: l'une pour le `build` de next, l'autre pour le chargement des scripts next sur le CDN.

## Scripts

### Pèle-Mèle

 * **Ajout d'un membre sur de multiples agendas**: le script est sur prodifier, dossier scripts/member-group-operations. Il faut lister les slugs dans slugs.txt séparés par des retours à la ligne, puis lancer le `add.js`. Ce script pourrait resync les inbox & activités de l'agenda pour le membre, il ne le fait pas. L'API permet de faire cette manip désormais. Une refacto serait utile pour que le script n'ait plus à se connecter à la DB.
 * **Identifier les événements non-agrégés parmis toutes les sources d'un agenda**: utile notamment pour les opérations nationales quand des différences de totaux sont constatés. `utils-scripts/packages/aggregators/identifyUnagreggatedEvents.js` appeler sur prodifier en définissant l'agenda à cibler avec une var d'environnement `AGENDA_UID`.

### MCC

 * [Téléchargement des images d'un agenda](https://bitbucket.org/openagenda/util-scripts/src/master/packages/download-agenda-images/run.js): Demandé par Guylène Fauq, permet de télécharger toutes les images d'un agenda dans un dossier. Il est déployé sur prodifier.

## Histoires

### La cache des portails

Le 07/03/2023

Quand un `agenda-portal` va chercher un contenu à afficher en vue liste sur l'API, il met de coté une copie de ce qu'il lit de coté pendant 30 minutes. Si un visiteur vient voir la même page (même URL) sous ces 30 minutes, la copie épargne au portail un nouvel appel à l'API. Ceci est indépendant de l'activité sur OpenAgenda. Il peut arriver que le contenu de la liste évolue sous ces 30 minutes sur OpenAgenda, il ne sera alors répercuté sur le portail que lorsque la copie sera supprimée: au plus dans les prochaines 30 minutes. Nous pouvons réduire cette durée.


### Les tags vs les champs additionnels

À l'origine, nous permettions la saisie de deux champs à choix au delà des champs standards: les catégories et les tags. L'admin de l'agenda pouvait saisir autant de catégories et / ou tags qu'ils voulaient. Les catégories se limitaient à un seul choix pasr événemetn, les tags plusieurs.

Puis on a permis de créer des groupes de tags, de choisir quel groupe était obligatoire, lesquels étaient à choix multiples.

L'export JSON affiche encore ces deux champs: catégories et tags. Il affiche les tags sous leurs deux déclinaisons: celle d'origine (liste plate de tags), puis celle plus complète (liste de groupes de tags). Les valeurs sont monolingues.

Puis on a rendu le modèle de données plus libre en permettant de saisir des champs additionnels aux types plus variés que les tags/catégories. Un champ additionnel à son nom et son type (liste de radios, de checkbox, select à choix unique ou multiple, champ texte, champ zone de texte, etc.). Les définitions de champs (les labels, info, options) peuvent être saisies dans plusieurs langues.

L'API v2 reflète la dernière version de ces évolutions: les données des champs additionnels apparaissent sous leurs propres clés

L'ancien export JSON présente une version taggéifiée/catégorisée des données qui converties du format "champ additionnels". L'ancien embed aussi.

### L'ancien export JSON

Le 20/12/2022

Elasticsearch est un logiciel qui nous permet de faire des recherches plus efficacement que ce que permet une base de données classique.

On a actuellement deux installations Elasticsearch. La première date de 2014 (version 1.3), la deuxième date de 2018 (version 5, puis 7).

Nos clients historiquement utilisent un point de lecture des données qu'on appelle l'export JSON. Il porte ce nom parce qu'on l'a présenté à coté des autres exports directement sur les pages agendas, chacun portant le nom de leurs formats (CSV, PDF, iCal.. JSON).

Son URL ressemble à ça: `https://openagenda.com/agendas/{agendaUid}/events.json`

L'(ancien) export JSON utilise l'installation Elasticsearch 1.3 comme source principale de données.

Depuis, on a développé un remplaçant qui lui utilise l'installation Elasticsearch 7 comme source et qu'on a ajouté directement à notre API - c'est l'endroit où les développeurs s'attendent à voir les ressources OpenAgenda qu'ils peuvent exploiter programmatiquement. Le format est également du JSON.

Son url: `https://api.openagenda.com/v2/agendas/{agendaUid}/events`

Quelques différences de format existent entre les deux points, elles sont documentées ici: https://developers.openagenda.com/50-migration/

Un nombre non négligeable de scripts de synchronisations utilisent encore l'ancien JSON (celui de 2014) et nous souhaitons éteindre l'installation Elasticsearch 1.3 qui doublonne avec la plus récente: une librairie effectuant une conversion de formats a été développée pour pouvoir brancher le flux de données de l'installation Elasticsearch 7 sur l'url de l'ancien export JSON - ce qui nous permet de ne pas contraindre tous nos utilisateurs d'adapter leurs script pour que nous puissions avancer sur nos développements.

Dans notre admin agenda, cette passerelle est activée sur le toggle "JSON export V1 is generated from the V2 format" - il est aujourd'hui activé sur tous les agendas sauf 800 à peu près.

Je viens de désactiver celui de Bordeaux tourisme: une exception s'affichait sur l'ancien export JSON. Un problème se situe sur la conversion des données.