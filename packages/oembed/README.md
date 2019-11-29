# Overview

Service that relies on iframely to provide fonctionnality to extract urls from texts and retrieve their corresponding embed codes when they exist for a pre-set list of domains given at initialization.

# Methods

## Instanciate

  const OEmbed = require('@openagenda/oembed');

  const oe = new OEmbed({
    iframely: {
      key: 'youriframelykey'
    },
    filters: [
      'youtube',
      'calameo',
      `twitter\.com\/.+\/status\/[0-9]+$` // regex
    ]
  });

## Get

Get an oembed result from a single url.

    const {
      html // <iframe ... />
    } = oe.get('http://fr.calameo.com/read/00096250654676c5c42f2');

See tests 01.

## fromMarkdown

Takes an object of markdown texts and returns a list of link / data pairs (`[{link, data: { html, url, type, .. } }]`)

    const linkDataPairs = await oe.fromMarkdown({
      fr: 'Un texte en markdown avec des [liens](http://fr.calameo.com/read/00096250654676c5c42f2)'
    });

See tests 02.

## injectEmbeds

Given a list of link and data pairs, and an html text, returns the html with embeds replacing matching links.

    const htmlWithEmbeds = oe.injectEmbeds(someHTML, [{link, data}]);

See tests 03.
