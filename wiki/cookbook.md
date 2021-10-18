# Recettes


## GIT

Supprimer une branche locale: `git branch -d nomdelabranche`
Supprimer une branche remote: `git push origin --delete nomdelabranche`

## Jelastic

Forcer une redirection vers https (voir la 2ème réponse): https://stackoverflow.com/questions/37370280/jelastic-nginx-http-to-https-redirect

Dans le fichier nginx-jelastic.conf, sous le listen 80, server_name, mettre:

    if ($http_x_forwarded_proto != "https") {
        return 301 https://$host$request_uri;
    }

## Ghost

Les sites de documentation utilisent un déploiement avec un équilibreur nginx et une image docker ghost 3.40.2-alpine. Une variable d'environnement doit être ajoutée pour préciser à ghost quelle url utiliser. Son nom: "url" (ex: https://doc.openagenda.com)

Un volume local contient tout le déploiement ghost: /var/lib/ghost. Pour déplacer un site ghost d'un environnement à un autre, il suffit de reprendre le contenu du dossier /var/lib/ghost/content


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

## structure d'un projet

[Comment nommer les dossiers](https://gist.github.com/tracker1/59f2c13044315f88bee9)

## Erreurs

Si une donnée passée à un service à un mauvais formattage, le service doit lancer une erreur BadRequest:

    const { BadRequest } = require('@openagenda/verror');
    throw new BadRequest({ info: { errors } }, 'invalid something something');

## openssl

Si une clé fournie commence par `-----BEGIN ENCRYPTED PRIVATE KEY-----`, elle est encryptée et doit être décryptée par mot de passe avant son utilisation dans nginx. Une fois le mot de passe en main, la commande pour la décrypter est la suivante:

    openssl rsa -in /path/to/encrypted/key -out /path/to/decrypted/key
