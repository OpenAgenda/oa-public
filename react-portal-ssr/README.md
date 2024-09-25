# React Portal SSR

Simple implementation of server side rendering of portals.

![version](https://badgen.net/npm/v/@openagenda/react-portal-ssr)
![license](https://badgen.net/npm/license/@openagenda/react-portal-ssr)
![size](https://badgen.net/bundlephobia/minzip/@openagenda/react-portal-ssr)

## Features

- Server side rendered portals
- Simple API
- Support multiple portals

## Installation

```shell
yarn add @openagenda/react-portal-ssr
```

or

```shell
npm install @openagenda/react-portal-ssr --save
```

## API

### `@openagenda/react-portal-ssr`

- `Portal`
- `prepareClientPortals`
- `PortalContext`

### `@openagenda/react-portal-ssr/server`

- `PortalServer(PortalContext)`
  - `collectPortals`
  - `appendPortals`
- `PortalContext`

## Example

### `server.js`

```js
import React from 'react';
import express from 'express';
import path from 'path';
import { renderToString, renderToStaticMarkup } from 'react-dom/server';
import { PortalContext } from '@openagenda/react-portal-ssr';
import { PortalServer } from '@openagenda/react-portal-ssr/server';
import { StaticRouter } from 'react-router-dom';
import { App } from './App';

const PORT = 3000;
const app = express();

app.use(express.static(path.join(__dirname, '../dist/public')));

app.use((req, res, next) => {
  // 1. Create the context to collect portals
  const portal = new PortalServer(PortalContext);

  // 2. Render content and collect portals
  const content = renderToString(portal.collectPortals(<App />));

  const html = renderToStaticMarkup(
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>React Portal SSR</title>
      </head>
      <body>
        <div id="app" dangerouslySetInnerHTML={{ __html: content }} />
        <div id="portal" />
        <script src="/vendor.js" />
        <script src="/main.js" />
      </body>
    </html>,
  );

  // 3. Append portals
  return res.send('<!DOCTYPE html>' + portal.appendPortals(html));
});

app.listen(PORT, () => {
  console.log(`SSR running on port ${PORT}`);
});
```

### `client.js`

```js
import React from 'react';
import { hydrate } from 'react-dom';
import { prepareClientPortals } from '@openagenda/react-portal-ssr';
import { App } from './App';

// Flush rendered portals
prepareClientPortals();

hydrate(<App />, document.getElementById('app'));
```

### `App.js`

```js
import React from 'react';
import { Portal } from '@openagenda/react-portal-ssr';

export default function App() {
  return (
    <Portal>
      <div>Hey</div>
    </Portal>
  );
}
```
