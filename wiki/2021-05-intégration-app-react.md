# Déployer une app intégrable sur la webapp d'administration

(Le commit de la création d'admin-event-apps)[https://trello.com/c/v5QV1qS6/1123-commit-minimaliste-qui-ajoute-une-app-a-react-integration-apps]

Je commence par trouver où le code de l'application react sera placé dans le package. Dans `legacy`, plusieurs librairies sont présentes et la librairie qui utilise l'app se trouve dans le dossier `embeds`. Le code du service embeds est présent dans un dossier `service`. Je créé un dossier `app` pour l'app react.

```
packages/legacy
  embeds/
    service/
    app/
```

## Storybook

Je veux marquer un premier palier en ayant une app qui s'affiche dans un storybook. J'ai donc besoin de storybook.

Je créé le dossier .storybook pour y ajouter un fichier main.js `packages/legacy/embeds/.st
orybook/main.js`. Il contient notamment les stories qui seront détaillées dans un dossier `stories` (le créer aussi, avec un premier fichier `sandbox.story.js` pour pouvoir lancer quelque chose une fois que storybook sera installé.

```js
// packages/legacy/embeds/app/stories/sandbox.stories.js
import React from 'react';
import '@openagenda/bs-templates/compiled/main.css';

export default {
  title: 'Sandbox',
};

export const Bim = () => <p>Et bim.</p>;

```

La dépendance `@openagenda/bs-templates` est utile pour charger le style d'OpenAgenda.

Si celle-ci n'est pas encore présente dans les `devDependencies` du paquet, je la rajoute avec un `yarn add -i -D @openagenda/bs-templates`.

A ce stade, je m'assure que le `.eslintrc` contient les règles qui lui permettront de controler le code react. Il y en a un à la base du package legacy. Je l'amende avec:

```json
{
  ...
  "overrides": [
    {
      "files": [
        "embeds/app/stories/**/*.js",
        "embeds/app/src/**/*.js"
      ],
      "parserOptions": {
        "sourceType": "module"
      }
    }
  ]
}
```

Je rajoute les dépendences `react` et `storybook` au package. React dans les peerDependencies et les devDependencies

`yarn add -i -D react react-dom`

Les dépendences ont été ajoutées aux `devDependencies`. Je les met aussi dans les `peerDependencies`

J'ai dans mon `package.json:

```
"devDependencies": {
  ...
  "react": "^16.13.1",
  "react-dom": "^16.13.1",
  ...
},
"peerDependencies": {
  "react": "^16.13.1",
  "react-dom": "^16.13.1"
}
```

Je fais pareil avec storybook.

`yarn add -i -D @storybook/react`

J'ai maintenant:

```
"devDependencies": {
  ...
  "@storybook/react": "^6.2.8",
  "react": "^16.13.1",
  "react-dom": "^16.13.1",
  ...
},
"peerDependencies": {
  "react": "^16.13.1",
  "react-dom": "^16.13.1"
}
```

React doit être dans les `peerDependencies` pour indiquer au paquet (package) qui utilisera ce paquet que la version de react doit être gérée et unique. Le développeur qui utilisera ce paquet devra utiliser une version de react compatible à ce qui est demandé dans les peerDependencies.

A ce stade, je devrais avoir un storybook qui fonctionne. Comme mon installation est dans `.../packages/legacy/embeds/app`, je m'y rend pour lancer la commande qui me permet de voir l'app storybook se charger:

`yarn start-storybook -p 9001 --ci`

On peut l'ajouter dans les scripts du `package.json`

```
...
"scripts": {
  "start": "start-storybook -c embeds/app/.storybook -p 9001 --ci",
  ...
},
..
```

## Décorer le storybook

Je veux retrouver un environnement visuel proche de ce que j'aurai sur l'application intégrée quand je charge mon storybook. Je peux y arriver en utilisant des décorateurs qui placent les stories dans un canevas adapté.

Ici, l'application apparaitra dans l'administration d'un agenda. Je veux un décorateur qui me place une sidebar avec des onglets d'administration et une entête contenant le titre et une image d'agenda.

Je créé un dossier pour héberger mes décorateurs. Pour le moment je n'en aurai qu'un: `packages/legacy/embeds/app/stories/decorators/AdminCanvas.js`

Il ressemble à ça:

```js
import React from 'react';

export default Story => (
  <div className="container top-margined">
    <div className="row wsq">
      <div className="col col-sm-3 nav">
        <ul className="list-unstyled">
          <li className="menu-item selected">
            <a className="active" href="/">
              <span>Intégration Web</span>
            </a>
          </li>
        </ul>
      </div>
      <div className="col-sm-9 body">
        <div className="js_canvas">
          <Story />
        </div>
      </div>
    </div>
  </div>
);
```

Le fichier `stories/sandbox.stories.js`:
```
import React from 'react';
import '@openagenda/bs-templates/compiled/main.css';

import AdminCanvas from './decorators/AdminCanvas';

export default {
  title: 'Sandbox',
  decorators: [AdminCanvas]
};

export const Bim = () => <p>Et bim.</p>;
```

## Les labels

L'app étant multilingue, la gestion des labels multilingues doit être mise en place.

J'ajoute `react-intl` dans les dépendences du projet: `yarn add -i react-intl`

... et `@openagenda/intl` directement en dépendences dans `package.json`, la dernière version du package.

Puis encore dans le `package.json` les script d'extraction des labels multilingues doit être référencé sous la balise `scripts`:

```
    ...
    "extract-messages": "yarn oa-intl 'embeds/app/src/components/**/*.js' --output 'embeds/app/src/locales/%lang%.json' --compiled 'embeds/app/src/locales-compiled/%lang%.json'",
    ...
```

Une première execution du script créé les dossiers locales précisés en arguments.

`yarn extract-messages`

Pour que les labels soient gérés dans le storybook, je le place dans le décorateur *Providers* avec les autres (j'en ai pour le moment 2: Helmet qui me permet de charger les js/css pour leaflet et *QueryClientProvider* utilisé par *react-query*):

Donc dans `stories/decorators/Providers.js`, j'ai maintenant:
```js 
import React from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useConstant } from '@openagenda/react-shared';
import { IntlProvider } from 'react-intl';

import locales from '../../src/locales-compiled';

const lang = 'fr';

export default Story => {
  const queryClient = useConstant(() => new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
      }
    }
  }));

  return (
    <IntlProvider messages={locales[lang]} locale={lang} key={lang}>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <Story />
        </HelmetProvider>
      </QueryClientProvider>
    </IntlProvider>
  );
};

```

Je devrais pouvoir placer mes labels dans mes composants. Un premier: (TilesMapMenu.js):
```js
import React from 'react';

import { defineMessages, useIntl } from 'react-intl';
import InputComponent from './InputComponent';

const messages = defineMessages({
  tilesInputLabel: {
    id: 'LegacyEmbed.TilesMapMenu.tilesInputLabel',
    defaultMessage: 'Specify a custom tiles link to be used by the map',
  },
  tilesInputPlaceholder: {
    id: 'LegacyEmbed.TilesMapMenu.tilesInputPlaceholder',
    defaultMessage: 'Paste the tile link template here',
  }
});

export default ({
  embed,
  onChange
}) => {
  const intl = useIntl();

  return (
    <div>
      <InputComponent
        embed={embed}
        onChange={onChange}
        path="config.layout.mapTiles"
        label={intl.formatMessage(messages.tilesInputLabel)}
        placeholder={intl.formatMessage(messages.tilesInputPlaceholder)}
      />
    </div>
  );
};

```

Storybook fait désormais apparaitre les labels par défaut, en anglais.

Une nouvelle execution de l'extraction des messages devrait faire apparaitre ces labels par défaut dans les dossiers gérés par le script d'extraction.

`yarn extract-messages`

Puis les traductions peuvent être placées dans le dossier `locales`, dans le fichier correspondant à la langue chargées par le provider chargé dans le décorateur (fr.json, donc).

Une nouvelle execution du script chargera ces modifications dans les fichiers compilés. Les labels devraient désormais s'afficher en français dans le storybook.

Les labels restants peuvent être saisis. La documentation utile pour en savoir plus sur les possibilités de formattage:

 * https://formatjs.io/docs/react-intl/components
 * https://formatjs.io/docs/core-concepts/icu-syntax


## Intégration dans cibul-node

Une fois l'app prête et bien storybookée, elle peut être intégrée dans l'application d'administration intégrée.

Dans notre cas, l'application react n'a pas de routes, ce n'est qu'un composant qui gère un état simple. Elle est définie dans le fichier `embeds/app/src/components/index.js`

### Adaptation de l'application react en amont de l'intégration

Les paquets suivants doivent être dans les dépendences:

 * `react-router-config`
 * `@openagenda/react-shared`
 * `react-redux`

... dans les dépendences dev & peer:

 * `redux`

Je commence par faire une application minimaliste qui affiche juste un texte pour la voir s'afficher dans le storybook et en intégré.

#### Affichage d'une app intégrable dans Storybook

D'abord le storybook. Il charge le fichier qui sera l'interface avec l'application intégrée:

`stories/integrated.stories.js`
```
import { wrapApp } from '@openagenda/react-shared';
import '@openagenda/bs-templates/compiled/main.css';

import createApp from '../src';

import AdminCanvas from './decorators/AdminCanvas';

export default {
  title: 'Integrated',
  decorators: [AdminCanvas]
};

export function Integrated() {
  return (
    wrapApp(
      createApp({
        initialState: {
          message: 'Ca marche',
          apiRoot: `http://localhost:${process.env.STORYBOOK_PORT}`,
          prefix: ''
        }
      }),
      {
        extraProps: {
          lang: 'fr',
          agenda: {
            uid: 48959239,
            slug: 'la-gargouille',
            title: 'La gargouille',
          }
        }
      }
    )
  );
}
```

Le fichier d'interface. Il charge un fichier répertoriant les routes, qu'il créé et passe à l'application intégrée:

`src/index.js`
```
import {
  createApp
} from '@openagenda/react-shared';

import getRoutes from './getRoutes';

export default function embeds(options) {
  const { initialState } = options;

  const { apiRoot, prefix } = initialState;

  return createApp({
    ...options,
    name: 'embeds', // simplifie le debug. Ce n'est pas un composant -> minuscule
    initialState,
    apiRoot,
    prefix,
    getRoutes
  });
}

```

Le fichier listant les routes. Dans le cas de l'application 'embed', il n'y a pas plusieurs routes, le fichier ne répertorie que 2 containers: 
 
 * `App` qui contient les providers utiles à l'application, puis le container principal de l'application. Je crée un container temporaire `Temporary` pour arriver plus rapidement à une application intégrée et poursuivre ensuite sur le chargement de l'application complète.

`src/getRoutes.js`
```
import {
  loadable
} from '@openagenda/react-shared';

const App = loadable(() => import(
  /* webpackChunkName: "legacyEmbeds-App" */
  './containers/App'
));

const Temporary = loadable(() => import(
  /* webpackChunkName: "legacyEmbeds-Temporary" */
  './containers/Temporary'
));
export default (prefix = '') => ([
  {
    path: prefix,
    component: App,
    routes: [{
      path: `${prefix}`,
      component: Temporary
    }]
  }
]);
```

`src/containers/App.js`
```
import React from 'react';
import { IntlProvider } from 'react-intl';
import { renderRoutes } from 'react-router-config';
import locales from '../locales-compiled';

export default function App({
  route,
  agenda,
  lang
}) {
  return (
    <IntlProvider
      messages={locales[lang]}
      locale={lang}
      key={lang}
    >
      {renderRoutes(route.routes, {
        agenda
      })}
    </IntlProvider>
  );
}
```

`src/containers/Temporary.js`
```
import React from 'react';
import { useSelector } from 'react-redux';

export default function Temporary({ agenda }) {
  const message = useSelector(state => state.message ?? 'Bif bof');

  return (
    <div>{message} {agenda.title}</div>
  );
}
```

Ce composant temporaire me permet de vérifier que je reçois bien des données qui viendront du layout intégré via les extraProps ET que je peux charger des données spécifiques à mon application: le message.

A ce stade, mon storybook affiche déjà le container temporaire. Je créé 5 fichiers:

 * `embeds/stories/integrated.stories.js`
 * `embeds/app/src/index.js`
 * `embeds/app/src/getRoutes.js`
 * `embeds/app/src/containers/App.js`
 * `embeds/app/src/containers/Temporary.js`

#### Hot reload

Quelques ajouts permettent la gestion du rechargement automatique en mode développement

Dans `embeds/app/src/index.js`, l'app doit être rechargeable par une clause hot reload avant d'être rendue par la fonction.

```
const getApp = createApp.bind(null, {
  ...options,
  name: 'embeds', // simplifie le debug. Ce n'est pas un composant -> minuscule
  initialState,
  apiRoot,
  prefix,
  getRoutes
});

const app = getApp();

return app;
```

Et on rajoute le hot reload avant le return
```
if (module.hot) {
  module.hot.accept('./getRoutes', () => {
    const newApp = getApp();

    app.Content = newApp.Content;
    app.triggerHooks = newApp.triggerHooks;
  });
}
```

#### build

Les dépendences pour babel doivent être présentes dans le `package.json`:

Les dépendences:

 * @babel/runtime-corejs3

Les dépendences dev:

 * @babel/cli
 * @babel/core
 * @loadable/babel-plugin
 * @openagenda/babel-preset

Le `.babelrc.js` doit être présent dans le package
```
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
      },
    ],
    require.resolve('@emotion/babel-preset-css-prop'),
  ],
  plugins: [require.resolve('@loadable/babel-plugin')],
  sourceType: 'unambiguous',
};
```

On rajoute le script build dans le package.json... le script "prepack" peut-être référencé aussi, il est appelé lors d'une installation générale du projet oa:

```
  ...
  "build": "babel --copy-files embeds/app/src -d embeds/app/dist -s",
  "prepack": "yarn build"
  ...
```

Et on voit si ça build `yarn build`

#### react-integration-app

On ajoute l'app à intégrer dans les dépendences

Il faut référencer l'app à intégrer à 2 endroits:

Dans `client/src/index.js`:
```
import createLegacyEmbedsApp from '@openagenda/legacy/embeds/src';
```
et dans la liste des `apps`:
```
  ],
  [
    'legacyEmbeds',
    createLegacyEmbedsApp,
    [MainLayout, RequiredUser, AgendaAdminDataLayout, AgendaAdminLayout]
  ],
  [
```

Dans `middleware.js`, l'import (un require plutôt), puis la même chose.

Dans le 2ème cas, on fait référence à la version transpilée de l'app.

### cibul-node

Les ajouts sont à apporter à `webapp/index.js`. Un premier ajout doit compléter l'état initial de l'application intégrée (initialState), un deuxième s'assure que la route correspondant à la nouvelle application est bien attrapée (dernier 'get').

 ## Références

  * Commits 'guide' sur trello: https://trello.com/c/v5QV1qS6/1123-commit-minimaliste-qui-ajoute-une-app-a-react-integration-apps
