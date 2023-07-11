/* eslint-disable react/no-danger */

import React from 'react';

function Html({
  helmet,
  content,
  lang,
  initialState,
  extractor,
  translateMode,
  cspNonce,
}) {
  const htmlAttrs = helmet.htmlAttributes.toComponent();
  const bodyAttrs = helmet.bodyAttributes.toComponent();

  return (
    <html lang={lang} {...htmlAttrs}>
      <head>
        {helmet.base.toComponent()}
        {helmet.title.toComponent()}
        {helmet.meta.toComponent()}
        {helmet.link.toComponent()}

        <script
          type="text/javascript"
          nonce={cspNonce}
          dangerouslySetInnerHTML={{
            __html:
              'window._jipt = ['
              + "['project', 'openagenda'],"
              + "['escape', function() {"
              + "  document.cookie = 'translateMode=; expires=Thu, 01 Jan 1970 00:00:01 GMT;';"
              + '  window.location.reload();'
              + '}]]',
          }}
        />
        {translateMode ? (
          <script type="text/javascript" src="//cdn.crowdin.com/jipt/jipt.js" nonce={cspNonce} />
        ) : null}

        {helmet.script.toComponent()}
        {helmet.style.toComponent()}

        <script
          src="https://code.jquery.com/jquery-3.4.1.min.js"
          integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo="
          crossOrigin="anonymous"
          nonce={cspNonce}
        />
        <script
          src="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/js/bootstrap.min.js"
          integrity="sha384-Tc5IQib027qvyjSMfHjOMaLkfuWVxZxUPnCJA7l2mCWNIpG9mGCD8wGNIcPD7Txa"
          crossOrigin="anonymous"
          nonce={cspNonce}
        />

        <link rel="stylesheet" href="/css/oa-main.css?v=2" nonce={cspNonce} />

        {extractor ? extractor.getLinkElements({ nonce: cspNonce }) : null}
      </head>
      <body {...bodyAttrs}>
        <div id="outdated" />
        <div id="root" dangerouslySetInnerHTML={{ __html: content }} />

        {initialState && (
          <script
            type="application/json"
            id="initialState"
            charSet="UTF-8"
            dangerouslySetInnerHTML={{ __html: initialState }}
          />
        )}

        {extractor ? extractor.getScriptElements({ nonce: cspNonce }) : null}
      </body>
    </html>
  );
}

export default Html;
