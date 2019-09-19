import React from 'react';
import Helmet from 'react-helmet';
import serialize from 'serialize-javascript';


function Html( { content, lang, initialState, extractor } ) {
  const head = Helmet.renderStatic();

  return (
    <html lang={lang}>
    <head>
      {head.base.toComponent()}
      {head.title.toComponent()}
      {head.meta.toComponent()}
      {head.link.toComponent()}
      {head.script.toComponent()}

      <link rel="stylesheet" href="/css/oasfmain.css?v=2"/>

      {extractor ? extractor.getLinkElements() : null}
    </head>
    <body>
    <div id="root" dangerouslySetInnerHTML={{ __html: content }} />

    {initialState && (
      <script
        dangerouslySetInnerHTML={{
          __html: `window.__PRELOADED__=true;window.__data=${serialize(initialState, { isJSON: true })};`
        }}
        charSet="UTF-8"
      />
    )}

    {extractor ? extractor.getScriptElements() : null}
    </body>
    </html>
  );
}

export default Html;
