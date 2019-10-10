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

      <script
        src="https://code.jquery.com/jquery-3.4.1.min.js"
        integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
        crossOrigin="anonymous"
      ></script>
      <script
        src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"
        integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa"
        crossOrigin="anonymous"
      ></script>

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
