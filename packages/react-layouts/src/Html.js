import React from 'react';

function Html( { helmet, content, lang, initialState, extractor } ) {
  const htmlAttrs = helmet.htmlAttributes.toComponent();
  const bodyAttrs = helmet.bodyAttributes.toComponent();

  return (
    <html lang={lang} {...htmlAttrs}>
    <head>
      {helmet.base.toComponent()}
      {helmet.title.toComponent()}
      {helmet.meta.toComponent()}
      {helmet.link.toComponent()}
      {helmet.script.toComponent()}
      {helmet.style.toComponent()}

      <link rel="stylesheet" href="/css/oasfmain.css?v=2"/>

      {extractor ? extractor.getLinkElements() : null}
    </head>
    <body {...bodyAttrs}>
    <div id="root" dangerouslySetInnerHTML={{ __html: content }} />

    {initialState && (
      <script
        type="application/json"
        id="initialState"
        charSet="UTF-8"
        dangerouslySetInnerHTML={{ __html: initialState }}
      />
    )}

    {extractor ? extractor.getScriptElements() : null}
    </body>
    </html>
  );
}

export default Html;
